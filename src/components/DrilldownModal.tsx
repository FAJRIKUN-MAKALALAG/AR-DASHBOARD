import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Building,
  Calendar
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { exportToExcel, formatRupiahFull, formatRupiahMiliar } from '../utils/excelHelper';
import { OpenItemAR } from '../types';

export const DrilldownModal: React.FC = () => {
  const { selectedDrilldown, setSelectedDrilldown } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  if (!selectedDrilldown) return null;

  const items = selectedDrilldown.items || [];
  const filtered = items.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.namaPelanggan.toLowerCase().includes(term) ||
      item.nomorKontrak.toLowerCase().includes(term) ||
      (item.nomorInvoice && item.nomorInvoice.toLowerCase().includes(term)) ||
      item.segmen.toLowerCase().includes(term) ||
      item.regional.toLowerCase().includes(term)
    );
  });

  const totalNilai = items.reduce((acc, curr) => acc + curr.nilaiAR, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl border border-[#c8d8c6] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e2eae0] flex items-center justify-between bg-[#f8faf7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="text-lg font-extrabold text-[#1a281c] font-['Space_Grotesk']">
                {selectedDrilldown.title}
              </h3>
            </div>
            <p className="text-xs text-[#637a65] mt-0.5">
              Menampilkan {items.length} rincian transaksi open item AR
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(items, `${selectedDrilldown.title.replace(/\s+/g, '_')}.xlsx`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#eef4ed] hover:bg-[#dfeade] text-[#2c402f] border border-[#cbdbcb] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => setSelectedDrilldown(null)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Summary Bar */}
        <div className="px-6 py-3 bg-[#fdfefd] border-b border-[#edf2ec] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7b917f] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama pelanggan, nomor kontrak, invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#f4f7f2] border border-[#dbe5da] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#446046]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#203222] bg-[#edf4ec] px-3.5 py-1.5 rounded-xl border border-[#d2e2d0]">
            <span>Total Nilai:</span>
            <span className="text-sm font-extrabold text-[#172719] font-['Space_Grotesk']">
              {formatRupiahMiliar(totalNilai / 1000000000)}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-sm">Tidak ada data yang cocok dengan pencarian.</p>
            </div>
          ) : (
            <div className="border border-[#e2ebe0] rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f6f9f5] text-[#4f6753] font-bold border-b border-[#e5ece3] text-[11px] uppercase">
                    <th className="py-3 px-4">Pelanggan & Kontrak</th>
                    <th className="py-3 px-3">Segmen / Pengelolaan</th>
                    <th className="py-3 px-3">Regional</th>
                    <th className="py-3 px-3 text-right">Nilai AR</th>
                    <th className="py-3 px-3">Aging</th>
                    <th className="py-3 px-3">Status Layak / Invoice</th>
                    <th className="py-3 px-4">Tindak Lanjut & UIC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2ec] text-[#1e2d20]">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f9fbf8] transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#1a281c] text-xs">{item.namaPelanggan}</p>
                        <p className="text-[11px] text-[#6d826f] font-mono mt-0.5">
                          {item.nomorKontrak} {item.nomorInvoice !== '-' ? `• ${item.nomorInvoice}` : ''}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block font-semibold text-[#3a503c]">{item.segmen}</span>
                        <p className="text-[10px] text-[#718573]">{item.pengelolaan}</p>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#465b49]">
                        {item.regional}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <p className="font-extrabold text-[#17251a] font-['Space_Grotesk'] text-sm">
                          {formatRupiahMiliar(item.nilaiAR / 1000000000)}
                        </p>
                        <p className="text-[10px] text-gray-500">{formatRupiahFull(item.nilaiAR)}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edf4ec] text-[#2c422f]">
                          {item.agingBucket} ({item.agingMonths} bln)
                        </span>
                      </td>
                      <td className="py-3 px-3 space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.statusLayakTagih === 'Layak Tagih' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {item.statusLayakTagih}
                        </span>
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.statusInvoice === 'Sudah Invoiced' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {item.statusInvoice}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs text-[#2c3d2e] leading-snug">{item.tindakLanjut}</p>
                        <p className="text-[10px] text-[#6d8370] mt-0.5 font-medium">UIC: {item.uic} • Due: {item.dueDate}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e2eae0] bg-[#f8faf7] flex justify-end">
          <button
            onClick={() => setSelectedDrilldown(null)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2e4030] hover:bg-[#203022] text-white shadow-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
