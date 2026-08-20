import React from 'react';
import { Building2, MapPin, CheckCircle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatRupiahMiliar } from '../../utils/excelHelper';

export const LayakTagihView: React.FC = () => {
  const { metrics, filteredItems, setSelectedDrilldown } = useDashboard();
  const layakItems = filteredItems.filter(i => i.statusLayakTagih === 'Layak Tagih');

  const jakartaItems = layakItems.filter(i => i.regionalCategory === 'Jakarta');
  const regionalItems = layakItems.filter(i => i.regionalCategory === 'Regional');

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            AR Layak Tagih & Portofolio Wilayah
          </h2>
          <p className="text-xs text-[#627764] mt-0.5">
            Monitoring piutang clean siap tagih dan distribusi regional
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-[#5c725f] uppercase">Total Layak Tagih</span>
          <p className="text-2xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            {formatRupiahMiliar(metrics.arLayakTagih)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Jakarta Panel */}
        <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#eaf4ea] text-[#345b38] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-[#1b2b1d] font-['Space_Grotesk']">
                Wilayah Jakarta
              </h3>
            </div>
            <span className="text-xs font-bold text-[#455c47] bg-[#edf4ec] px-2.5 py-1 rounded-lg">
              {jakartaItems.length} Kontrak
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#f5f8f4] border border-[#e2ece0] mb-4">
            <p className="text-xs font-bold text-[#5a715d] uppercase">Nilai AR Jakarta</p>
            <p className="text-3xl font-extrabold text-[#17251a] font-['Space_Grotesk'] mt-1">
              {formatRupiahMiliar(metrics.layakTagihJakarta)}
            </p>
            <p className="text-xs font-semibold text-emerald-700 mt-1">
              {((metrics.layakTagihJakarta / metrics.arLayakTagih) * 100).toFixed(1)}% dari Total Layak Tagih
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#354c37] uppercase tracking-wider">Top Pelanggan Jakarta</p>
            {jakartaItems.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#fafbfa] border border-[#edf3ec] text-xs">
                <span className="font-semibold text-[#1e2e21] truncate max-w-[200px]">{item.namaPelanggan}</span>
                <span className="font-bold text-[#1b2b1d]">{formatRupiahMiliar(item.nilaiAR / 1000000000)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Panel */}
        <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#eaf4ea] text-[#345b38] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-[#1b2b1d] font-['Space_Grotesk']">
                Wilayah Regional (Non-Jakarta)
              </h3>
            </div>
            <span className="text-xs font-bold text-[#455c47] bg-[#edf4ec] px-2.5 py-1 rounded-lg">
              {regionalItems.length} Kontrak
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#f5f8f4] border border-[#e2ece0] mb-4">
            <p className="text-xs font-bold text-[#5a715d] uppercase">Nilai AR Regional</p>
            <p className="text-3xl font-extrabold text-[#17251a] font-['Space_Grotesk'] mt-1">
              {formatRupiahMiliar(metrics.layakTagihRegional)}
            </p>
            <p className="text-xs font-semibold text-emerald-700 mt-1">
              {((metrics.layakTagihRegional / metrics.arLayakTagih) * 100).toFixed(1)}% dari Total Layak Tagih
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#354c37] uppercase tracking-wider">Top Pelanggan Regional</p>
            {regionalItems.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#fafbfa] border border-[#edf3ec] text-xs">
                <div>
                  <p className="font-semibold text-[#1e2e21] truncate max-w-[180px]">{item.namaPelanggan}</p>
                  <p className="text-[10px] text-[#6d8470]">{item.regional}</p>
                </div>
                <span className="font-bold text-[#1b2b1d]">{formatRupiahMiliar(item.nilaiAR / 1000000000)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
