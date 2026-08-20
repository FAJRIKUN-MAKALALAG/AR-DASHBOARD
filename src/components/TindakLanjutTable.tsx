import React from 'react';
import { 
  FileCheck2, 
  FileText, 
  Folder, 
  RotateCw, 
  CalendarDays, 
  Search, 
  Edit3, 
  Plus, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatNumberMiliar } from '../utils/excelHelper';
import { KategoriBelumInvoiced, TindakLanjutAOC } from '../types';

export const TindakLanjutTable: React.FC = () => {
  const { 
    aocFollowUps, 
    metrics, 
    setEditFollowUpItem, 
    setIsAddFollowUpOpen 
  } = useDashboard();

  const getCategoryIcon = (category: KategoriBelumInvoiced) => {
    switch (category) {
      case 'Kontrak':
        return <FileText className="w-4 h-4 text-[#4a634e]" />;
      case 'BAST / BAPP':
        return <Folder className="w-4 h-4 text-[#4a634e]" />;
      case 'Rekon / SLG':
        return <RotateCw className="w-4 h-4 text-[#4a634e]" />;
      case 'Termin':
        return <CalendarDays className="w-4 h-4 text-[#4a634e]" />;
      case 'Identifikasi':
        return <Search className="w-4 h-4 text-[#c76e25]" />;
    }
  };

  // Combine metrics calculated value with follow-up list
  const displayRows = metrics.kategoriBreakdown.map((item) => {
    const existing = aocFollowUps.find(f => f.kategori === item.kategori);
    return {
      kategori: item.kategori,
      nilai: item.nilai,
      tindakLanjut: existing?.tindakLanjut || item.tindakLanjut,
      uic: existing?.uic || item.uic,
      dueDate: existing?.dueDate || item.dueDate,
      hasFollowUp: existing ? existing.status !== 'Open' && existing.tindakLanjut !== 'Belum ada tindak lanjut' : item.isUpdated,
      rawItem: existing || {
        id: `AOC-${item.kategori}`,
        kategori: item.kategori,
        nilai: item.nilai,
        tindakLanjut: item.tindakLanjut,
        uic: item.uic,
        dueDate: item.dueDate,
        status: item.kategori === 'Identifikasi' ? 'Open' : 'In Progress',
        lastUpdated: '10:20 WIB'
      } as TindakLanjutAOC
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-[#dce5dc] shadow-sm overflow-hidden mb-6">
      {/* Table Header Banner */}
      <div className="px-5 py-3.5 border-b border-[#e5ece4] flex items-center justify-between bg-[#fbfdfa]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#eaf2e8] text-[#344f37] flex items-center justify-center">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold tracking-wider text-[#203223] uppercase font-['Space_Grotesk']">
            TINDAK LANJUT AOC
          </h3>
        </div>

        <button
          onClick={() => setIsAddFollowUpOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-[#eaf2e7] text-[#2d4230] hover:bg-[#d8e7d5] transition-colors border border-[#cbdccb]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Tindak Lanjut</span>
        </button>
      </div>

      {/* Table responsive wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f7f9f6] text-[#4f6753] font-bold border-b border-[#e6ede5] uppercase tracking-wider text-[11px]">
              <th className="py-3 px-5 w-[16%]">Kategori</th>
              <th className="py-3 px-4 w-[12%] text-right sm:text-left">Nilai</th>
              <th className="py-3 px-5 w-[38%]">Tindak Lanjut</th>
              <th className="py-3 px-4 w-[18%]">UIC</th>
              <th className="py-3 px-3 w-[8%] text-center">Due Date</th>
              <th className="py-3 px-5 w-[8%] text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2ec] text-[#223123]">
            {displayRows.map((row) => {
              const isIdentifikasi = row.kategori === 'Identifikasi';

              return (
                <tr 
                  key={row.kategori}
                  className="hover:bg-[#f8faf7] transition-colors group"
                >
                  {/* Kategori */}
                  <td className="py-3.5 px-5 font-semibold">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#f2f6f1] flex items-center justify-center shrink-0">
                        {getCategoryIcon(row.kategori)}
                      </div>
                      <span className="text-[#1c2a1e] font-bold">{row.kategori}</span>
                    </div>
                  </td>

                  {/* Nilai */}
                  <td className="py-3.5 px-4 font-bold text-[#1a291c] font-['Space_Grotesk'] text-right sm:text-left">
                    {formatNumberMiliar(row.nilai)} M
                  </td>

                  {/* Tindak Lanjut Description */}
                  <td className="py-3.5 px-5 font-medium text-[#3b4e3e] leading-relaxed">
                    <span className={isIdentifikasi && !row.hasFollowUp ? 'text-[#8c674b] italic' : ''}>
                      {row.tindakLanjut}
                    </span>
                  </td>

                  {/* UIC (Unit In Charge) */}
                  <td className="py-3.5 px-4 text-[#526a56] font-medium">
                    {row.uic}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-3 text-center font-bold text-[#354c37]">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#edf3ec] text-[#314633] text-[11px]">
                      {row.dueDate}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-5 text-center">
                    {row.hasFollowUp ? (
                      <button
                        id={`btn-edit-aoc-${row.kategori.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => setEditFollowUpItem(row.rawItem)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-[#f3f7f2] text-[#2c3f2f] border border-[#cfdacd] shadow-2xs transition-colors active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#516b53]" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        id={`btn-add-aoc-${row.kategori.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => {
                          setEditFollowUpItem({
                            id: `AOC-${row.kategori}`,
                            kategori: row.kategori,
                            nilai: row.nilai,
                            tindakLanjut: '',
                            uic: 'Segmen, Legal & Pelanggan',
                            dueDate: 'Q3',
                            status: 'In Progress',
                            lastUpdated: 'Baru saja'
                          });
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#faf3ea] hover:bg-[#f5e7d4] text-[#a1551d] border border-[#edd5be] shadow-2xs transition-colors active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
