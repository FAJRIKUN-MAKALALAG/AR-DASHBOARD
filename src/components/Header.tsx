import React from 'react';
import { 
  Tv, 
  Calendar, 
  ChevronDown, 
  RotateCw, 
  FolderSync, 
  Layers
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PengelolaanType } from '../types';

export const Header: React.FC = () => {
  const {
    periode,
    setPeriode,
    pengelolaan,
    setPengelolaan,
    lastUpdatedText,
    isSyncing,
    refreshData,
    presentationMode,
    setPresentationMode,
    user,
    setIsSharePointModalOpen,
    sharePointConfig,
    setActiveTab
  } = useDashboard();

  const periodOptions = [
    'Agustus 2026',
    'Juli 2026',
    'Juni 2026',
    'Mei 2026',
    'Semua Periode'
  ];

  const pengelolaanOptions: PengelolaanType[] = [
    'ERS',
    'DES',
    'DBS',
    'DPS',
    'RWS',
    'Semua'
  ];

  return (
    <header className="space-y-4 mb-5">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#1c2a1e] font-['Space_Grotesk']">
            ACCOUNT RECEIVABLE DASHBOARD
          </h1>
          <p className="text-sm font-medium text-[#687d6d] mt-0.5">
            Monitoring AR & Follow Up AOC
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Presentation Mode Button */}
          <button
            id="btn-presentation-mode"
            onClick={() => setPresentationMode(!presentationMode)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#f1f5ee] text-[#2c3d2e] border border-[#d6dfd5] shadow-sm transition-all active:scale-95"
            title="Buka Mode Presentasi / Kiosk"
          >
            <Tv className="w-4 h-4 text-[#445a46]" />
            <span>Presentation Mode</span>
          </button>

          {/* User Profile & Auth Trigger */}
          <div 
            id="user-profile-header"
            onClick={() => setActiveTab('profil')}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-white border border-[#d8e0d6] shadow-sm cursor-pointer hover:bg-[#f7faf5] transition-colors"
            title={`${user.name} (${user.email}) - Klik untuk melihat profil`}
          >
            <div className="text-right hidden md:block">
              <div className="flex items-center gap-1 justify-end">
                <p className="text-xs font-bold text-[#1f2d21] leading-none">{user.name}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {user.authProvider === 'google' ? 'Google' : user.authProvider === 'jwt' ? 'JWT' : 'Active'}
                </span>
              </div>
              <p className="text-[10px] text-[#718575] leading-tight mt-0.5">{user.role.split('&')[0]}</p>
            </div>
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-cover border border-[#c3d1c1]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-2.5 sm:p-3 border border-[#d7e1d6] shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Periode Dropdown */}
          <div className="flex items-center gap-2 bg-[#f4f7f2] px-3 py-1.5 rounded-xl border border-[#dbe4da]">
            <Calendar className="w-4 h-4 text-[#536c56]" />
            <span className="text-xs font-medium text-[#5a6f5e]">Periode</span>
            <div className="relative">
              <select
                id="select-periode"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="appearance-none bg-transparent pr-6 text-xs font-bold text-[#1e2e21] focus:outline-none cursor-pointer"
              >
                {periodOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#536c56] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Pengelolaan Dropdown */}
          <div className="flex items-center gap-2 bg-[#f4f7f2] px-3 py-1.5 rounded-xl border border-[#dbe4da]">
            <Layers className="w-4 h-4 text-[#536c56]" />
            <span className="text-xs font-medium text-[#5a6f5e]">Pengelolaan</span>
            <div className="relative">
              <select
                id="select-pengelolaan"
                value={pengelolaan}
                onChange={(e) => setPengelolaan(e.target.value as PengelolaanType)}
                className="appearance-none bg-transparent pr-6 text-xs font-bold text-[#1e2e21] focus:outline-none cursor-pointer"
              >
                {pengelolaanOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#536c56] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Live SharePoint Badge */}
          <button
            onClick={() => setIsSharePointModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eaf1e7] text-[#2c402f] border border-[#cbe0cb] text-[11px] font-semibold hover:bg-[#dce9d8] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>SharePoint Sync Active</span>
          </button>
        </div>

        {/* Right Timestamp & Refresh Action */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#526a55] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{lastUpdatedText}</span>
          </div>

          <button
            id="btn-refresh-dashboard"
            onClick={refreshData}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#344837] hover:bg-[#253627] text-white shadow-sm transition-all active:scale-95 disabled:opacity-75`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
