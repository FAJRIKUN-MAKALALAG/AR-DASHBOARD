import React from 'react';
import { 
  FileCheck2, 
  AlertTriangle, 
  Receipt,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiahMiliar } from '../utils/excelHelper';

export const MetricCards: React.FC = () => {
  const { metrics, filteredItems, setSelectedDrilldown } = useDashboard();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {/* 1. TOTAL AR */}
      <div 
        id="card-total-ar"
        onClick={() => setSelectedDrilldown({
          title: 'Total Open Item AR',
          items: filteredItems
        })}
        className="group bg-white rounded-2xl p-4 sm:p-5 border border-[#dce5dc] shadow-sm hover:shadow-md hover:border-[#adc3b0] transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#2c3d2e] text-[#ebf2ea] flex items-center justify-center font-bold text-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform">
            Rp
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold tracking-wider text-[#586f5c] uppercase mb-0.5">
              TOTAL AR
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1a291c] font-['Space_Grotesk'] truncate">
              {formatRupiahMiliar(metrics.totalAR)}
            </h2>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#718774] border-t border-[#eaf0e8] pt-2">
          <span>Semua Piutang Berjalan</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#415a45]" />
        </div>
      </div>

      {/* 2. AR LAYAK TAGIH */}
      <div 
        id="card-layak-tagih"
        onClick={() => setSelectedDrilldown({
          title: 'Daftar AR Layak Tagih',
          items: filteredItems.filter(i => i.statusLayakTagih === 'Layak Tagih')
        })}
        className="group bg-white rounded-2xl p-4 sm:p-5 border border-[#dce5dc] shadow-sm hover:shadow-md hover:border-[#adc3b0] transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#eaf4ea] text-[#345b38] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#cfe3d0]">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold tracking-wider text-[#586f5c] uppercase mb-0.5">
              AR LAYAK TAGIH
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1a291c] font-['Space_Grotesk'] truncate">
              {formatRupiahMiliar(metrics.arLayakTagih)}
            </h2>
            <p className="text-xs font-semibold text-[#5a745f] mt-0.5">
              {metrics.arLayakTagihPercent.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% dari AR
            </p>
          </div>
        </div>
      </div>

      {/* 3. TIDAK LAYAK TAGIH */}
      <div 
        id="card-tidak-layak-tagih"
        onClick={() => setSelectedDrilldown({
          title: 'Daftar AR Tidak Layak Tagih (Dispute / Macet)',
          items: filteredItems.filter(i => i.statusLayakTagih === 'Tidak Layak Tagih')
        })}
        className="group bg-white rounded-2xl p-4 sm:p-5 border border-[#eedfd0] shadow-sm hover:shadow-md hover:border-[#e2bf9f] transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#fdf2e7] text-[#c96924] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#f5dfc6]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold tracking-wider text-[#916243] uppercase mb-0.5">
              TIDAK LAYAK TAGIH
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#2d1f14] font-['Space_Grotesk'] truncate">
              {formatRupiahMiliar(metrics.arTidakLayakTagih)}
            </h2>
            <p className="text-xs font-semibold text-[#a5673d] mt-0.5">
              {metrics.arTidakLayakTagihPercent.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% dari AR
            </p>
          </div>
        </div>
      </div>

      {/* 4. BELUM INVOICED */}
      <div 
        id="card-belum-invoiced"
        onClick={() => setSelectedDrilldown({
          title: 'Daftar AR Belum Invoiced (Open Items)',
          items: filteredItems.filter(i => i.statusLayakTagih === 'Layak Tagih' && i.statusInvoice === 'Belum Invoiced')
        })}
        className="group bg-white rounded-2xl p-4 sm:p-5 border border-[#dce5dc] shadow-sm hover:shadow-md hover:border-[#adc3b0] transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#eff5ec] text-[#48634c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#d3e2d1]">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold tracking-wider text-[#586f5c] uppercase mb-0.5">
              BELUM INVOICED
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1a291c] font-['Space_Grotesk'] truncate">
              {formatRupiahMiliar(metrics.belumInvoiced)}
            </h2>
            <p className="text-xs font-semibold text-[#5a745f] mt-0.5">
              {metrics.belumInvoicedPercent.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% Layak Tagih
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
