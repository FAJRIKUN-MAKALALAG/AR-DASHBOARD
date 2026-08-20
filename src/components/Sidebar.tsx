import React from 'react';
import { 
  LayoutGrid, 
  TrendingUp, 
  BarChart3, 
  Building2, 
  FileCheck, 
  FileText, 
  ListTodo, 
  FileSpreadsheet, 
  Settings, 
  HelpCircle, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  FolderSync
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapse }) => {
  const { activeTab, setActiveTab, setIsSharePointModalOpen, sharePointConfig } = useDashboard();

  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'ringkasan', label: 'Ringkasan AR', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'aging', label: 'Aging AR', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'layak-tagih', label: 'AR Layak Tagih', icon: <Building2 className="w-5 h-5" /> },
    { id: 'invoice-status', label: 'Invoice Status', icon: <FileCheck className="w-5 h-5" /> },
    { id: 'belum-invoiced', label: 'Belum Invoiced', icon: <FileText className="w-5 h-5" /> },
    { id: 'tindak-lanjut', label: 'Tindak Lanjut AOC', icon: <ListTodo className="w-5 h-5" /> },
    { id: 'laporan', label: 'Laporan', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside 
      id="sidebar-navigation"
      className={`bg-[#2c3b2e] text-[#d6ded5] transition-all duration-300 ease-in-out flex flex-col justify-between shrink-0 select-none shadow-xl border-r border-[#3a4d3d] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 pb-6 border-b border-[#3b4c3d]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1b251d] to-[#3a4f3d] border border-[#526a55] flex items-center justify-center shadow-md">
            {/* Telkom-inspired Wing/Finance Emblem */}
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-lg text-white font-['Space_Grotesk']">Telkom</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#415644] text-[#c9dfcc] font-medium">Finance</span>
              </div>
              <p className="text-[11px] text-[#9eb4a0] font-medium tracking-wide">Enterprise AR Monitoring</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#eaf1e8] text-[#1e2d21] font-bold shadow-sm'
                  : 'text-[#bccdbf] hover:bg-[#384a3b] hover:text-white'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'text-[#283b2c] scale-105' : 'text-[#9eb4a0]'}`}>
                {item.icon}
              </div>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}

        {/* SharePoint Live Status Indicator button */}
        <div className="pt-3">
          <button
            id="btn-sharepoint-sync-quick"
            onClick={() => setIsSharePointModalOpen(true)}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors border ${
              sharePointConfig.isConnected 
                ? 'bg-[#223024]/80 border-[#435946] text-[#b2c8b5] hover:bg-[#28382b]' 
                : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="relative flex items-center justify-center">
              <FolderSync className="w-4 h-4 text-[#8da891]" />
              <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${sharePointConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </div>
            {!collapsed && (
              <div className="text-left flex-1 truncate">
                <p className="font-semibold text-white truncate">SharePoint Live Sync</p>
                <p className="text-[10px] text-[#8fa792]">{sharePointConfig.mode === 'live_sharepoint' ? 'Online Auto-fetch' : 'Excel Linked'}</p>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Help Box & Collapse Action */}
      <div className="p-3 border-t border-[#3b4c3d]/60 space-y-3">
        {!collapsed && (
          <div className="p-3.5 rounded-2xl bg-[#344636]/90 border border-[#485e4a] text-center">
            <div className="w-8 h-8 rounded-full bg-[#415744] text-[#cfdec0] mx-auto flex items-center justify-center mb-2">
              <HelpCircle className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white mb-1">Butuh bantuan?</p>
            <p className="text-[11px] text-[#a9bfa9] leading-relaxed mb-3">
              Hubungi tim Finance untuk informasi lebih lanjut.
            </p>
            <a 
              href="mailto:makalalagfajrikun@gmail.com?subject=Bantuan%20AR%20Dashboard%20Telkom"
              className="block w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-[#273829] hover:bg-[#1e2d20] text-[#d6ded5] border border-[#526b55] transition-colors"
            >
              Hubungi
            </a>
          </div>
        )}

        {/* Collapse button */}
        <div className="flex items-center justify-between pt-1">
          {onToggleCollapse && (
            <button
              id="btn-toggle-sidebar"
              onClick={onToggleCollapse}
              aria-label="Toggle Sidebar"
              className="w-8 h-8 rounded-lg bg-[#384c3a] hover:bg-[#465e49] text-[#c9dfcc] flex items-center justify-center transition-colors mx-auto"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
