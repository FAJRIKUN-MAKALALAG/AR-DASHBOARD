import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  LogIn,
  UserPlus,
  Briefcase,
  Eye,
  EyeOff,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  Users,
  Check
} from 'lucide-react';
import { useDashboard, TESTER_PERSONAS, TesterRoleKey } from '../context/DashboardContext';
import { PengelolaanType } from '../types';

interface LoginModalProps {
  forceGate?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ forceGate = false }) => {
  const { 
    user, 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    loginWithGooglePopup,
    loginWithEmail, 
    registerWithEmail, 
    quickLoginAsTester,
    logout
  } = useDashboard();

  const [mode, setMode] = useState<'google' | 'email' | 'register' | 'switch_tester'>('google');
  
  // Google quick input
  const [googleEmailInput, setGoogleEmailInput] = useState('makalalagfajrikun@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Fajri Makalalag');
  const [googleDivision, setGoogleDivision] = useState<PengelolaanType>('ERS');
  const [isGoogleFallback, setIsGoogleFallback] = useState(false);

  // Email / Password Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regDivision, setRegDivision] = useState<PengelolaanType>('ERS');
  const [regRole, setRegRole] = useState('Senior AR & AOC Specialist');
  const [regDept, setRegDept] = useState('Divisi Finance & Collection Enterprise');

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // If user is already logged in and this is not forced or opened manually, don't show
  if (!forceGate && !isLoginModalOpen) {
    return null;
  }

  // Handle Google Login Flow
  const handleGoogleSignIn = async (directEmail?: string, directName?: string) => {
    setIsLoading(true);
    setFeedback(null);

    const targetEmail = directEmail || (isGoogleFallback ? googleEmailInput : undefined);
    const targetName = directName || (isGoogleFallback ? googleNameInput : undefined);

    const res = await loginWithGooglePopup(targetEmail, targetName, googleDivision);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setIsLoginModalOpen(false);
      }, 700);
    } else {
      if (res.message === 'POPUP_FALLBACK_REQUIRED') {
        setIsGoogleFallback(true);
        setFeedback({ 
          type: 'error', 
          text: 'Popup browser dicegah di lingkungan preview. Silakan konfirmasi akun Google Anda di bawah tanpa perlu buat akun atau password baru!' 
        });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback({ type: 'error', text: 'Silakan masukkan alamat email dan kata sandi Anda.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    const res = await loginWithEmail(email, password);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setIsLoginModalOpen(false);
      }, 700);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regName) {
      setFeedback({ type: 'error', text: 'Nama lengkap, email, dan kata sandi wajib diisi.' });
      return;
    }

    if (regPassword.length < 6) {
      setFeedback({ type: 'error', text: 'Kata sandi minimal 6 karakter.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    const res = await registerWithEmail(regEmail, regPassword, regName, regRole, regDept, regDivision);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setIsLoginModalOpen(false);
      }, 700);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleQuickSwitch = async (key: TesterRoleKey) => {
    setIsLoading(true);
    setFeedback(null);
    const res = await quickLoginAsTester(key);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setIsLoginModalOpen(false);
      }, 700);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a120c]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#d2dfd2] flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Top Header / Branding */}
        <div className="relative px-7 pt-7 pb-3 text-center">
          {user.isLoggedIn && !forceGate && (
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f0f4f0] hover:bg-[#e2ebe2] text-[#425a45] flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b2b1e] to-[#3a523e] shadow-md shadow-[#233827]/15 mb-2.5 border border-[#48634c]">
            <span className="text-lg font-black tracking-tight text-white font-['Space_Grotesk']">
              TLK
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#142317] font-['Space_Grotesk'] tracking-tight">
            {mode === 'google' && 'Masuk dengan Akun Google'}
            {mode === 'email' && 'Masuk dengan Email & Sandi'}
            {mode === 'register' && 'Daftar Akun Baru & Divisi'}
            {mode === 'switch_tester' && 'Pilih Akun Profil'}
          </h2>
          <p className="text-xs text-[#637d66] mt-1 max-w-sm mx-auto">
            {mode === 'google' && 'Langsung masuk dengan akun Google Anda tanpa perlu repot membuat akun atau mengingat kata sandi baru.'}
            {mode === 'email' && 'Gunakan alamat email dan kata sandi yang telah terdaftar di sistem.'}
            {mode === 'register' && 'Tentukan divisi dan akun Anda untuk sinkronisasi otomatis dari link SharePoint.'}
            {mode === 'switch_tester' && 'Ganti profil akun untuk menguji isolasi data antar divisi (ERS, DES, DBS).'}
          </p>
        </div>

        {/* Tab Navigator */}
        <div className="px-7 pt-1 pb-2">
          <div className="flex bg-[#f1f5ef] p-1 rounded-xl border border-[#dce5db]">
            <button
              type="button"
              onClick={() => { setMode('google'); setFeedback(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'google' 
                  ? 'bg-white text-[#1f3022] shadow-xs' 
                  : 'text-[#68816c] hover:text-[#233726]'
              }`}
            >
              {/* Google G mini icon */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('email'); setFeedback(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'email' 
                  ? 'bg-white text-[#1f3022] shadow-xs' 
                  : 'text-[#68816c] hover:text-[#233726]'
              }`}
            >
              Email & Sandi
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setFeedback(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register' 
                  ? 'bg-white text-[#1f3022] shadow-xs' 
                  : 'text-[#68816c] hover:text-[#233726]'
              }`}
            >
              Daftar Baru
            </button>
            <button
              type="button"
              onClick={() => { setMode('switch_tester'); setFeedback(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'switch_tester' 
                  ? 'bg-white text-[#1f3022] shadow-xs' 
                  : 'text-[#68816c] hover:text-[#233726]'
              }`}
            >
              Profil
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-7 pb-6 pt-2 space-y-3.5 max-h-[70vh] overflow-y-auto">
          
          {/* Feedback Notification */}
          {feedback && (
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{feedback.text}</span>
            </div>
          )}

          {/* Mode 0: Google Sign-In (Primary & Instant) */}
          {mode === 'google' && (
            <div className="space-y-3.5">
              
              {/* Primary Google Login Button */}
              <button
                type="button"
                id="btn-google-signin"
                disabled={isLoading}
                onClick={() => handleGoogleSignIn()}
                className="w-full py-3 px-4 bg-white hover:bg-[#f8faf7] text-[#1c2e1f] font-bold text-xs rounded-2xl border-2 border-[#c8d8c8] hover:border-[#425d45] shadow-sm hover:shadow flex items-center justify-center gap-3 transition-all cursor-pointer group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#233525] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span className="text-sm">Buka Popup Masuk Akun Google</span>
                  </>
                )}
              </button>

              {/* 1-Tap Quick Selection for User's Google Account */}
              <div className="p-3.5 bg-gradient-to-br from-[#f2f8f2] to-[#e8f1e8] rounded-2xl border border-[#c4dbc4] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-xs font-bold text-[#1a2e1e]">Masuk Instan (1-Klik Tanpa Password)</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Otomatis Terdaftar
                  </span>
                </div>

                <div 
                  onClick={() => !isLoading && handleGoogleSignIn('makalalagfajrikun@gmail.com', 'Fajri Makalalag')}
                  className="p-3 bg-white hover:bg-[#ebf4eb] rounded-xl border border-[#b8d4b8] flex items-center justify-between gap-3 cursor-pointer shadow-2xs hover:shadow transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#203423] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      FM
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#142617] group-hover:text-emerald-900">
                          Fajri Makalalag
                        </p>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#253b28] text-white">
                          Divisi {googleDivision}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4f6b53]">makalalagfajrikun@gmail.com</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-[#233525] group-hover:bg-[#152317] text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shrink-0"
                  >
                    <span>Masuk</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Division Preference for Google User */}
              <div className="p-3 bg-[#f8faf7] rounded-2xl border border-[#d6e2d6] space-y-1.5">
                <label className="block text-xs font-semibold text-[#283d2a] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#425d45]" />
                  <span>Pilih Divisi Utama Akun Google Anda:</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['ERS', 'DES', 'DBS', 'DPS', 'RWS'] as PengelolaanType[]).map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setGoogleDivision(div)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        googleDivision === div
                          ? 'bg-[#233525] text-white border-[#233525] shadow-xs'
                          : 'bg-white text-[#425a45] border-[#cbd8cb] hover:bg-[#eaf1e7]'
                      }`}
                    >
                      {div}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#69846d]">
                  Setiap link SharePoint yang Anda masukkan akan langsung difilter untuk divisi <b>{googleDivision}</b>.
                </p>
              </div>

              {/* Direct Custom Google Email Input (If user has another @gmail.com) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsGoogleFallback(!isGoogleFallback)}
                  className="text-[11px] font-semibold text-[#446248] hover:text-[#1c2e1f] hover:underline flex items-center gap-1 cursor-pointer mx-auto"
                >
                  <span>{isGoogleFallback ? 'Sembunyikan Form Akun Lain' : 'Gunakan Alamat Email Google Lainnya?'}</span>
                </button>

                {isGoogleFallback && (
                  <div className="mt-2 p-3 bg-[#f8faf7] rounded-2xl border border-[#cbd8cb] space-y-2.5 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-[#283d2a] mb-1">
                        Email Google Anda
                      </label>
                      <input
                        type="email"
                        value={googleEmailInput}
                        onChange={(e) => setGoogleEmailInput(e.target.value)}
                        placeholder="contoh@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium focus:border-[#355138] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#283d2a] mb-1">
                        Nama Tampilan
                      </label>
                      <input
                        type="text"
                        value={googleNameInput}
                        onChange={(e) => setGoogleNameInput(e.target.value)}
                        placeholder="Nama Lengkap"
                        className="w-full px-3 py-2 bg-white border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium focus:border-[#355138] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleGoogleSignIn(googleEmailInput, googleNameInput)}
                      className="w-full py-2 bg-[#233525] hover:bg-[#162418] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Masuk Langsung dengan {googleEmailInput || 'Email Google'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Mode 1: Email & Password Login Form */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#283d2a] mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738e76]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com atau nama@telkom.co.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium placeholder-[#9ab09c] focus:bg-white focus:border-[#355138] focus:ring-2 focus:ring-[#355138]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#283d2a]">
                    Kata Sandi
                  </label>
                  <span className="text-[11px] text-[#4f6e52]">
                    Default: <code className="bg-[#eaf1e7] px-1 py-0.5 rounded text-[10px]">TelkomAR2026!</code>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738e76]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium placeholder-[#9ab09c] focus:bg-white focus:border-[#355138] focus:ring-2 focus:ring-[#355138]/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#738e76] hover:text-[#283d2a] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#cbd8cb] text-[#2b422e] focus:ring-[#2b422e] w-3.5 h-3.5"
                  />
                  <span className="text-xs text-[#526d55]">Ingat saya di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#233525] hover:bg-[#162418] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Masuk ke Ruang Kerja Saya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleEmailRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#283d2a] mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738e76]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Fajri Makalalag"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium placeholder-[#9ab09c] focus:bg-white focus:border-[#355138] focus:ring-2 focus:ring-[#355138]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#283d2a] mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738e76]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com atau nama@telkom.co.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium placeholder-[#9ab09c] focus:bg-white focus:border-[#355138] focus:ring-2 focus:ring-[#355138]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Division Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#283d2a] mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#425d45]" />
                  <span>Divisi / Pengelolaan Utama</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['ERS', 'DES', 'DBS', 'DPS', 'RWS'] as PengelolaanType[]).map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setRegDivision(div)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        regDivision === div
                          ? 'bg-[#233525] text-white border-[#233525] shadow-xs'
                          : 'bg-[#f8faf7] text-[#425a45] border-[#cbd8cb] hover:bg-[#eaf1e7]'
                      }`}
                    >
                      {div}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#69846d] mt-1">
                  Saat Anda memasukkan link SharePoint nanti, dashboard akan otomatis menyaring data untuk divisi <b>{regDivision}</b>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#283d2a] mb-1">
                    Role / Jabatan
                  </label>
                  <input
                    type="text"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium focus:bg-white focus:border-[#355138] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#283d2a] mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium focus:bg-white focus:border-[#355138] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#283d2a] mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738e76]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium placeholder-[#9ab09c] focus:bg-white focus:border-[#355138] focus:ring-2 focus:ring-[#355138]/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#738e76] hover:text-[#283d2a] cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#233525] hover:bg-[#162418] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Daftar & Masuk Ruang Kerja</span>
                    <UserPlus className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 3: Quick Switch Tester Personas */}
          {mode === 'switch_tester' && (
            <div className="space-y-2.5">
              <p className="text-xs text-[#526e56]">
                Pilih salah satu profil di bawah ini untuk beralih ruang kerja dan menguji isolasi data per divisi:
              </p>

              {(Object.keys(TESTER_PERSONAS) as TesterRoleKey[]).map((key) => {
                const persona = TESTER_PERSONAS[key];
                const isCurrent = user.email === persona.email;
                const div = key === 'analyst' ? 'ERS' : key === 'lead' ? 'DES' : 'DBS';
                return (
                  <div
                    key={key}
                    onClick={() => !isLoading && handleQuickSwitch(key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-[#f9fbf8] hover:bg-[#f1f6ef] border-[#d4dfd3]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={persona.avatarUrl}
                        alt={persona.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#c4d4c3]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#1a2d1d]">{persona.name}</p>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#283d2c] text-white">
                            Divisi {div}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#556e59]">{persona.email}</p>
                        <p className="text-[10px] text-[#78917c]">{persona.role}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white hover:bg-[#203223] text-[#203223] hover:text-white border border-[#c2d3c1]'
                      }`}
                    >
                      {isCurrent ? 'Aktif' : 'Pilih Akun'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Security Footer */}
        <div className="px-7 py-3 bg-[#f7faf6] border-t border-[#e2ece0] flex items-center justify-between text-[11px] text-[#69846c]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Penyimpanan Data Terenkripsi per Akun</span>
          </div>

          {user.isLoggedIn && (
            <button
              type="button"
              onClick={logout}
              className="text-red-700 hover:text-red-900 font-semibold hover:underline cursor-pointer"
            >
              Keluar Akun
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
