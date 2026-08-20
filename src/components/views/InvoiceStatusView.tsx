import React, { useState } from 'react';
import { FileCheck, CheckCircle2, Clock, Search, Filter } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatRupiahMiliar } from '../../utils/excelHelper';

export const InvoiceStatusView: React.FC = () => {
  const { metrics, filteredItems } = useDashboard();
  const [filterType, setFilterType] = useState<'All' | 'Sudah Invoiced' | 'Belum Invoiced'>('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const items = filteredItems.filter(item => {
    const matchType = filterType === 'All' || item.statusInvoice === filterType;
    const matchSearch = item.namaPelanggan.toLowerCase().includes(search.toLowerCase()) ||
      item.nomorKontrak.toLowerCase().includes(search.toLowerCase()) ||
      (item.nomorInvoice && item.nomorInvoice.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const page = Math.min(currentPage, totalPages || 1);
  const paginatedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pelanggan/invoice..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#3c503f] w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Table & filter section */}
      <div className="bg-white rounded-2xl border border-[#dce5dc] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#eef4ed] p-1 rounded-xl border border-[#d0e0cf]">
            {(['All', 'Sudah Invoiced', 'Belum Invoiced'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setFilterType(type); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === type 
                    ? 'bg-[#2e4030] text-white shadow-xs' 
                    : 'text-[#445846] hover:bg-[#e3ede2]'
                }`}
              >
                {type === 'All' ? 'Semua' : type}
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-[#5c725f]">
            Total: {items.length} Item
          </span>
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
              {paginatedItems.map(item => (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-[#5c725f]">
            <div>
              Menampilkan <span className="font-bold">{((page - 1) * itemsPerPage) + 1}</span> -{' '}
              <span className="font-bold">{Math.min(page * itemsPerPage, items.length)}</span> dari{' '}
              <span className="font-bold">{items.length}</span> item
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
