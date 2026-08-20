import React from 'react';
import { 
  BarChart3, 
  Building2, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatNumberMiliar, formatRupiahMiliar } from '../utils/excelHelper';
import { AgingBucket } from '../types';

export const MiddleSection: React.FC = () => {
  const { metrics, filteredItems, setSelectedDrilldown } = useDashboard();

  const agingKeys: AgingBucket[] = ['0-3 Bulan', '4-12 Bulan', '13-24 Bulan', '>24 Bulan'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      {/* 1. AGING AR CARD */}
      <div 
        id="card-aging-ar-panel"
        className="bg-white rounded-2xl p-5 border border-[#dce5dc] shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#eaf2e8] text-[#344f37] flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold tracking-wider text-[#223324] uppercase font-['Space_Grotesk']">
            AGING AR
          </h3>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="space-y-3 flex-1 justify-center flex flex-col">
          {agingKeys.map((bucket) => {
            const data = metrics.aging[bucket];
            // Max bar reference (e.g. 70M for aesthetic scaling)
            const maxRef = Math.max(metrics.totalAR, 80);
            const barWidthPercent = Math.max(Math.min((data.value / maxRef) * 100, 100), 4);

            return (
              <div 
                key={bucket} 
                className="group cursor-pointer hover:bg-[#f6f9f5] p-1 rounded-lg transition-colors"
                onClick={() => setSelectedDrilldown({
                  title: `Aging AR: ${bucket}`,
                  agingBucket: bucket,
                  items: filteredItems.filter(i => i.agingBucket === bucket)
                })}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[#415644] group-hover:text-[#1e2d21] transition-colors">
                    {bucket}
                  </span>
                  <span className="font-bold text-[#1f2d21]">
                    {formatNumberMiliar(data.value)} M
                  </span>
                </div>
                
                {/* Visual Bar Track */}
                <div className="h-3.5 bg-[#edf3ec] rounded-full overflow-hidden p-0.5 border border-[#e1eae0]">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                    style={{ 
                      width: `${barWidthPercent}%`,
                      backgroundColor: data.color 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. AR LAYAK TAGIH REGIONAL */}
      <div 
        id="card-layak-tagih-regional"
        className="bg-white rounded-2xl p-5 border border-[#dce5dc] shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#eaf2e8] text-[#344f37] flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold tracking-wider text-[#223324] uppercase font-['Space_Grotesk']">
            AR LAYAK TAGIH
          </h3>
        </div>

        {/* Regional Breakdown Rows matching image */}
        <div className="space-y-3 flex-1 flex flex-col justify-center">
          {/* Jakarta */}
          <div 
            onClick={() => setSelectedDrilldown({
              title: 'AR Layak Tagih - Jakarta',
              category: 'Jakarta',
              items: filteredItems.filter(i => i.statusLayakTagih === 'Layak Tagih' && i.regionalCategory === 'Jakarta')
            })}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#f5f8f4] hover:bg-[#eaf1e8] border border-[#e2ece0] transition-colors cursor-pointer group"
          >
            <span className="text-sm font-bold text-[#2a3c2c]">Jakarta</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#17251a] font-['Space_Grotesk']">
                {formatRupiahMiliar(metrics.layakTagihJakarta)}
              </span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#48634c]" />
            </div>
          </div>

          {/* Regional */}
          <div 
            onClick={() => setSelectedDrilldown({
              title: 'AR Layak Tagih - Regional (Non-Jakarta)',
              category: 'Regional',
              items: filteredItems.filter(i => i.statusLayakTagih === 'Layak Tagih' && i.regionalCategory === 'Regional')
            })}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#f5f8f4] hover:bg-[#eaf1e8] border border-[#e2ece0] transition-colors cursor-pointer group"
          >
            <span className="text-sm font-bold text-[#2a3c2c]">Regional</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#17251a] font-['Space_Grotesk']">
                {formatRupiahMiliar(metrics.layakTagihRegional)}
              </span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#48634c]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. STATUS INVOICE */}
      <div 
        id="card-status-invoice-panel"
        className="bg-white rounded-2xl p-5 border border-[#dce5dc] shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#eaf2e8] text-[#344f37] flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold tracking-wider text-[#223324] uppercase font-['Space_Grotesk']">
            STATUS INVOICE
          </h3>
        </div>

        {/* Status Rows matching image */}
        <div className="space-y-3 flex-1 flex flex-col justify-center">
          {/* Sudah Invoiced */}
          <div 
            onClick={() => setSelectedDrilldown({
              title: 'Daftar Invoice Terbit (Sudah Invoiced)',
              items: filteredItems.filter(i => i.statusInvoice === 'Sudah Invoiced')
            })}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#f5f8f4] hover:bg-[#eaf1e8] border border-[#e2ece0] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-bold text-[#2a3c2c]">Sudah Invoiced</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#17251a] font-['Space_Grotesk']">
                {formatRupiahMiliar(metrics.statusSudahInvoiced)}
              </span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#48634c]" />
            </div>
          </div>

          {/* Belum Invoiced */}
          <div 
            onClick={() => setSelectedDrilldown({
              title: 'Daftar Open Item Belum Terbit Invoice',
              items: filteredItems.filter(i => i.statusInvoice === 'Belum Invoiced' && i.statusLayakTagih === 'Layak Tagih')
            })}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#fdf8f3] hover:bg-[#faefe2] border border-[#f5e4d2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#d47b2c] shrink-0" />
              <span className="text-sm font-bold text-[#3d2716]">Belum Invoiced</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#2d1b0d] font-['Space_Grotesk']">
                {formatRupiahMiliar(metrics.statusBelumInvoiced)}
              </span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#a15f27]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
