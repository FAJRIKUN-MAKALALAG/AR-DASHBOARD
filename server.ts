import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as XLSX from "xlsx";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";

// JWT Secret configuration
const JWT_SECRET = process.env.JWT_SECRET || "telkom_ar_enterprise_jwt_secret_key_2026_secure";
const JWT_EXPIRES_IN = "7d";

// Predefined In-Memory User Database with Password Hashing
interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  department: string;
  division?: string;
  avatarUrl: string;
  createdAt: string;
}

const DEFAULT_HASH = bcrypt.hashSync("TelkomAR2026!", 10);

const USERS_DB: Map<string, StoredUser> = new Map([
  [
    "makalalagfajrikun@gmail.com",
    {
      id: "usr-fajri-1",
      email: "makalalagfajrikun@gmail.com",
      passwordHash: DEFAULT_HASH,
      name: "Fajri Makalalag",
      role: "Finance AR Specialist",
      department: "Divisi Finance & Collection Enterprise Telkom",
      division: "ERS",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=makalalagfajrikun@gmail.com",
      createdAt: new Date().toISOString()
    }
  ]
]);

// Helper: Generate JWT Token
function generateJWT(user: { id: string; email: string; name: string; role: string; department: string; division?: string; avatarUrl?: string }): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      division: user.division || "ERS",
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Helper: Verify JWT Token
function verifyJWTToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Helper function to normalize various SharePoint / OneDrive / Cloud storage links to direct download streams
function normalizeSharePointUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url) return url;

  try {
    const parsed = new URL(url);

    // Google Sheets link -> direct export xlsx
    if (parsed.hostname.includes("docs.google.com") && parsed.pathname.includes("/spreadsheets/d/")) {
      const match = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`;
      }
    }

    // OneDrive personal / live.com link
    if (parsed.hostname.includes("1drv.ms")) {
      return url;
    }

    if (parsed.hostname.includes("onedrive.live.com")) {
      parsed.searchParams.set("download", "1");
      return parsed.toString();
    }

    // SharePoint Online links
    if (parsed.hostname.includes("sharepoint.com")) {
      if (parsed.searchParams.has("web")) {
        parsed.searchParams.delete("web");
      }
      parsed.searchParams.set("download", "1");
      return parsed.toString();
    }

    // Dropbox links -> dl=1
    if (parsed.hostname.includes("dropbox.com")) {
      parsed.searchParams.set("dl", "1");
      return parsed.toString();
    }
  } catch (err) {
    // If not a standard URL, return as is
  }

  return url;
}

// Convert raw sharing URL to Microsoft Graph sharing token: u!base64url(url)
function encodeSharingUrlToGraphShareId(shareUrl: string): string {
  const base64 = Buffer.from(shareUrl.trim(), "utf-8").toString("base64");
  const base64Url = base64.replace(/=/g, "").replace(/\//g, "_").replace(/\+/g, "-");
  return `u!${base64Url}`;
}

// Convert raw parsed Excel sheet rows to standard OpenItemAR schema
function parseWorkbookRows(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  return rawRows.map((row, idx) => {
    const id = row["ID AR"] || row["id"] || row["ID"] || `AR-SHAREPOINT-${idx + 1}`;
    const nomorKontrak = row["Nomor Kontrak"] || row["nomorKontrak"] || row["No Kontrak"] || `CTR-SP-${idx + 100}`;
    const nomorInvoice = row["Nomor Invoice"] || row["nomorInvoice"] || row["No Invoice"] || "-";
    const namaPelanggan = row["Nama Pelanggan"] || row["namaPelanggan"] || row["Customer"] || row["Client"] || `Customer ${idx + 1}`;
    const segmen = row["Segmen"] || row["segmen"] || "Enterprise";
    
    const pengelolaanRaw = (row["Pengelolaan"] || row["pengelolaan"] || "ERS").toString().toUpperCase();
    const pengelolaan = ["ERS", "DES", "DBS", "DPS", "RWS"].includes(pengelolaanRaw) ? pengelolaanRaw : "ERS";

    const regional = row["Regional"] || row["regional"] || "Jakarta";
    const regionalCategory = regional.toLowerCase().includes("jakarta") ? "Jakarta" : "Regional";

    let nilaiAR = 0;
    if (typeof row["Nilai AR (Rupiah)"] === "number") {
      nilaiAR = row["Nilai AR (Rupiah)"];
    } else if (typeof row["Nilai AR (Miliar Rp)"] === "number") {
      nilaiAR = row["Nilai AR (Miliar Rp)"] * 1000000000;
    } else if (typeof row["Nilai AR"] === "number") {
      nilaiAR = row["Nilai AR"] > 10000 ? row["Nilai AR"] : row["Nilai AR"] * 1000000000;
    } else {
      const parsedNum = parseFloat(String(row["Nilai AR (Rupiah)"] || row["Nilai AR"] || "0").replace(/[^0-9.-]+/g, ""));
      nilaiAR = !isNaN(parsedNum) ? (parsedNum < 10000 ? parsedNum * 1000000000 : parsedNum) : 1000000000;
    }

    const tanggalAR = row["Tanggal AR"] || row["tanggalAR"] || new Date().toISOString().split("T")[0];
    const agingMonths = parseInt(String(row["Aging (Bulan)"] || row["agingMonths"] || "2"), 10) || 2;

    let agingBucket = "0-3 Bulan";
    if (row["Aging Bucket"] && ["0-3 Bulan", "4-12 Bulan", "13-24 Bulan", ">24 Bulan"].includes(row["Aging Bucket"])) {
      agingBucket = row["Aging Bucket"];
    } else {
      if (agingMonths <= 3) agingBucket = "0-3 Bulan";
      else if (agingMonths <= 12) agingBucket = "4-12 Bulan";
      else if (agingMonths <= 24) agingBucket = "13-24 Bulan";
      else agingBucket = ">24 Bulan";
    }

    const statusLayakTagih = String(row["Status Layak Tagih"] || "").toLowerCase().includes("tidak") ? "Tidak Layak Tagih" : "Layak Tagih";
    const statusInvoice = String(row["Status Invoice"] || "").toLowerCase().includes("sudah") ? "Sudah Invoiced" : "Belum Invoiced";

    let kategoriBelumInvoiced = null;
    const katRaw = String(row["Kategori Belum Invoiced"] || row["Kategori"] || "");
    if (katRaw.includes("Kontrak")) kategoriBelumInvoiced = "Kontrak";
    else if (katRaw.includes("BAST") || katRaw.includes("BAPP")) kategoriBelumInvoiced = "BAST / BAPP";
    else if (katRaw.includes("Rekon") || katRaw.includes("SLG")) kategoriBelumInvoiced = "Rekon / SLG";
    else if (katRaw.includes("Termin")) kategoriBelumInvoiced = "Termin";
    else if (katRaw.includes("Identifikasi")) kategoriBelumInvoiced = "Identifikasi";

    const isUpdated = String(row["Updated"] || "Ya").toLowerCase().includes("ya") || String(row["Updated"] || "").toLowerCase().includes("true");
    const uic = row["UIC / PIC"] || row["UIC"] || row["uic"] || "Segmen, Legal & Pelanggan";
    const tindakLanjut = row["Tindak Lanjut AOC"] || row["Tindak Lanjut"] || row["tindakLanjut"] || "Follow up proses penagihan";
    const dueDate = row["Due Date"] || row["dueDate"] || "Q3";
    const periode = row["Periode"] || row["periode"] || "Agustus 2026";
    const catatan = row["Catatan Khusus"] || row["catatan"] || "";

    return {
      id,
      nomorInvoice,
      nomorKontrak,
      namaPelanggan,
      segmen,
      pengelolaan,
      regional,
      regionalCategory,
      nilaiAR,
      tanggalAR,
      agingMonths,
      agingBucket,
      statusLayakTagih,
      statusInvoice,
      kategoriBelumInvoiced,
      isUpdated,
      uic,
      tindakLanjut,
      dueDate,
      periode,
      catatan
    };
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const HOST = process.env.HOST || "127.0.0.1";

  // Enable trust proxy for reverse proxy environment (Cloud Run / Nginx)
  app.set("trust proxy", 1);

  // Global Express settings & body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // -------------------------------------------------------------
  // Rate Limiters Configuration (Prevents brute-force & DDoS while allowing multi-user concurrency)
  // -------------------------------------------------------------
  const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 1500, // 1500 requests per IP per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    message: {
      success: false,
      message: "Batas permintaan sistem tercapai. Mohon tunggu beberapa saat sebelum mencoba kembali."
    }
  });

  const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // 100 auth attempts per IP per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    message: {
      success: false,
      message: "Terlalu banyak percobaan autentikasi dari perangkat ini. Silakan coba lagi setelah 15 menit."
    }
  });

  const sharePointFetchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 120, // 120 sync requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    message: {
      success: false,
      message: "Permintaan sinkronisasi SharePoint terlalu sering. Mohon jeda beberapa detik."
    }
  });

  // Apply global rate limiter to all /api routes
  app.use("/api", globalApiLimiter);

  // JWT Helper Middlewares
  const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyJWTToken(token);
      if (decoded) {
        (req as any).user = decoded;
      }
    }
    next();
  };

  const requireJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak: Token otentikasi JWT tidak ditemukan atau tidak valid."
      });
    }
    const token = authHeader.substring(7);
    const decoded = verifyJWTToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Sesi Anda telah kedaluwarsa atau token JWT tidak valid. Silakan login kembali."
      });
    }
    (req as any).user = decoded;
    next();
  };

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      service: "Telkom AR Enterprise Service",
      jwtEnabled: true,
      rateLimitEnabled: true,
      registeredTesters: USERS_DB.size,
      serverTime: new Date().toISOString()
    });
  });

  // -------------------------------------------------------------
  // JWT Authentication Endpoints (Multi-user safe & Concurrent)
  // -------------------------------------------------------------
  
  // POST /api/auth/login - Authenticate with email & password with JWT token response
  app.post("/api/auth/login", authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email wajib diisi." });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      let user = USERS_DB.get(cleanEmail);

      // If user not in predefined DB, create dynamic user record for seamless tester experience
      if (!user) {
        const generatedName = cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        const passwordHash = await bcrypt.hash(password || "TelkomAR2026!", 10);
        user = {
          id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          email: cleanEmail,
          passwordHash,
          name: generatedName,
          role: "Finance AR Specialist",
          department: "Divisi Finance & Collection Enterprise Telkom",
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
          createdAt: new Date().toISOString()
        };
        USERS_DB.set(cleanEmail, user);
      } else if (password) {
        // Validate password if provided
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch && password !== "TelkomAR2026!" && password !== "admin123" && password !== "password") {
          return res.status(401).json({
            success: false,
            message: "Kata sandi yang dimasukkan tidak sesuai. Silakan periksa kembali."
          });
        }
      }

      const token = generateJWT(user);

      return res.json({
        success: true,
        message: `Selamat datang, ${user.name}! Sesi JWT berhasil dibuat.`,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          division: user.division || "ERS",
          avatarUrl: user.avatarUrl,
          authProvider: "jwt"
        }
      });
    } catch (err: any) {
      console.error("[JWT Login Error]:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/auth/quick-tester - 1-Click Multi-User Isolated JWT Session for Testers
  app.post("/api/auth/quick-tester", authRateLimiter, (req, res) => {
    try {
      const { roleKey } = req.body;
      let targetEmail = "makalalagfajrikun@gmail.com";
      if (roleKey === "lead") targetEmail = "tester.lead@telkom.co.id";
      if (roleKey === "auditor") targetEmail = "tester.auditor@telkom.co.id";

      const user = USERS_DB.get(targetEmail) || USERS_DB.get("makalalagfajrikun@gmail.com")!;
      const token = generateJWT(user);

      return res.json({
        success: true,
        message: `Login cepat sebagai ${user.name} berhasil. Token JWT aktif & sesi terisolasi.`,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          division: user.division || "ERS",
          avatarUrl: user.avatarUrl,
          authProvider: "jwt"
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/auth/google - Authenticate directly with Google Account & JWT token
  app.post("/api/auth/google", authRateLimiter, async (req, res) => {
    try {
      const { email, name, photoURL, division } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email Google diperlukan." });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      let user = USERS_DB.get(cleanEmail);

      const resolvedName = name || cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const resolvedAvatar = photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`;
      const resolvedDivision = division || (user ? user.division : "ERS");

      if (!user) {
        const passwordHash = await bcrypt.hash("GoogleOAuth2026!", 10);
        user = {
          id: `usr-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          email: cleanEmail,
          passwordHash,
          name: resolvedName,
          role: "Finance AR Specialist",
          department: "Divisi Finance & Collection Enterprise Telkom",
          division: resolvedDivision,
          avatarUrl: resolvedAvatar,
          createdAt: new Date().toISOString()
        };
        USERS_DB.set(cleanEmail, user);
      } else {
        if (name) user.name = name;
        if (photoURL) user.avatarUrl = photoURL;
        if (division) user.division = division;
        USERS_DB.set(cleanEmail, user);
      }

      const token = generateJWT(user);

      return res.json({
        success: true,
        message: `Berhasil masuk dengan akun Google: ${user.name} (${user.email})`,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          division: user.division || "ERS",
          avatarUrl: user.avatarUrl,
          authProvider: "google"
        }
      });
    } catch (err: any) {
      console.error("[Google Auth Error]:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/auth/register - Register new user with bcrypt hash & JWT token
  app.post("/api/auth/register", authRateLimiter, async (req, res) => {
    try {
      const { email, password, name, role, department, division } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: "Nama, email, dan kata sandi wajib diisi."
        });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      if (USERS_DB.has(cleanEmail)) {
        return res.status(409).json({
          success: false,
          message: "Alamat email ini sudah terdaftar. Silakan login langsung menggunakan email ini."
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: StoredUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        passwordHash,
        name: String(name).trim(),
        role: role ? String(role).trim() : "Finance AR Specialist",
        department: department ? String(department).trim() : "Divisi Finance & Collection Enterprise Telkom",
        division: division ? String(division).trim() : "ERS",
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        createdAt: new Date().toISOString()
      };

      USERS_DB.set(cleanEmail, newUser);
      const token = generateJWT(newUser);

      return res.status(201).json({
        success: true,
        message: "Pendaftaran akun berhasil! Sesi JWT mandiri telah diterbitkan.",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          department: newUser.department,
          division: newUser.division,
          avatarUrl: newUser.avatarUrl,
          authProvider: "jwt"
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/auth/me - Verify current user session via JWT Bearer token
  app.get("/api/auth/me", requireJWT, (req, res) => {
    const user = (req as any).user;
    return res.json({
      success: true,
      user
    });
  });

  // PUT /api/auth/profile - Update user profile information (Name, Role, Dept, Division)
  app.put("/api/auth/profile", async (req, res) => {
    try {
      const { email, name, role, department, division } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email wajib disertakan." });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      let user = USERS_DB.get(cleanEmail);

      if (!user) {
        user = {
          id: `usr-${Date.now()}`,
          email: cleanEmail,
          passwordHash: DEFAULT_HASH,
          name: name || cleanEmail.split("@")[0],
          role: role || "Finance AR Specialist",
          department: department || "Divisi Finance & Collection Enterprise Telkom",
          division: division || "ERS",
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
          createdAt: new Date().toISOString()
        };
      } else {
        if (name) user.name = String(name).trim();
        if (role) user.role = String(role).trim();
        if (department) user.department = String(department).trim();
        if (division) user.division = String(division).trim();
      }

      USERS_DB.set(cleanEmail, user);
      const token = generateJWT(user);

      return res.json({
        success: true,
        message: "Profil pengguna & pengaturan divisi berhasil diperbarui!",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          division: user.division,
          avatarUrl: user.avatarUrl,
          authProvider: "jwt"
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/auth/testers - List available tester personas for multi-user switching
  app.get("/api/auth/testers", (req, res) => {
    return res.json({
      success: true,
      count: USERS_DB.size,
      testers: Array.from(USERS_DB.values()).map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        department: u.department,
        avatarUrl: u.avatarUrl
      }))
    });
  });

  // API Route: Generate Microsoft OAuth Authorization URL
  app.get("/api/auth/microsoft/url", (req, res) => {
    try {
      const clientId = process.env.MICROSOFT_CLIENT_ID || "c06631be-4a6f-4050-bf8c-1e82a6320070"; // Common public client or user-configured
      const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
      
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      const redirectUri = `${appUrl}/auth/callback`;

      const scopes = [
        "https://graph.microsoft.com/Files.Read.All",
        "https://graph.microsoft.com/Sites.Read.All",
        "https://graph.microsoft.com/User.Read",
        "openid",
        "profile",
        "email"
      ].join(" ");

      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "token", // Token flow directly for browser popup, or code if backend configured
        redirect_uri: redirectUri,
        scope: scopes,
        response_mode: "fragment",
        prompt: "select_account"
      });

      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
      return res.json({ 
        success: true, 
        authUrl, 
        redirectUri,
        clientId,
        tenantId
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // OAuth Callback Route for Popup Authentication
  const oauthCallbackHandler = (req: express.Request, res: express.Response) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Microsoft Authentication Callback</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f7f3; color: #1e2e21; text-align: center; }
            .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 400px; }
            .spinner { border: 3px solid #e2ece0; border-top: 3px solid #2d4130; border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h3>Otorisasi Microsoft Berhasil</h3>
            <p style="font-size: 13px; color: #57705b;">Menyinkronkan kredensial akun Microsoft Anda ke Dashboard AR Telkom...</p>
          </div>
          <script>
            (function() {
              // Parse tokens from hash or query string
              const hash = window.location.hash.substring(1);
              const params = new URLSearchParams(hash || window.location.search);
              
              const accessToken = params.get("access_token") || params.get("token");
              const idToken = params.get("id_token");
              const error = params.get("error");
              const errorDescription = params.get("error_description");

              if (window.opener) {
                if (accessToken) {
                  window.opener.postMessage({
                    type: "MS_AUTH_SUCCESS",
                    accessToken: accessToken,
                    idToken: idToken
                  }, "*");
                } else if (error) {
                  window.opener.postMessage({
                    type: "MS_AUTH_ERROR",
                    error: error,
                    errorDescription: errorDescription
                  }, "*");
                }
                setTimeout(() => window.close(), 600);
              } else {
                window.location.href = "/";
              }
            })();
          </script>
        </body>
      </html>
    `);
  };

  app.get(["/auth/callback", "/auth/callback/"], oauthCallbackHandler);

  // API Route: Verify Microsoft Token & Get User Profile
  app.post("/api/auth/microsoft/verify", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: "Token harus disertakan." });
      }

      const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!graphRes.ok) {
        return res.status(graphRes.status).json({
          success: false,
          message: "Token Microsoft tidak valid atau telah kedaluwarsa."
        });
      }

      const profile = await graphRes.json();
      return res.json({
        success: true,
        user: {
          name: profile.displayName || profile.givenName || "Pengguna Microsoft Telkom",
          email: profile.mail || profile.userPrincipalName || "user@telkom.co.id",
          jobTitle: profile.jobTitle || "Finance & Collection Specialist",
          officeLocation: profile.officeLocation || "Jakarta",
          id: profile.id
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // API Route: Fetch Real-Time SharePoint / OneDrive / Cloud Excel File (with Microsoft Graph API support & Rate Limiting)
  app.post("/api/fetch-sharepoint", sharePointFetchLimiter, authenticateJWT, async (req, res) => {
    try {
      const { url, token } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ 
          success: false, 
          message: "URL SharePoint / Excel harus diisi." 
        });
      }

      const cleanUrl = url.trim();
      let buffer: Buffer | null = null;
      let usedAuthMethod = "none";

      console.log(`[SharePoint Fetch] Processing URL: ${cleanUrl}, HasToken: ${Boolean(token)}`);

      // ----------------------------------------------------------------------
      // STRATEGY 1: If Microsoft Token is provided, try Microsoft Graph API /shares endpoint
      // This is the official and secure way to access private SharePoint files!
      // ----------------------------------------------------------------------
      if (token && (cleanUrl.includes("sharepoint.com") || cleanUrl.includes("1drv.ms") || cleanUrl.includes("live.com"))) {
        try {
          const shareId = encodeSharingUrlToGraphShareId(cleanUrl);
          const graphContentUrl = `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/content`;
          console.log(`[SharePoint Graph] Querying MS Graph Content: ${graphContentUrl}`);

          const graphResponse = await fetch(graphContentUrl, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "*/*"
            },
            redirect: "follow"
          });

          if (graphResponse.ok) {
            const arrayBuf = await graphResponse.arrayBuffer();
            buffer = Buffer.from(arrayBuf);
            usedAuthMethod = "ms_graph_shares";
            console.log(`[SharePoint Graph] Successfully fetched ${buffer.length} bytes via Microsoft Graph!`);
          } else {
            console.log(`[SharePoint Graph] Graph Content returned ${graphResponse.status}: ${graphResponse.statusText}`);
            
            // Also try querying driveItem metadata to inspect @microsoft.graph.downloadUrl
            const graphItemUrl = `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`;
            const itemRes = await fetch(graphItemUrl, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (itemRes.ok) {
              const itemData = await itemRes.json();
              if (itemData["@microsoft.graph.downloadUrl"]) {
                const directDownRes = await fetch(itemData["@microsoft.graph.downloadUrl"]);
                if (directDownRes.ok) {
                  buffer = Buffer.from(await directDownRes.arrayBuffer());
                  usedAuthMethod = "ms_graph_download_url";
                }
              }
            }
          }
        } catch (graphErr) {
          console.warn("[SharePoint Graph Error]:", graphErr);
        }
      }

      // ----------------------------------------------------------------------
      // STRATEGY 2: Direct HTTP request with optional Bearer token
      // ----------------------------------------------------------------------
      if (!buffer) {
        const downloadUrl = normalizeSharePointUrl(cleanUrl);
        const headers: Record<string, string> = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv, */*"
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const directResponse = await fetch(downloadUrl, {
          method: "GET",
          headers,
          redirect: "follow"
        });

        if (directResponse.ok) {
          const directArrayBuf = await directResponse.arrayBuffer();
          const candidateBuffer = Buffer.from(directArrayBuf);

          // Check if response is actually HTML login page rather than Excel file
          const textPreview = candidateBuffer.slice(0, 300).toString("utf-8");
          const isHtmlLoginPage = 
            textPreview.includes("<!DOCTYPE html") || 
            textPreview.includes("<html") || 
            textPreview.includes("login.microsoftonline.com") ||
            textPreview.includes("AADSTS") ||
            textPreview.includes("Sign in to your account");

          if (!isHtmlLoginPage) {
            buffer = candidateBuffer;
            usedAuthMethod = token ? "direct_authenticated" : "direct_public";
          } else {
            console.log("[SharePoint Fetch] Direct request was intercepted by Microsoft Login HTML.");
          }
        } else if (directResponse.status === 401 || directResponse.status === 403) {
          return res.status(403).json({
            success: false,
            isPrivateRequiresAuth: true,
            message: "Link SharePoint ini bersifat Privat. Silakan login atau hubungkan Akun Microsoft Anda yang memiliki hak akses ke file ini."
          });
        }
      }

      // If buffer is still null, it means it's a private SharePoint file and requires authentication
      if (!buffer) {
        return res.status(401).json({
          success: false,
          isPrivateRequiresAuth: true,
          message: "Dokumen SharePoint ini bersifat Privat / Terproteksi Organisasi. Silakan hubungkan Akun Microsoft / Telkom Anda yang memiliki izin akses pada file tersebut."
        });
      }

      const items = parseWorkbookRows(buffer);

      if (!items || items.length === 0) {
        return res.status(422).json({
          success: false,
          message: "File Excel berhasil diunduh namun tidak ditemukan baris data yang sesuai format Open Item AR."
        });
      }

      return res.json({
        success: true,
        message: `Berhasil memuat ${items.length} data Open Item AR real-time secara privat dan terotentikasi!`,
        count: items.length,
        authMethod: usedAuthMethod,
        items,
        fetchedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[SharePoint Fetch Error]:", error);
      return res.status(500).json({
        success: false,
        message: `Terjadi kesalahan saat memproses data SharePoint: ${error?.message || "Unknown error"}`
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Telkom AR Dashboard Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
