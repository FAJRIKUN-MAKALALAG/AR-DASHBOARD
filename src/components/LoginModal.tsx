import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Eye,
  EyeOff,
  X,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Globe
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface LoginModalProps {
  forceGate?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ forceGate = false }) => {
  const {
    user,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithGoogleRedirect,
    loginWithEmail,
    registerWithEmail,
    logout
  } = useDashboard();

  const [mode, setMode] = useState<'google' | 'email' | 'register'>('google');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState('Finance AR Specialist');
  const [regDept, setRegDept] = useState('Divisi Finance & Collection Enterprise Telkom');

  if (!forceGate && !isLoginModalOpen) {
    return null;
  }

  const closeModal = () => setIsLoginModalOpen(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFeedback(null);
    const res = await loginWithGoogleRedirect();
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      return;
    }

    setFeedback({ type: 'error', text: res.message });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback({ type: 'error', text: 'Silakan masukkan email dan kata sandi.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    const res = await loginWithEmail(email, password);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(closeModal, 700);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
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
    const res = await registerWithEmail(regEmail, regPassword, regName, regRole, regDept);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(closeModal, 700);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a120c]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#d2dfd2] flex flex-col overflow-hidden">
        <div className="relative px-7 pt-7 pb-3 text-center">
          <button
            type="button"
            onClick={() => {
              if (mode === 'google') {
                closeModal();
                return;
              }
              setMode('google');
              setFeedback(null);
            }}
            className="absolute top-5 left-5 w-8 h-8 rounded-full bg-[#f0f4f0] hover:bg-[#e2ebe2] text-[#425a45] flex items-center justify-center transition-colors cursor-pointer"
            title={mode === 'google' ? 'Tutup Modal' : 'Kembali'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {user.isLoggedIn && !forceGate && (
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f0f4f0] hover:bg-[#e2ebe2] text-[#425a45] flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b2b1e] to-[#3a523e] shadow-md shadow-[#233827]/15 mb-2.5 border border-[#48634c]">
            <span className="text-lg font-black tracking-tight text-white font-['Space_Grotesk']">
              TLK
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#142317] font-['Space_Grotesk'] tracking-tight">
            Masuk ke Dashboard
          </h2>
          <p className="text-xs text-[#637d66] mt-1 max-w-sm mx-auto">
            Login dengan Google OAuth, email & password, atau buat akun baru.
          </p>
        </div>

        <div className="px-7 pt-1 pb-2">
          <div className="flex bg-[#f1f5ef] p-1 rounded-xl border border-[#dce5db]">
            <button
              type="button"
              onClick={() => { setMode('google'); setFeedback(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'google' ? 'bg-white text-[#1f3022] shadow-xs' : 'text-[#68816c] hover:text-[#233726]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('email'); setFeedback(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'email' ? 'bg-white text-[#1f3022] shadow-xs' : 'text-[#68816c] hover:text-[#233726]'
              }`}
            >
              Email & Sandi
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setFeedback(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-[#1f3022] shadow-xs' : 'text-[#68816c] hover:text-[#233726]'
              }`}
            >
              Daftar
            </button>
          </div>
        </div>

        <div className="px-7 pb-6 pt-2 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {feedback && (
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
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

          {mode === 'google' && (
            <div className="space-y-3.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-white hover:bg-[#f8faf7] text-[#1c2e1f] font-bold text-xs rounded-2xl border-2 border-[#c8d8c8] hover:border-[#425d45] shadow-sm hover:shadow flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#233525] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Masuk dengan Google OAuth</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#637d66]">
                Setelah klik masuk, browser akan mengalihkan ke halaman Google resmi.
              </p>
            </div>
          )}

          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#283d2a] mb-1">Email Akun</label>
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
                  <label className="block text-xs font-semibold text-[#283d2a]">Kata Sandi</label>
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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#283d2a] mb-1">Nama Lengkap</label>
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
                <label className="block text-xs font-semibold text-[#283d2a] mb-1">Email Akun</label>
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#283d2a] mb-1">Role / Jabatan</label>
                  <input
                    type="text"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium focus:bg-white focus:border-[#355138] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#283d2a] mb-1">Departemen</label>
                  <input
                    type="text"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8faf7] border border-[#cbd8cb] rounded-xl text-xs text-[#1c2e1f] font-medium focus:bg-white focus:border-[#355138] focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#283d2a] mb-1">Kata Sandi Baru</label>
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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Daftar Akun</span>
                    <UserPlus className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

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
