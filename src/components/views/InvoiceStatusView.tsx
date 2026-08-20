import React, { useState } from 'react';
import { FileCheck, CheckCircle2, Clock, Search, Filter } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatRupiahMiliar } from '../../utils/excelHelper';

export const InvoiceStatusView: React.FC = () => {
  const { metrics, filteredItems } = useDashboard();
  const [filterType, setFilterType] = useState<'All' | 'Sudah Invoiced' | 'Belum Invoiced'>('All');
  const [search, setSearch] = useState('');

  const items = filteredItems.filter(item => {
    const matchType = filterType === 'All' || item.statusInvoice === filterType;
    const matchSearch = item.namaPelanggan.toLowerCase().includes(search.toLowerCase()) ||
      item.nomorKontrak.toLowerCase().includes(search.toLowerCase()) ||
      (item.nomorInvoice && item.nomorInvoice.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            Monitoring Status Penerbitan Invoice
          </h2>
          <p className="text-xs text-[#627764] mt-0.5">
            Pelacakan dokumen tagihan resmi (Billing / Faktur Pajak)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#eaf4ea] border border-[#cfe2ce] text-xs font-bold text-[#2b442e]">
            Sudah: {formatRupiahMiliar(metrics.statusSudahInvoiced)}
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#fdf5ec] border border-[#f5e0cc] text-xs font-bold text-[#9e5519]">
            Belum: {formatRupiahMiliar(metrics.statusBelumInvoiced)}
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-[#dce5dc] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['All', 'Sudah Invoiced', 'Belum Invoiced'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterType === type 
                    ? 'bg-[#2c3d2e] text-white shadow-xs' 
                    : 'bg-[#f4f7f2] text-[#4f6652] hover:bg-[#e9f0e7]'
                }`}
              >
                {type === 'All' ? 'Semua Status' : type}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-[#7b917f] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pelanggan / invoice..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f4f7f2] border border-[#dbe5da] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#446046]"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#e2ebe0] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f6f9f5] text-[#4e6652] font-bold border-b border-[#e5ede3] text-[11px] uppercase">
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-3">Nomor Kontrak / Invoice</th>
                <th className="py-3 px-3 text-right">Nilai AR</th>
                <th className="py-3 px-3 text-center">Status Invoice</th>
                <th className="py-3 px-3">Kategori Hambatan</th>
                <th className="py-3 px-4">Tindak Lanjut AOC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2ec]">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-[#f9fbf8]">
                  <td className="py-3 px-4 font-bold text-[#1a281c]">{item.namaPelanggan}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#6b816d]">
                    {item.nomorInvoice !== '-' ? item.nomorInvoice : item.nomorKontrak}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#17251a] font-['Space_Grotesk'] text-sm">
                    {formatRupiahMiliar(item.nilaiAR / 1000000000)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.statusInvoice === 'Sudah Invoiced' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.statusInvoice === 'Sudah Invoiced' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {item.statusInvoice}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#405643]">
                    {item.kategoriBelumInvoiced || '-'}
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
