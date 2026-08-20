import React, { useState } from 'react';
import { 
  Settings, 
  FolderSync, 
  User, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  RotateCcw,
  CheckCircle2,
  Link as LinkIcon,
  Trash2,
  AlertCircle,
  Lock,
  Key,
  LogIn,
  LogOut,
  UserCheck,
  Building2
} from 'lucide-react';
import { PengelolaanType } from '../../types';
import { useDashboard } from '../../context/DashboardContext';

export const PengaturanView: React.FC = () => {
  const { 
    sharePointConfig, 
    setSharePointConfig, 
    user, 
    setUser, 
    updateUserProfile,
    loginWithMicrosoft,
    logoutMicrosoft,
    setIsAuthModalOpen,
    logout,
    clearAllData,
    fetchFromSharePointUrl,
    isSyncing,
    firebaseUser
  } = useDashboard();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileResult, setProfileResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileResult(null);
    const res = await updateUserProfile({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      division: user.division
    });
    setProfileSaving(false);
    setProfileResult(res);
  };

  const handleTestFetch = async () => {
    if (!sharePointConfig.shareLink) {
      setTestResult({ success: false, message: 'Masukkan link SharePoint terlebih dahulu.' });
      return;
    }
    setTestResult(null);
    const res = await fetchFromSharePointUrl(sharePointConfig.shareLink, sharePointConfig.authToken);
    setTestResult({ success: res.success, message: res.message });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            Profil Pengguna, Divisi, dan Integrasi SharePoint
          </h2>
          <p className="text-xs text-[#627764] mt-0.5">
            Kelola profil aktif Anda, pilih divisi kerja, dan hubungkan akses SharePoint pribadi.
          </p>
        </div>
      </div>

      {/* Info Status Akun */}
      <div className="bg-white rounded-2xl border border-[#dce5dc] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#355138]" />
            <h3 className="font-extrabold text-sm text-[#1b2c1e] font-['Space_Grotesk']">
              Status Akun Aktif
            </h3>
          </div>
        </div>
        <p className="text-xs text-[#5e7561]">
          Login dengan Google OAuth, email & password, atau buat akun baru. Division diatur dari halaman ini setelah login.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account & Microsoft SSO Settings */}
        <div className="bg-white rounded-2xl border border-[#dce5dc] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#edf2ec]">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#355138]" />
              <h3 className="font-extrabold text-sm text-[#1b2c1e] font-['Space_Grotesk']">
                Profil & Status Pengguna Aktif
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Firebase Auth</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#f6f9f5] border border-[#e2ebe0]">
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-[#c1d3bf]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-extrabold text-sm text-[#1a291c] truncate">{user.name}</p>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {user.authProvider || 'Firebase'}
                </span>
              </div>
              <p className="text-xs text-[#556e58] font-mono truncate">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Firebase Session
                </span>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Secure Auth
                </span>
              </div>
            </div>
          </div>

          {/* Microsoft Login / Logout CTA */}
          <div className="p-3 bg-[#eef4ed] rounded-xl border border-[#cbdec9] flex items-center justify-between gap-2">
            <div className="text-xs">
              <p className="font-bold text-[#1f3022]">Status Otorisasi Dokumen Privat (Microsoft 365)</p>
              <p className="text-[10px] text-[#556e57]">
                {user.microsoftConnected 
                  ? 'Akun Microsoft aktif untuk membaca link SharePoint privat.' 
                  : 'Hubungkan akun untuk membuka akses dokumen privat.'}
              </p>
            </div>
            {user.microsoftConnected ? (
              <button
                type="button"
                onClick={logoutMicrosoft}
                className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putus Microsoft</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={loginWithMicrosoft}
                className="px-3.5 py-1.5 bg-[#2b3e2d] hover:bg-[#1b2a1d] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Login Microsoft</span>
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block font-bold text-[#354a37] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={e => setUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl text-[#1e2e21] font-semibold focus:ring-2 focus:ring-[#446046] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#354a37] mb-1">Alamat Email Terdaftar</label>
                <input
                  type="email"
                  value={user.email}
                  onChange={e => setUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl text-[#1e2e21] font-mono focus:ring-2 focus:ring-[#446046] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#354a37] mb-1">Role / Jabatan</label>
                <input
                  type="text"
                  value={user.role}
                  onChange={e => setUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl text-[#1e2e21] font-semibold focus:ring-2 focus:ring-[#446046] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#354a37] mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#355138]" />
                  <span>Divisi / Pengelolaan Aktif</span>
                </label>
                <select
                  value={user.division || 'ERS'}
                  onChange={e => setUser(prev => ({ ...prev, division: e.target.value as PengelolaanType }))}
                  className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl text-[#1e2e21] font-semibold focus:ring-2 focus:ring-[#446046] focus:outline-none"
                >
                  <option value="ERS">ERS</option>
                  <option value="DES">DES</option>
                  <option value="DBS">DBS</option>
                  <option value="DPS">DPS</option>
                  <option value="RWS">RWS</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#edf2ec] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs text-[#314a34] hover:text-[#18291b] font-bold flex items-center gap-1.5 hover:underline"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Kelola Token Microsoft</span>
                </button>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="text-xs text-[#314a34] hover:text-[#18291b] font-bold flex items-center gap-1.5 hover:underline disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{profileSaving ? 'Menyimpan...' : 'Simpan Profil'}</span>
                </button>
              </div>
            </form>

            {profileResult && (
              <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 font-bold ${
                profileResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-red-50 text-red-900 border-red-200'
              }`}>
                {profileResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span className="text-xs">{profileResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* SharePoint Live Settings */}
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#dce5dc] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#edf2ec]">
            <FolderSync className="w-5 h-5 text-[#355138]" />
            <h3 className="font-extrabold text-sm text-[#1b2c1e] font-['Space_Grotesk']">
              Parameter Link & Sinkronisasi SharePoint
            </h3>
          </div>

          <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#354a37] mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Link SharePoint / File Excel Live</span>
                </label>
              <input
                type="text"
                placeholder="https://telkomcorp.sharepoint.com/:x:/r/teams/Finance/.../Open_Item_AR.xlsx"
                value={sharePointConfig.shareLink}
                onChange={e => setSharePointConfig(prev => ({ ...prev, shareLink: e.target.value }))}
                className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl font-mono text-[11px] text-[#1e2e21] focus:ring-2 focus:ring-[#446046] focus:outline-none"
              />
            </div>

              <div>
                <label className="block font-bold text-[#354a37] mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#355138]" />
                  <span>Bearer Token Microsoft (Otomatis terisi saat SSO)</span>
                </label>
              <input
                type="password"
                placeholder="Token akan terisi otomatis saat Anda login Microsoft SSO..."
                value={sharePointConfig.authToken || ''}
                onChange={e => setSharePointConfig(prev => ({ ...prev, authToken: e.target.value }))}
                className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl font-mono text-[11px] text-[#1e2e21] focus:ring-2 focus:ring-[#446046] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#354a37] mb-1">Interval Polling</label>
                <select
                  value={sharePointConfig.syncIntervalSeconds}
                  onChange={e => setSharePointConfig(prev => ({ ...prev, syncIntervalSeconds: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl font-semibold text-[#1e2e21] focus:ring-2 focus:ring-[#446046] focus:outline-none"
                >
                  <option value={10}>10 Detik</option>
                  <option value={30}>30 Detik</option>
                  <option value={60}>1 Menit</option>
                  <option value={300}>5 Menit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#354a37] mb-1">Auto-Sync</label>
                <select
                  value={sharePointConfig.autoSync ? 'true' : 'false'}
                  onChange={e => setSharePointConfig(prev => ({ ...prev, autoSync: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl font-semibold text-[#1e2e21] focus:ring-2 focus:ring-[#446046] focus:outline-none"
                >
                  <option value="true">Aktif (Live Polling)</option>
                  <option value="false">Nonaktif (Manual)</option>
                </select>
              </div>
            </div>

            {testResult && (
              <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 font-bold ${
                testResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-red-50 text-red-900 border-red-200'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span className="text-xs">{testResult.message}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan berhasil disimpan!</span>
              </div>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-[#edf2ec]">
              <button
                type="button"
                onClick={handleTestFetch}
                disabled={isSyncing || !sharePointConfig.shareLink}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#eef4ed] hover:bg-[#e1ede0] text-[#2c402f] border border-[#cbdec9] flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Tes Tarik Data Privat</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2d4130] hover:bg-[#1f2f22] text-white shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
