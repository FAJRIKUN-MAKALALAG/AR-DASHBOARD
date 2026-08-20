import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight, 
  Building2, 
  Users,
  Award
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatRupiahMiliar, formatNumberMiliar } from '../../utils/excelHelper';

export const RingkasanARView: React.FC = () => {
  const { metrics, filteredItems, periode, pengelolaan } = useDashboard();

  // Segment breakdown
  const segments = ['Enterprise Banking', 'BUMN Energy', 'Government', 'Wholesale & Telco', 'Enterprise FMCG', 'BUMN Industry'];
  const segmentStats = segments.map(seg => {
    const items = filteredItems.filter(i => i.segmen.toLowerCase().includes(seg.toLowerCase()) || seg.toLowerCase().includes(i.segmen.toLowerCase()));
    const total = items.reduce((acc, curr) => acc + curr.nilaiAR, 0);
    return {
      name: seg,
      nilai: +(total / 1000000000).toFixed(2),
      count: items.length
    };
  }).filter(s => s.nilai > 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            Ringkasan Eksekutif Account Receivable
          </h2>
          <p className="text-xs text-[#627764] mt-0.5">
            Analisis kesehatan portofolio piutang usaha periode {periode} ({pengelolaan})
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-[#eef4ed] text-[#2f4231] px-3.5 py-1.5 rounded-xl border border-[#d0e0cf]">
          <Award className="w-4 h-4 text-emerald-700" />
          <span>Collectibility Ratio: {metrics.arLayakTagihPercent}%</span>
        </div>
      </div>

      {/* 3 Overview Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5c725f] uppercase tracking-wider">Total Portofolio AR</span>
            <div className="w-8 h-8 rounded-lg bg-[#2c3d2e] text-white flex items-center justify-center text-xs font-bold">
              Rp
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            {formatRupiahMiliar(metrics.totalAR)}
          </h3>
          <p className="text-xs text-[#6d8270] mt-1 font-medium">
            Terdiri dari {filteredItems.length} transaksi open item aktif
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5c725f] uppercase tracking-wider">AR Layak Tagih</span>
            <div className="w-8 h-8 rounded-lg bg-[#eaf4ea] text-[#345b38] flex items-center justify-center border border-[#cfe3d0]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            {formatRupiahMiliar(metrics.arLayakTagih)}
          </h3>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            {metrics.arLayakTagihPercent}% dari total piutang siap ditagih
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5c725f] uppercase tracking-wider">Potensi Invoice Terbit</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff5ec] text-[#48634c] flex items-center justify-center border border-[#d3e2d1]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            {formatRupiahMiliar(metrics.belumInvoiced)}
          </h3>
          <p className="text-xs text-[#c96924] font-semibold mt-1">
            Target percepatan administrasi & BAST
          </p>
        </div>
      </div>

      {/* Breakdown Segmen Pelanggan */}
      <div className="bg-white rounded-2xl border border-[#dce5dc] p-5 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#223324] font-['Space_Grotesk'] mb-4">
          Distribusi AR Berdasarkan Segmen Pelanggan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {segmentStats.map(s => {
            const percentOfTotal = metrics.totalAR > 0 ? ((s.nilai / metrics.totalAR) * 100).toFixed(1) : 0;
            return (
              <div key={s.name} className="p-4 rounded-xl bg-[#f7faf6] border border-[#e2ece0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#203122]">{s.name}</span>
                  <span className="text-xs font-semibold text-[#5a715d]">{s.count} Kontrak</span>
                </div>
                <p className="text-lg font-extrabold text-[#19271a] font-['Space_Grotesk']">
                  {formatRupiahMiliar(s.nilai)}
                </p>
                <div className="mt-2 w-full bg-[#e7eee5] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#385038] h-full rounded-full" 
                    style={{ width: `${percentOfTotal}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#69806c] mt-1 text-right font-medium">{percentOfTotal}% dari Total AR</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
