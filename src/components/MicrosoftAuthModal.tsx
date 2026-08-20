import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Lock, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  HelpCircle, 
  FolderSync,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const MicrosoftAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    user, 
    loginWithMicrosoft, 
    logoutMicrosoft, 
    setManualMicrosoftToken, 
    isAuthenticatingMicrosoft,
    sharePointConfig,
    fetchFromSharePointUrl
  } = useDashboard();

  const [inputToken, setInputToken] = useState(user.microsoftAccessToken || '');
  const [tokenStatus, setTokenStatus] = useState<{ type: 'idle' | 'success' | 'error' | 'loading'; message: string }>({
    type: 'idle',
    message: ''
  });
  const [showManualToken, setShowManualToken] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleVerifyManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) {
      setTokenStatus({ type: 'error', message: 'Silakan masukkan Access Token Microsoft Anda.' });
      return;
    }

    setTokenStatus({ type: 'loading', message: 'Memverifikasi token Microsoft Graph...' });
    const res = await setManualMicrosoftToken(inputToken.trim());
    if (res.success) {
      setTokenStatus({ type: 'success', message: res.message });
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1500);
    } else {
      setTokenStatus({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl border border-[#c6d7c4] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-[#e2eae0] flex items-center justify-between bg-[#f8faf7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1e2e21] text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1a291c] font-['Space_Grotesk'] flex items-center gap-2">
                <span>Otentikasi Akun Microsoft (Akses Privat)</span>
              </h3>
              <p className="text-xs text-[#5f7561]">
                Akses dokumen Excel SharePoint yang diproteksi tanpa mengubah perizinan menjadi publik
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Private Security Guarantee Banner */}
          <div className="p-4 rounded-2xl bg-[#f2f7f1] border border-[#cfdfcd] space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Privasi Dokumen Terjamin (Role-Based Access)</span>
            </div>
            <p className="text-[11px] text-[#4d6650] leading-relaxed">
              File SharePoint Anda <strong>tetap berstatus Privat</strong> di lingkungan Microsoft 365. Dashboard akan mengakses dokumen menggunakan identitas akun Microsoft Anda yang telah diberi izin akses oleh admin.
            </p>
          </div>

          {/* Current Account Card */}
          <div className="p-4 rounded-2xl bg-white border-2 border-[#dbe6d9] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[11px] text-[#2c3f2d] uppercase tracking-wider">
                Status Akun Microsoft Saat Ini
              </span>
              {user.microsoftConnected ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Terotentikasi</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Belum Terhubung</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border border-[#c1d3bf]"
              />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#18271a] truncate">{user.name}</p>
                <p className="text-xs text-[#526b55] font-mono truncate">{user.email}</p>
                <p className="text-[10px] text-[#718b74] mt-0.5">{user.department}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#edf3ec] flex items-center justify-between gap-2">
              {user.microsoftConnected ? (
                <>
                  <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Akses Microsoft Graph: Files.Read.All aktif</span>
                  </span>
                  <button
                    type="button"
                    onClick={logoutMicrosoft}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Putuskan Akun</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={loginWithMicrosoft}
                  disabled={isAuthenticatingMicrosoft}
                  className="w-full py-2.5 px-4 bg-[#2b3e2d] hover:bg-[#1a281c] disabled:bg-gray-400 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <LogIn className={`w-4 h-4 ${isAuthenticatingMicrosoft ? 'animate-spin' : ''}`} />
                  <span>{isAuthenticatingMicrosoft ? 'Membuka Microsoft SSO...' : 'Login dengan Akun Microsoft / Telkom 365'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section: Manual Access Token Option (Ideal for enterprise SSO / Azure CLI) */}
          <div className="p-4 rounded-2xl bg-[#f8faf7] border border-[#d9e5d7] space-y-3">
            <button
              type="button"
              onClick={() => setShowManualToken(!showManualToken)}
              className="w-full flex items-center justify-between text-[#243726] font-extrabold text-xs"
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#3c593f]" />
                <span>Opsi: Masukkan Token Microsoft Graph / Azure AD Langsung</span>
              </div>
              {showManualToken ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showManualToken && (
              <form onSubmit={handleVerifyManualToken} className="space-y-3 pt-2">
                <p className="text-[10px] text-[#5e7762] leading-tight">
                  Jika organisasi Anda memiliki kebijakan Conditional Access ketat, Anda dapat menempelkan Bearer Token Microsoft Graph (dari Microsoft Graph Explorer atau Azure Portal).
                </p>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI..."
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#c1d3bf] rounded-xl font-mono text-[10px] text-[#1c2c1e] focus:ring-2 focus:ring-[#37523a] focus:outline-none shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    disabled={!inputToken.trim()}
                    className="px-4 py-2 bg-[#344d37] hover:bg-[#203222] disabled:bg-gray-300 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verifikasi & Simpan Token</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Status Feedback */}
          {tokenStatus.message && (
            <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              tokenStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
                : tokenStatus.type === 'error'
                ? 'bg-red-50 text-red-900 border border-red-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}>
              {tokenStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {tokenStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              {tokenStatus.type === 'loading' && <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />}
              <span>{tokenStatus.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#e2eae0] bg-[#f8faf7] flex items-center justify-between">
          <span className="text-[10px] text-[#6b826e] font-mono">
            {user.microsoftConnected ? `ID: ${user.email}` : 'Menunggu Otentikasi'}
          </span>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2d402f] hover:bg-[#1e2e21] text-white shadow-xs transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
