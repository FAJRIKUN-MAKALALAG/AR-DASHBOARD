import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  OpenItemAR, 
  TindakLanjutAOC, 
  UserAccount, 
  SharePointConfig, 
  ActiveTab, 
  PengelolaanType,
  KategoriBelumInvoiced,
  AgingBucket
} from '../types';
import { parseExcelFile } from '../utils/excelHelper';
import { EMPTY_AOC_FOLLOWUPS, EMPTY_USER, STORAGE_KEYS } from '../constants/dashboard';
import { 
  FirebaseUser
} from '../lib/firebase';

interface DashboardMetrics {
  totalAR: number;
  arLayakTagih: number;
  arLayakTagihPercent: number;
  arTidakLayakTagih: number;
  arTidakLayakTagihPercent: number;
  belumInvoiced: number;
  belumInvoicedPercent: number;
  
  // Aging
  aging: {
    '0-3 Bulan': { value: number; percent: number; color: string };
    '4-12 Bulan': { value: number; percent: number; color: string };
    '13-24 Bulan': { value: number; percent: number; color: string };
    '>24 Bulan': { value: number; percent: number; color: string };
  };

  // Layak Tagih Breakdown
  layakTagihJakarta: number;
  layakTagihRegional: number;

  // Status Invoice
  statusSudahInvoiced: number;
  statusBelumInvoiced: number;

  // Belum Invoiced 5 Categories
  kategoriBreakdown: {
    kategori: KategoriBelumInvoiced;
    nilai: number;
    percent: number;
    isUpdated: boolean;
    uic: string;
    tindakLanjut: string;
    dueDate: string;
  }[];
}

interface DashboardContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  periode: string;
  setPeriode: (periode: string) => void;
  pengelolaan: PengelolaanType;
  setPengelolaan: (pengelolaan: PengelolaanType) => void;
  
  // Data
  openItems: OpenItemAR[];
  filteredItems: OpenItemAR[];
  aocFollowUps: TindakLanjutAOC[];
  metrics: DashboardMetrics;
  
  // User & Auth
  user: UserAccount;
  setUser: React.Dispatch<React.SetStateAction<UserAccount>>;
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  updateUserProfile: (updates: Partial<UserAccount>) => Promise<{ success: boolean; message: string }>;
  
  // Microsoft SSO Auth
  loginWithMicrosoft: () => Promise<void>;
  logoutMicrosoft: () => void;
  setManualMicrosoftToken: (token: string) => Promise<{ success: boolean; message: string }>;
  isAuthenticatingMicrosoft: boolean;
  
  // SharePoint Live Sync
  sharePointConfig: SharePointConfig;
  setSharePointConfig: React.Dispatch<React.SetStateAction<SharePointConfig>>;
  isSyncing: boolean;
  lastUpdatedText: string;
  refreshData: () => Promise<void>;
  fetchFromSharePointUrl: (urlOverride?: string, tokenOverride?: string) => Promise<{ success: boolean; message: string; count?: number; isPrivateRequiresAuth?: boolean }>;
  handleExcelUpload: (file: File) => Promise<{ success: boolean; message: string; count?: number }>;
  clearAllData: () => void;
  
  // UI & Modals
  presentationMode: boolean;
  setPresentationMode: (val: boolean) => void;
  selectedDrilldown: { title: string; category?: string; agingBucket?: AgingBucket; items: OpenItemAR[] } | null;
  setSelectedDrilldown: (val: { title: string; category?: string; agingBucket?: AgingBucket; items: OpenItemAR[] } | null) => void;
  editFollowUpItem: TindakLanjutAOC | null;
  setEditFollowUpItem: (item: TindakLanjutAOC | null) => void;
  isAddFollowUpOpen: boolean;
  setIsAddFollowUpOpen: (open: boolean) => void;
  isSharePointModalOpen: boolean;
  setIsSharePointModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  
  // Actions
  saveFollowUpItem: (item: TindakLanjutAOC) => void;
  addFollowUpItem: (item: Omit<TindakLanjutAOC, 'id' | 'lastUpdated'>) => void;
  deleteFollowUpItem: (id: string) => void;
  addNewOpenItem: (item: OpenItemAR) => void;
  updateOpenItem: (id: string, updates: Partial<OpenItemAR>) => void;
  deleteOpenItem: (id: string) => void;
  resetToDefaultData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [periode, setPeriode] = useState<string>('Semua Periode');
  const [pengelolaan, setPengelolaan] = useState<PengelolaanType>('Semua');
  
  // Raw real-time data from SharePoint / Excel - initialized clean
  const [openItems, setOpenItems] = useState<OpenItemAR[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.openItems);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [aocFollowUps, setAocFollowUps] = useState<TindakLanjutAOC[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.aocFollowUps);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return EMPTY_AOC_FOLLOWUPS;
  });

  // Firebase User & App state
  const [firebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading] = useState<boolean>(false);

  // User state
  const [user, setUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.userAccount);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'User Developer',
          email: parsed.email || 'dev@telkom.co.id',
          role: parsed.role || 'Finance AR Specialist',
          department: parsed.department || 'Divisi Finance & Collection Enterprise Telkom',
          division: parsed.division || 'ERS',
          avatarUrl: parsed.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=fajri`,
          isLoggedIn: true,
          jwtToken: parsed.jwtToken,
          authProvider: parsed.authProvider || 'demo',
          microsoftConnected: Boolean(parsed.microsoftConnected),
          microsoftAccessToken: parsed.microsoftAccessToken,
          microsoftTenant: parsed.microsoftTenant,
          microsoftAccountEmail: parsed.microsoftAccountEmail
        };
      } catch (e) { /* fallback */ }
    }
    const savedToken = localStorage.getItem(STORAGE_KEYS.microsoftToken) || '';
    return {
      name: 'User Developer',
      email: 'dev@telkom.co.id',
      role: 'Finance AR Specialist',
      department: 'Divisi Finance & Collection Enterprise Telkom',
      division: 'ERS',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=fajri`,
      isLoggedIn: true,
      authProvider: 'demo',
      microsoftConnected: Boolean(savedToken),
      microsoftAccessToken: savedToken,
      microsoftAccountEmail: ''
    };
  });

  const [isAuthenticatingMicrosoft, setIsAuthenticatingMicrosoft] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // SharePoint Real-Time Live Config
  const [sharePointConfig, setSharePointConfig] = useState<SharePointConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.sharePointConfig);
    const savedToken = localStorage.getItem(STORAGE_KEYS.microsoftToken) || '';
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          authToken: savedToken || parsed.authToken || ''
        };
      } catch (e) { /* fallback */ }
    }
    return {
      siteUrl: 'https://telkomcorp.sharepoint.com/teams/Finance-Enterprise-AR',
      shareLink: 'demo',
      filePath: '/Shared Documents/Open_Item_AR_Live.xlsx',
      driveName: 'General Financial Documents',
      tenantId: 'common',
      clientId: '',
      authToken: savedToken,
      isPrivateRequiresAuth: false,
      autoSync: false,
      syncIntervalSeconds: 30,
      lastSyncTime: 'Belum disinkronkan',
      isConnected: false,
      lastFetchStatus: 'idle',
      lastFetchMessage: '',
      fetchedCount: 0,
      mode: 'empty'
    };
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>(
    openItems.length > 0 ? `Tersinkronisasi (${openItems.length} Record)` : 'Menunggu Link SharePoint'
  );
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  
  // Modals
  const [selectedDrilldown, setSelectedDrilldown] = useState<{ title: string; category?: string; agingBucket?: AgingBucket; items: OpenItemAR[] } | null>(null);
  const [editFollowUpItem, setEditFollowUpItem] = useState<TindakLanjutAOC | null>(null);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState<boolean>(false);
  const [isSharePointModalOpen, setIsSharePointModalOpen] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
      localStorage.setItem(STORAGE_KEYS.openItems, JSON.stringify(openItems));
  }, [openItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.aocFollowUps, JSON.stringify(aocFollowUps));
  }, [aocFollowUps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.userAccount, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sharePointConfig, JSON.stringify(sharePointConfig));
  }, [sharePointConfig]);

  // Synchronize AOC follow up table based on real openItems
  const syncAocFromOpenItems = useCallback((items: OpenItemAR[]) => {
    const categories: KategoriBelumInvoiced[] = ['Kontrak', 'BAST / BAPP', 'Rekon / SLG', 'Termin', 'Identifikasi'];
    const updatedFollowUps: TindakLanjutAOC[] = categories.map((cat, i) => {
      const matching = items.filter(p => p.kategoriBelumInvoiced === cat && p.statusInvoice === 'Belum Invoiced');
      const sumMiliar = +(matching.reduce((acc, curr) => acc + (curr.nilaiAR || 0), 0) / 1000000000).toFixed(2);
      const first = matching[0];
      
      return {
        id: `AOC-${cat.replace(/[^a-zA-Z0-9]/g, '')}-${i + 1}`,
        kategori: cat,
        nilai: sumMiliar,
        tindakLanjut: first?.tindakLanjut || (sumMiliar > 0 ? 'Percepatan proses administrasi & koordinasi PIC' : 'Tidak ada open item pada kategori ini'),
        uic: first?.uic || (cat === 'Kontrak' ? 'Segmen, Legal & Pelanggan' : cat === 'BAST / BAPP' ? 'CGA, Segmen & Pelanggan' : cat === 'Rekon / SLG' ? 'Billing & Collection' : cat === 'Termin' ? 'Project Manager & Finance' : '-'),
        dueDate: first?.dueDate || (sumMiliar > 0 ? 'Q3' : '-'),
        status: sumMiliar > 0 ? 'In Progress' : 'Open',
        lastUpdated: 'Tersinkronisasi'
      };
    });

    setAocFollowUps(updatedFollowUps);
  }, []);

  const updateUserProfile = async (updates: Partial<UserAccount>): Promise<{ success: boolean; message: string }> => {
    try {
      setUser(prev => {
        const next = { ...prev, ...updates };
        localStorage.setItem(STORAGE_KEYS.userAccount, JSON.stringify(next));
        return next;
      });

      if (updates.division) {
        setPengelolaan(updates.division);
      }

      return { success: true, message: 'Profil berhasil diperbarui.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal memperbarui profil.' };
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'Logged in as demo user' };
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    role?: string, 
    dept?: string,
    division?: PengelolaanType
  ): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'Registered as demo user' };
  };

  const loginWithGooglePopup = async (googleEmail?: string, googleName?: string, chosenDivision?: PengelolaanType): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'Logged in as demo user' };
  };

  const logout = async () => {
    setIsLoginModalOpen(true);
  };

  // Fetch real-time data from user-entered SharePoint Link (with Microsoft SSO Auth support)
  const fetchFromSharePointUrl = async (
    urlOverride?: string, 
    tokenOverride?: string
  ): Promise<{ success: boolean; message: string; count?: number; isPrivateRequiresAuth?: boolean }> => {
    const targetUrl = (urlOverride !== undefined ? urlOverride : sharePointConfig.shareLink || sharePointConfig.siteUrl).trim();
    const targetToken = tokenOverride !== undefined ? tokenOverride : (user.microsoftAccessToken || sharePointConfig.authToken || '');

    if (!targetUrl) {
      const msg = 'Silakan masukkan tautan (link) SharePoint atau Excel terlebih dahulu.';
      setSharePointConfig(prev => ({
        ...prev,
        lastFetchStatus: 'error',
        lastFetchMessage: msg
      }));
      return { success: false, message: msg };
    }

    setIsSyncing(true);
    setSharePointConfig(prev => ({
      ...prev,
      shareLink: targetUrl,
      lastFetchStatus: 'loading',
      lastFetchMessage: targetToken ? 'Mengakses file privat SharePoint dengan kredensial Microsoft terotentikasi...' : 'Menghubungkan ke SharePoint dan mengunduh data...'
    }));

    try {
      const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.jwtToken) {
        authHeaders['Authorization'] = `Bearer ${user.jwtToken}`;
      }

      const res = await fetch('/api/fetch-sharepoint', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ url: targetUrl, token: targetToken })
      });

      const data = await res.json();

      if (res.status === 429) {
        const rateLimitMsg = data.message || 'Batas sinkronisasi tercapai (Rate Limit). Mohon tunggu beberapa detik sebelum menyinkronkan kembali.';
        setSharePointConfig(prev => ({
          ...prev,
          lastFetchStatus: 'error',
          lastFetchMessage: rateLimitMsg
        }));
        setIsSyncing(false);
        return { success: false, message: rateLimitMsg };
      }

      if (res.ok && data.success && Array.isArray(data.items)) {
        setOpenItems(data.items);
        syncAocFromOpenItems(data.items);

        const activeDivision = (user.division || 'ERS') as PengelolaanType;
        setPengelolaan(activeDivision);

        const userEmailKey = user.email || 'default';
        try {
          localStorage.setItem(`telkom_data_${userEmailKey}_open_items`, JSON.stringify(data.items));
          localStorage.setItem(`telkom_data_${userEmailKey}_sharepoint_link`, targetUrl);
        } catch (e) {}

        const divisionCount = data.items.filter((it: OpenItemAR) => it.pengelolaan === activeDivision).length;

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
        
        setLastUpdatedText(`SharePoint Privat (${data.items.length} Item) - ${timeStr}`);
        setSharePointConfig(prev => ({
          ...prev,
          shareLink: targetUrl,
          isConnected: true,
          isPrivateRequiresAuth: false,
          authMethodUsed: data.authMethod || 'authenticated',
          lastFetchStatus: 'success',
          lastFetchMessage: `Berhasil memuat ${data.items.length} data (${divisionCount} item Divisi ${activeDivision}) dari Microsoft SharePoint!`,
          fetchedCount: data.items.length,
          lastSyncTime: timeStr,
          mode: 'live_sharepoint'
        }));

        setIsSyncing(false);
        return {
          success: true,
          message: `Berhasil menarik data SharePoint! Menampilkan ${divisionCount} item untuk Divisi ${activeDivision} (total file: ${data.items.length} item).`,
          count: data.items.length
        };
      } else {
        const isAuthRequired = data.isPrivateRequiresAuth || res.status === 401 || res.status === 403;
        const errorMsg = data.message || 'Gagal mengakses file SharePoint.';

        setSharePointConfig(prev => ({
          ...prev,
          lastFetchStatus: 'error',
          lastFetchMessage: errorMsg,
          isConnected: false,
          isPrivateRequiresAuth: isAuthRequired
        }));

        if (isAuthRequired && !targetToken) {
          setIsAuthModalOpen(true);
        }

        setIsSyncing(false);
        return { 
          success: false, 
          message: errorMsg,
          isPrivateRequiresAuth: isAuthRequired
        };
      }
    } catch (err: any) {
      console.warn('SharePoint fetch encountered error:', err);
      const failMsg = `Gagal terhubung ke SharePoint: ${err?.message || 'Pastikan URL valid.'}`;
      
      setSharePointConfig(prev => ({
        ...prev,
        lastFetchStatus: 'error',
        lastFetchMessage: failMsg,
        isConnected: false
      }));
      setIsSyncing(false);
      return { success: false, message: failMsg };
    }
  };

  const loginWithMicrosoft = async () => {
    setIsAuthenticatingMicrosoft(true);
    try {
      const urlRes = await fetch('/api/auth/microsoft/url');
      const urlData = await urlRes.json();
      
      if (!urlData.authUrl) {
        throw new Error('Gagal membuat URL otorisasi Microsoft.');
      }

      const authWindow = window.open(
        urlData.authUrl,
        'microsoft_oauth_popup',
        'width=600,height=720,scrollbars=yes,status=yes,location=yes'
      );

      if (!authWindow) {
        setIsAuthModalOpen(true);
        setIsAuthenticatingMicrosoft(false);
        alert('Browser Anda memblokir popup. Silakan izinkan popup untuk login Microsoft, atau gunakan opsi input Token.');
        return;
      }

      const handleAuthMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'MS_AUTH_SUCCESS') {
          const accessToken = event.data.accessToken;
          if (accessToken) {
            localStorage.setItem(STORAGE_KEYS.microsoftToken, accessToken);
            
            try {
              const verifyRes = await fetch('/api/auth/microsoft/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: accessToken })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success && verifyData.user) {
                setUser(prev => ({
                  ...prev,
                  name: verifyData.user.name || prev.name,
                  email: verifyData.user.email || prev.email,
                  microsoftConnected: true,
                  microsoftAccessToken: accessToken,
                  microsoftAccountEmail: verifyData.user.email
                }));
              } else {
                setUser(prev => ({
                  ...prev,
                  microsoftConnected: true,
                  microsoftAccessToken: accessToken
                }));
              }
            } catch (e) {
              setUser(prev => ({
                ...prev,
                microsoftConnected: true,
                microsoftAccessToken: accessToken
              }));
            }

            setSharePointConfig(prev => ({
              ...prev,
              authToken: accessToken,
              isPrivateRequiresAuth: false
            }));

            setIsAuthModalOpen(false);
            setIsAuthenticatingMicrosoft(false);

            if (sharePointConfig.shareLink) {
              await fetchFromSharePointUrl(sharePointConfig.shareLink, accessToken);
            }
          }
          window.removeEventListener('message', handleAuthMessage);
        } else if (event.data?.type === 'MS_AUTH_ERROR') {
          setIsAuthenticatingMicrosoft(false);
          alert(`Login Microsoft Gagal: ${event.data.errorDescription || event.data.error}`);
          window.removeEventListener('message', handleAuthMessage);
        }
      };

      window.addEventListener('message', handleAuthMessage);

    } catch (err: any) {
      console.error('Microsoft login error:', err);
      setIsAuthenticatingMicrosoft(false);
      setIsAuthModalOpen(true);
    }
  };

  const setManualMicrosoftToken = async (token: string): Promise<{ success: boolean; message: string }> => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, message: 'Token tidak boleh kosong.' };
    }

    try {
      const verifyRes = await fetch('/api/auth/microsoft/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken })
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        localStorage.setItem(STORAGE_KEYS.microsoftToken, cleanToken);
        setUser(prev => ({
          ...prev,
          name: verifyData.user?.name || prev.name,
          email: verifyData.user?.email || prev.email,
          microsoftConnected: true,
          microsoftAccessToken: cleanToken,
          microsoftAccountEmail: verifyData.user?.email
        }));

        setSharePointConfig(prev => ({
          ...prev,
          authToken: cleanToken,
          isPrivateRequiresAuth: false
        }));

        if (sharePointConfig.shareLink) {
          await fetchFromSharePointUrl(sharePointConfig.shareLink, cleanToken);
        }

        return { 
          success: true, 
          message: `Akun Microsoft ${verifyData.user?.name || ''} (${verifyData.user?.email || ''}) berhasil terhubung!` 
        };
      } else {
        localStorage.setItem(STORAGE_KEYS.microsoftToken, cleanToken);
        setUser(prev => ({
          ...prev,
          microsoftConnected: true,
          microsoftAccessToken: cleanToken
        }));
        setSharePointConfig(prev => ({
          ...prev,
          authToken: cleanToken,
          isPrivateRequiresAuth: false
        }));

        if (sharePointConfig.shareLink) {
          await fetchFromSharePointUrl(sharePointConfig.shareLink, cleanToken);
        }

        return { 
          success: true, 
          message: 'Token berhasil disimpan dan dicoba untuk sinkronisasi SharePoint!' 
        };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal memverifikasi token.' };
    }
  };

  const logoutMicrosoft = () => {
    localStorage.removeItem(STORAGE_KEYS.microsoftToken);
    setUser(prev => ({
      ...prev,
      microsoftConnected: false,
      microsoftAccessToken: undefined
    }));
    setSharePointConfig(prev => ({
      ...prev,
      authToken: '',
      isPrivateRequiresAuth: false
    }));
  };

  const handleExcelUpload = async (file: File): Promise<{ success: boolean; message: string; count?: number }> => {
    try {
      setIsSyncing(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.success || !Array.isArray(data.items)) {
        setIsSyncing(false);
        return { success: false, message: data.message || 'File Excel tidak berisi data yang valid atau kolom tidak sesuai.' };
      }

      setOpenItems(data.items);
      syncAocFromOpenItems(data.items);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
      setLastUpdatedText(`File Excel Backend: ${timeStr} (${data.items.length} Item)`);
      
      setSharePointConfig(prev => ({ 
        ...prev, 
        mode: 'excel_upload', 
        isConnected: true, 
        lastFetchStatus: 'success', 
        lastFetchMessage: data.message || `Berhasil memuat ${data.items.length} data dari file Excel lokal via Python!`,
        fetchedCount: data.items.length,
        lastSyncTime: timeStr
      }));

      setIsSyncing(false);
      return { success: true, message: data.message, count: data.items.length };
    } catch (err: any) {
      setIsSyncing(false);
      return { success: false, message: `Gagal membaca file Excel di backend: ${err.message}` };
    }
  };

  const clearAllData = () => {
    setOpenItems([]);
    setAocFollowUps(EMPTY_AOC_FOLLOWUPS);
    localStorage.removeItem(STORAGE_KEYS.openItems);
    localStorage.removeItem(STORAGE_KEYS.aocFollowUps);
    setLastUpdatedText('Data Dikosongkan');
    setSharePointConfig(prev => ({
      ...prev,
      mode: 'empty',
      isConnected: false,
      fetchedCount: 0,
      lastFetchStatus: 'idle',
      lastFetchMessage: 'Data telah dikosongkan.'
    }));
  };

  const resetToDefaultData = () => {
    clearAllData();
  };

  const refreshData = async () => {
    if (sharePointConfig.shareLink) {
      await fetchFromSharePointUrl();
    } else {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
        setLastUpdatedText(`Pembaruan: ${timeStr}`);
      }, 500);
    }
  };

  useEffect(() => {
    if (!sharePointConfig.autoSync || !sharePointConfig.shareLink) return;

    const intervalMs = Math.max((sharePointConfig.syncIntervalSeconds || 30) * 1000, 5000);
    const interval = setInterval(() => {
      fetchFromSharePointUrl(sharePointConfig.shareLink, sharePointConfig.authToken);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [sharePointConfig.autoSync, sharePointConfig.shareLink, sharePointConfig.syncIntervalSeconds, sharePointConfig.authToken]);

  // Auto-fetch mock data on mount from Python backend if no items exist
  useEffect(() => {
    if (openItems.length === 0) {
      fetchFromSharePointUrl("demo");
    }
  }, []);

  const saveFollowUpItem = (item: TindakLanjutAOC) => {
    const updated = aocFollowUps.map(fu => fu.id === item.id ? { ...item, lastUpdated: 'Baru saja' } : fu);
    setAocFollowUps(updated);
  };

  const addFollowUpItem = (item: Omit<TindakLanjutAOC, 'id' | 'lastUpdated'>) => {
    const newItem: TindakLanjutAOC = {
      ...item,
      id: `AOC-${Date.now()}`,
      lastUpdated: 'Baru saja'
    };
    setAocFollowUps(prev => [...prev, newItem]);
  };

  const deleteFollowUpItem = (id: string) => {
    setAocFollowUps(prev => prev.filter(fu => fu.id !== id));
  };

  const addNewOpenItem = (item: OpenItemAR) => {
    const updated = [item, ...openItems];
    setOpenItems(updated);
    syncAocFromOpenItems(updated);
  };

  const updateOpenItem = (id: string, updates: Partial<OpenItemAR>) => {
    const updated = openItems.map(p => p.id === id ? { ...p, ...updates } : p);
    setOpenItems(updated);
    syncAocFromOpenItems(updated);
  };

  const deleteOpenItem = (id: string) => {
    const updated = openItems.filter(p => p.id !== id);
    setOpenItems(updated);
    syncAocFromOpenItems(updated);
  };

  const filteredItems = useMemo(() => {
    return openItems.filter(item => {
      if (periode !== 'Semua Periode' && item.periode !== periode) {
        return false;
      }
      if (pengelolaan !== 'Semua' && item.pengelolaan !== pengelolaan) {
        return false;
      }
      return true;
    });
  }, [openItems, periode, pengelolaan]);

  const metrics: DashboardMetrics = useMemo(() => {
    const totalAR = filteredItems.reduce((acc, item) => acc + item.nilaiAR, 0);

    const itemsLayakTagih = filteredItems.filter(i => i.statusLayakTagih === 'Layak Tagih');
    const arLayakTagih = itemsLayakTagih.reduce((acc, item) => acc + item.nilaiAR, 0);
    const arLayakTagihPercent = totalAR > 0 ? (arLayakTagih / totalAR) * 100 : 0;

    const itemsTidakLayakTagih = filteredItems.filter(i => i.statusLayakTagih === 'Tidak Layak Tagih');
    const arTidakLayakTagih = itemsTidakLayakTagih.reduce((acc, item) => acc + item.nilaiAR, 0);
    const arTidakLayakTagihPercent = totalAR > 0 ? (arTidakLayakTagih / totalAR) * 100 : 0;

    const itemsBelumInvoiced = filteredItems.filter(i => i.statusInvoice === 'Belum Invoiced');
    const belumInvoiced = itemsBelumInvoiced.reduce((acc, item) => acc + item.nilaiAR, 0);
    const belumInvoicedPercent = totalAR > 0 ? (belumInvoiced / totalAR) * 100 : 0;

    const agingMap: Record<AgingBucket, { value: number; color: string }> = {
      '0-3 Bulan': { value: 0, color: '#4a6b4e' },
      '4-12 Bulan': { value: 0, color: '#355138' },
      '13-24 Bulan': { value: 0, color: '#253d28' },
      '>24 Bulan': { value: 0, color: '#162819' }
    };

    filteredItems.forEach(item => {
      if (agingMap[item.agingBucket]) {
        agingMap[item.agingBucket].value += item.nilaiAR;
      }
    });

    const aging = {
      '0-3 Bulan': {
        value: agingMap['0-3 Bulan'].value,
        percent: totalAR > 0 ? (agingMap['0-3 Bulan'].value / totalAR) * 100 : 0,
        color: agingMap['0-3 Bulan'].color
      },
      '4-12 Bulan': {
        value: agingMap['4-12 Bulan'].value,
        percent: totalAR > 0 ? (agingMap['4-12 Bulan'].value / totalAR) * 100 : 0,
        color: agingMap['4-12 Bulan'].color
      },
      '13-24 Bulan': {
        value: agingMap['13-24 Bulan'].value,
        percent: totalAR > 0 ? (agingMap['13-24 Bulan'].value / totalAR) * 100 : 0,
        color: agingMap['13-24 Bulan'].color
      },
      '>24 Bulan': {
        value: agingMap['>24 Bulan'].value,
        percent: totalAR > 0 ? (agingMap['>24 Bulan'].value / totalAR) * 100 : 0,
        color: agingMap['>24 Bulan'].color
      }
    };

    const layakTagihJakarta = itemsLayakTagih
      .filter(i => i.regionalCategory === 'Jakarta')
      .reduce((acc, item) => acc + item.nilaiAR, 0);

    const layakTagihRegional = itemsLayakTagih
      .filter(i => i.regionalCategory === 'Regional')
      .reduce((acc, item) => acc + item.nilaiAR, 0);

    const itemsSudahInvoiced = filteredItems.filter(i => i.statusInvoice === 'Sudah Invoiced');
    const statusSudahInvoiced = itemsSudahInvoiced.reduce((acc, item) => acc + item.nilaiAR, 0);
    const statusBelumInvoiced = belumInvoiced;

    const categories: KategoriBelumInvoiced[] = ['Kontrak', 'BAST / BAPP', 'Rekon / SLG', 'Termin', 'Identifikasi'];
    const totalBelumInvoiced = itemsBelumInvoiced.reduce((acc, i) => acc + i.nilaiAR, 0);

    const kategoriBreakdown = categories.map(cat => {
      const match = itemsBelumInvoiced.filter(i => i.kategoriBelumInvoiced === cat);
      const nilai = match.reduce((acc, i) => acc + i.nilaiAR, 0);
      const isUpdated = match.some(i => i.isUpdated);
      const first = match[0];

      return {
        kategori: cat,
        nilai,
        percent: totalBelumInvoiced > 0 ? (nilai / totalBelumInvoiced) * 100 : 0,
        isUpdated: isUpdated || false,
        uic: first?.uic || (cat === 'Kontrak' ? 'Segmen, Legal & Pelanggan' : cat === 'BAST / BAPP' ? 'CGA, Segmen & Pelanggan' : cat === 'Rekon / SLG' ? 'Billing & Collection' : cat === 'Termin' ? 'Project Manager & Finance' : '-'),
        tindakLanjut: first?.tindakLanjut || (nilai > 0 ? 'Percepatan proses administrasi & koordinasi PIC' : 'Tidak ada open item pada kategori ini'),
        dueDate: first?.dueDate || (nilai > 0 ? 'Q3' : '-')
      };
    });

    return {
      totalAR,
      arLayakTagih,
      arLayakTagihPercent,
      arTidakLayakTagih,
      arTidakLayakTagihPercent,
      belumInvoiced,
      belumInvoicedPercent,
      aging,
      layakTagihJakarta,
      layakTagihRegional,
      statusSudahInvoiced,
      statusBelumInvoiced,
      kategoriBreakdown
    };
  }, [filteredItems]);

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        periode,
        setPeriode,
        pengelolaan,
        setPengelolaan,
        openItems,
        filteredItems,
        aocFollowUps,
        metrics,
        user,
        setUser,
        firebaseUser,
        isAuthLoading,
        loginWithMicrosoft,
        logoutMicrosoft,
        setManualMicrosoftToken,
        isAuthenticatingMicrosoft,
        sharePointConfig,
        setSharePointConfig,
        isSyncing,
        lastUpdatedText,
        refreshData,
        fetchFromSharePointUrl,
        handleExcelUpload,
        clearAllData,
        presentationMode,
        setPresentationMode,
        selectedDrilldown,
        setSelectedDrilldown,
        editFollowUpItem,
        setEditFollowUpItem,
        isAddFollowUpOpen,
        setIsAddFollowUpOpen,
        isSharePointModalOpen,
        setIsSharePointModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        saveFollowUpItem,
        addFollowUpItem,
        deleteFollowUpItem,
        addNewOpenItem,
        updateOpenItem,
        deleteOpenItem,
        resetToDefaultData,
        updateUserProfile
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
