import React from 'react';
import { Minimize2, RotateCw, Tv, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCards } from './MetricCards';
import { MiddleSection } from './MiddleSection';
import { BelumInvoicedSection } from './BelumInvoicedSection';
import { TindakLanjutTable } from './TindakLanjutTable';

export const PresentationView: React.FC = () => {
  const { setPresentationMode, periode, pengelolaan, lastUpdatedText, isSyncing, refreshData } = useDashboard();

  return (
    <div className="min-h-screen bg-[#f3f6f2] text-[#1c291d] p-6 lg:p-10 flex flex-col justify-between select-none">
      {/* Presentation Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[#d8e2d7] mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#28382a] text-white flex items-center justify-center shadow-md">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#162418] font-['Space_Grotesk']">
                ACCOUNT RECEIVABLE DASHBOARD
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#3c533e] text-white font-bold">
                PRESENTATION MODE
              </span>
            </div>
            <p className="text-sm font-semibold text-[#576e5a]">
              Monitoring AR & Follow Up AOC • Periode {periode} ({pengelolaan})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#4b634e] font-bold bg-white px-3 py-1.5 rounded-xl border border-[#d6e0d5] shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{lastUpdatedText}</span>
          </div>

          <button
            onClick={refreshData}
            disabled={isSyncing}
            className="p-2 rounded-xl bg-white border border-[#d6e0d5] text-[#2c402f] hover:bg-[#ebf2ea] shadow-xs transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setPresentationMode(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#293c2b] hover:bg-[#1c2b1e] text-white shadow-md transition-all active:scale-95"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Keluar Presentation Mode</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Elements */}
      <div className="space-y-6 flex-1">
        <MetricCards />
        <MiddleSection />
        <BelumInvoicedSection />
        <TindakLanjutTable />
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#d8e2d7] text-center text-xs text-[#6e8571] flex items-center justify-between">
        <p>Telkom Finance Enterprise • Real-time SharePoint Linked Dashboard</p>
        <p>Press Esc or click button to exit Presentation Mode</p>
      </div>
    </div>
  );
};
