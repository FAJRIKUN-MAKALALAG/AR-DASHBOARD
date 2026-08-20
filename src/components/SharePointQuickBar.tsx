import React, { useState, useEffect } from 'react';
import { 
  FolderSync, 
  RefreshCw, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Trash2, 
  Lock, 
  ShieldCheck, 
  Key, 
  LogIn
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const SharePointQuickBar: React.FC = () => {
  const { 
    sharePointConfig, 
    fetchFromSharePointUrl, 
    isSyncing, 
    openItems, 
    setIsSharePointModalOpen,
    setIsAuthModalOpen,
    user,
    loginWithMicrosoft,
    isAuthenticatingMicrosoft,
    clearAllData
  } = useDashboard();

  const [inputUrl, setInputUrl] = useState(sharePointConfig.shareLink || '');

  useEffect(() => {
    if (sharePointConfig.shareLink && !inputUrl) {
      setInputUrl(sharePointConfig.shareLink);
    }
  }, [sharePointConfig.shareLink]);

  const handleQuickFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setIsSharePointModalOpen(true);
      return;
    }
    await fetchFromSharePointUrl(inputUrl.trim());
  };

  return (
    <div className="mb-5 bg-white/95 backdrop-blur-xs rounded-2xl p-4 border-2 border-[#ccdacc] shadow-sm transition-all space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Indicator with Private Mode Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#203222] text-white flex items-center justify-center shadow-xs">
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-xs text-[#1e2e20] uppercase tracking-wide font-['Space_Grotesk']">
                Akses Privat SharePoint Microsoft 365
              </span>

              {user.microsoftConnected ? (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 hover:bg-emerald-200 transition-colors"
                  title="Akun Microsoft Terhubung"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Akun: {user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 hover:bg-amber-200 transition-colors"
                >
                  <Key className="w-3 h-3 text-amber-700" />
                  <span>Perlu Login Microsoft</span>
                </button>
              )}

              {openItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{openItems.length} Data Real</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#607763] mt-0.5">
              Hanya akun terverifikasi yang dapat membaca dokumen Excel privat ini secara real-time
            </p>
          </div>
        </div>

        {/* Center/Right Live Link Input Bar */}
        <form onSubmit={handleQuickFetch} className="flex-1 max-w-2xl flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-3.5 h-3.5 text-[#6c8570] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Tempel (Paste) link private SharePoint Excel Anda di sini..."
              className="w-full pl-8 pr-3 py-2 bg-[#f6f9f5] border border-[#c5d8c3] rounded-xl text-xs text-[#1a291c] font-mono focus:ring-2 focus:ring-[#37523a] focus:bg-white focus:outline-none shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isSyncing}
            className="px-4 py-2 bg-[#2d402f] hover:bg-[#1e2d20] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menarik...' : 'Tarik Data'}</span>
          </button>
        </form>

        {/* Quick Tools & Auth Button */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          {!user.microsoftConnected ? (
            <button
              type="button"
              onClick={loginWithMicrosoft}
              disabled={isAuthenticatingMicrosoft}
              className="px-3 py-2 bg-[#273a29] hover:bg-[#19271b] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Login Microsoft</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-2 bg-[#eef4ed] hover:bg-[#e1ede0] text-[#2c3f2e] border border-[#cbdec9] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kelola Akun</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSharePointModalOpen(true)}
            className="px-3 py-2 bg-[#f0f5ee] hover:bg-[#e3eee0] text-[#2c3f2e] border border-[#c8d9c7] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            title="Buka Pengaturan Lengkap SharePoint / Upload File"
          >
            <Upload className="w-3.5 h-3.5 text-[#476049]" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {openItems.length > 0 && (
            <button
              type="button"
              onClick={clearAllData}
              className="p-2 hover:bg-red-50 text-red-700 border border-transparent hover:border-red-200 text-xs font-semibold rounded-xl transition-colors"
              title="Kosongkan data lokal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Private Auth Prompt Banner if authentication is required */}
      {sharePointConfig.isPrivateRequiresAuth && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Dokumen SharePoint bersifat Privat. Login dengan akun Microsoft Anda yang memiliki hak akses.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-lg text-xs shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Otentikasi Akun Saya</span>
          </button>
        </div>
      )}

      {/* Sync feedback notification */}
      {sharePointConfig.lastFetchMessage && !sharePointConfig.isPrivateRequiresAuth && (
        <div className={`pt-2 border-t border-[#e2eae0] flex items-center justify-between text-[11px] font-medium ${
          sharePointConfig.lastFetchStatus === 'error' ? 'text-red-700' : 'text-[#3e5941]'
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            {sharePointConfig.lastFetchStatus === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span className="truncate">{sharePointConfig.lastFetchMessage}</span>
          </div>

          <span className="text-[10px] text-[#718774] shrink-0 ml-2 font-mono">
            {sharePointConfig.lastSyncTime}
          </span>
        </div>
      )}
    </div>
  );
};
