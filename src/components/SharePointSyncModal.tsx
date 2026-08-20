import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FolderSync, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Globe, 
  FileText,
  ShieldCheck,
  Zap,
  Sparkles,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  LogIn
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { downloadSampleTemplate } from '../utils/excelHelper';

export const SharePointSyncModal: React.FC = () => {
  const { 
    isSharePointModalOpen, 
    setIsSharePointModalOpen, 
    setIsAuthModalOpen,
    sharePointConfig, 
    setSharePointConfig, 
    handleExcelUpload,
    fetchFromSharePointUrl,
    isSyncing,
    user,
    loginWithMicrosoft,
    isAuthenticatingMicrosoft,
    clearAllData,
    openItems
  } = useDashboard();

  const [inputUrl, setInputUrl] = useState(sharePointConfig.shareLink || '');
  const [inputToken, setInputToken] = useState(sharePointConfig.authToken || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'idle' | 'success' | 'error' | 'loading'; text: string }>({
    type: sharePointConfig.lastFetchStatus === 'error' ? 'error' : sharePointConfig.lastFetchStatus === 'success' ? 'success' : 'idle',
    text: sharePointConfig.lastFetchMessage || ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSharePointModalOpen) return null;

  const handleFetchLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan masukkan tautan (URL) SharePoint atau file Excel.' });
      return;
    }

    setStatusMessage({ type: 'loading', text: 'Menghubungkan ke SharePoint dan mengunduh data real-time...' });
    const res = await fetchFromSharePointUrl(inputUrl.trim(), inputToken.trim());
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setStatusMessage({ type: 'loading', text: `Memproses ${file.name}...` });
    const res = await handleExcelUpload(file);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl border border-[#c9d8c8] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e2eae0] flex items-center justify-between bg-[#f8faf7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2b3d2d] text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1a281c] font-['Space_Grotesk']">
                Koneksi Real-Time SharePoint (Akses Privat Microsoft)
              </h3>
              <p className="text-xs text-[#637a65]">
                Tarik data nyata Open Item AR langsung dari tautan privat dengan akun Microsoft terotorisasi
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSharePointModalOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* User Account Login Status Banner */}
          <div className="p-3.5 rounded-2xl bg-[#f5f8f4] border border-[#d8e4d6] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl object-cover border border-[#b7ccb5]"
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-[#1a291c] text-xs">{user.name}</span>
                  {user.microsoftConnected ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Microsoft SSO Terotentikasi
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-300">
                      <Lock className="w-3 h-3 text-amber-600" /> Belum Login Microsoft
                    </span>
                  )}
                </div>
                <p className="text-[#59715d] text-[10px]">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!user.microsoftConnected ? (
                <button
                  type="button"
                  onClick={loginWithMicrosoft}
                  disabled={isAuthenticatingMicrosoft}
                  className="px-3 py-1.5 bg-[#253627] hover:bg-[#18261a] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Login Microsoft</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-[#eaf1e8] text-[#273d2a] border border-[#bcd0bc] font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Kelola Token</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Direct SharePoint Link Fetcher (Primary) */}
          <form onSubmit={handleFetchLink} className="p-5 rounded-2xl bg-[#f8faf7] border-2 border-[#c5d8c3] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-[#203122] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-emerald-800" />
                <span>Masukkan Link File SharePoint (Privat / Organisasi)</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                Akses Terproteksi
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://telkomcorp.sharepoint.com/:x:/r/teams/Finance/.../Open_Item_AR.xlsx"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full pl-3 pr-24 py-2.5 bg-white border border-[#c1d4bf] rounded-xl text-[#1e2e21] font-mono text-[11px] focus:ring-2 focus:ring-[#38523b] focus:outline-none shadow-xs"
                />
                <button
                  type="submit"
                  disabled={isSyncing || !inputUrl.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#2d4130] hover:bg-[#1f2f22] disabled:bg-gray-300 text-white font-bold rounded-lg text-[11px] transition-all flex items-center gap-1 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Tarik...' : 'Tarik Data'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#637d66] leading-tight">
                Anda dapat langsung menempel link SharePoint privat. Sistem akan menggunakan otentikasi Microsoft Graph dari akun Anda untuk menarik file secara aman.
              </p>
            </div>

            {/* Toggle Advanced Token if SharePoint is private */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] font-bold text-[#446247] hover:text-[#213523] flex items-center gap-1"
              >
                <span>Pengaturan Otorisasi Khusus (Bearer Token / Microsoft Graph)</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#d2dfd0] space-y-2">
                  <div>
                    <label className="block font-bold text-[#354837] text-[10px] mb-1">
                      Bearer Token / Access Token (Otomatis terisi saat login Microsoft SSO)
                    </label>
                    <input
                      type="password"
                      placeholder="eyJ0eXAiOiJKV1QiLC..."
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f7faf6] border border-[#d2dfd0] rounded-lg text-[#1e2e21] font-mono text-[10px] focus:ring-2 focus:ring-[#446046] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Auto-Sync settings */}
            <div className="pt-2 border-t border-[#e2ece0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modal-auto-sync"
                  checked={sharePointConfig.autoSync}
                  onChange={(e) => setSharePointConfig(prev => ({ ...prev, autoSync: e.target.checked }))}
                  className="rounded border-[#a9c2a8] text-[#345138] focus:ring-[#345138]"
                />
                <label htmlFor="modal-auto-sync" className="font-bold text-[#233525] text-[11px] cursor-pointer">
                  Aktifkan Auto-Sync Berkala
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#556e58] font-medium">Interval:</span>
                <select
                  value={sharePointConfig.syncIntervalSeconds}
                  onChange={(e) => setSharePointConfig(prev => ({ ...prev, syncIntervalSeconds: Number(e.target.value) }))}
                  className="px-2 py-1 bg-white border border-[#c5d8c3] rounded-lg text-[11px] font-semibold text-[#1e2e21]"
                >
                  <option value={10}>10 Detik</option>
                  <option value={30}>30 Detik</option>
                  <option value={60}>1 Menit</option>
                  <option value={300}>5 Menit</option>
                </select>
              </div>
            </div>
          </form>

          {/* Status Alert Banner */}
          {statusMessage.text && (
            <div className={`p-3.5 rounded-xl flex items-start gap-2.5 font-medium ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-900 border border-red-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}>
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />}
              {statusMessage.type === 'loading' && <RefreshCw className="w-4 h-4 text-blue-700 shrink-0 animate-spin mt-0.5" />}
              <span className="text-xs">{statusMessage.text}</span>
            </div>
          )}

          {/* Section 2: Direct File Drag & Drop Upload (Fallback) */}
          <div className="pt-2 border-t border-[#e2eae0]">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-[#233425] uppercase tracking-wider text-[11px]">
                Atau Upload File Excel Open Item (.xlsx / .csv)
              </label>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="flex items-center gap-1 text-[11px] font-bold text-[#324f35] hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Standar AR</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-emerald-600 bg-emerald-50/50 scale-[1.01]'
                  : 'border-[#c2d3c1] bg-[#fbfdfa] hover:bg-[#f3f7f1] hover:border-[#8fad8d]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#e8f1e6] text-[#3b593f] mx-auto flex items-center justify-center mb-1.5 shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs text-[#1e2e21]">
                Seret file Excel Open Item ke sini, atau klik untuk memilih file
              </p>
              <p className="text-[10px] text-[#6b826e] mt-0.5">
                Mendukung .xlsx, .xls, dan .csv
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#e2eae0] bg-[#f8faf7] flex items-center justify-between">
          <button
            type="button"
            onClick={clearAllData}
            className="text-xs text-red-700 hover:text-red-900 font-bold flex items-center gap-1.5 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Data Lokal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSharePointModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={async () => {
                if (inputUrl) {
                  await fetchFromSharePointUrl(inputUrl, inputToken);
                }
                setIsSharePointModalOpen(false);
              }}
              disabled={isSyncing}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2b3e2d] hover:bg-[#1d2d1f] text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
