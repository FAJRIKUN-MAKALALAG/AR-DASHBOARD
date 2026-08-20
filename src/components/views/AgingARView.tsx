import React from 'react';
import { BarChart3, AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatNumberMiliar, formatRupiahMiliar } from '../../utils/excelHelper';
import { AgingBucket } from '../../types';

export const AgingARView: React.FC = () => {
  const { metrics, filteredItems, setSelectedDrilldown } = useDashboard();
  const buckets: AgingBucket[] = ['0-3 Bulan', '4-12 Bulan', '13-24 Bulan', '>24 Bulan'];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            Analisis Aging Account Receivable
          </h2>
          <p className="text-xs text-[#627764] mt-0.5">
            Distribusi umur piutang dan mitigasi risiko piutang macet / dispute
          </p>
        </div>
      </div>

      {/* 4 Bucket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buckets.map(b => {
          const data = metrics.aging[b];
          const items = filteredItems.filter(i => i.agingBucket === b);
          const isHighRisk = b === '13-24 Bulan' || b === '>24 Bulan';

          return (
            <div 
              key={b}
              onClick={() => setSelectedDrilldown({
                title: `Aging Detail: ${b}`,
                agingBucket: b,
                items
              })}
              className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                isHighRisk ? 'border-[#ebdccf] hover:border-[#dfbfa4]' : 'border-[#dce5dc] hover:border-[#a9c2ac]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-[#405643] uppercase tracking-wider">{b}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isHighRisk ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {items.length} Item
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#19271a] font-['Space_Grotesk']">
                {formatNumberMiliar(data.value)} M
              </h3>
              <p className="text-xs font-semibold text-[#5a715e] mt-1">
                {data.percent.toFixed(1)}% dari Total AR
              </p>
              <div className="mt-3 pt-3 border-t border-[#edf2ec] flex items-center justify-between text-xs text-[#526b55] font-semibold">
                <span>Lihat Rincian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Aging Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#dce5dc] p-5 shadow-sm overflow-hidden">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#223324] font-['Space_Grotesk'] mb-4">
          Matriks Umur Piutang per Pelanggan
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f6f9f5] text-[#4e6652] font-bold border-b border-[#e5ede3] text-[11px] uppercase">
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-3">Kontrak</th>
                <th className="py-3 px-3">Pengelolaan</th>
                <th className="py-3 px-3 text-right">Nilai AR</th>
                <th className="py-3 px-3 text-center">Umur (Bulan)</th>
                <th className="py-3 px-3 text-center">Bucket Aging</th>
                <th className="py-3 px-4">Status & Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2ec]">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-[#f9fbf8]">
                  <td className="py-3 px-4 font-bold text-[#1a281c]">{item.namaPelanggan}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#6b816d]">{item.nomorKontrak}</td>
                  <td className="py-3 px-3 font-semibold text-[#3b523e]">{item.pengelolaan}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#17251a] font-['Space_Grotesk'] text-sm">
                    {formatRupiahMiliar(item.nilaiAR / 1000000000)}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-[#2d4030]">{item.agingMonths} bln</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eef4ed] text-[#2f4331]">
                      {item.agingBucket}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#3c503f]">{item.tindakLanjut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
