import React, { useState } from 'react';
import { BarChart3, AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatNumberMiliar, formatRupiahMiliar } from '../../utils/excelHelper';
import { AgingBucket } from '../../types';

export const AgingARView: React.FC = () => {
  const { metrics, filteredItems, setSelectedDrilldown } = useDashboard();
  const buckets: AgingBucket[] = ['0-3 Bulan', '4-12 Bulan', '13-24 Bulan', '>24 Bulan'];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const page = Math.min(currentPage, totalPages || 1);
  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
              onClick={() => items.length > 0 && setSelectedDrilldown({
                title: `Detail AR Aging: ${b}`,
                items
              })}
              className={`bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm cursor-pointer hover:border-emerald-600 hover:shadow-md transition-all group ${
                items.length > 0 ? '' : 'pointer-events-none opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#5c725f] uppercase tracking-wider">{b}</span>
                {isHighRisk && data.value > 0 ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                ) : null}
              </div>
              <h3 className="text-2xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
                {formatRupiahMiliar(data.value)}
              </h3>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] text-[#6d8270] font-semibold">{data.percent.toFixed(1)}% Kontribusi</span>
                <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  {items.length} Item <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Aging Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#dce5dc] p-5 shadow-sm overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#223324] font-['Space_Grotesk']">
            Matriks Umur Piutang per Pelanggan
          </h3>
          <span className="text-xs font-bold text-[#5c725f]">
            Total: {filteredItems.length} Item
          </span>
        </div>

        <div className="overflow-x-auto border border-[#e2ebe0] rounded-xl">
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
              {paginatedItems.map(item => (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-[#5c725f]">
            <div>
              Menampilkan <span className="font-bold">{((page - 1) * itemsPerPage) + 1}</span> -{' '}
              <span className="font-bold">{Math.min(page * itemsPerPage, filteredItems.length)}</span> dari{' '}
              <span className="font-bold">{filteredItems.length}</span> item
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2.5 py-1.5 rounded-lg border border-[#dce5dc] hover:bg-[#f4f7f4] disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
              >
                Pertama
              </button>
              <button
                disabled={page === 1}
                onClick={() => setCurrentPage(page - 1)}
                className="px-2.5 py-1.5 rounded-lg border border-[#dce5dc] hover:bg-[#f4f7f4] disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1.5 bg-[#eef4ed] text-[#2f4231] rounded-lg border border-[#d0e0cf] font-bold">
                Halaman {page} dari {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setCurrentPage(page + 1)}
                className="px-2.5 py-1.5 rounded-lg border border-[#dce5dc] hover:bg-[#f4f7f4] disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
              >
                Selanjutnya
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2.5 py-1.5 rounded-lg border border-[#dce5dc] hover:bg-[#f4f7f4] disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
              >
                Terakhir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
