import React from 'react';
import { FileSpreadsheet, Download, Printer, Share2, FileText, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { exportToExcel, downloadSampleTemplate, formatRupiahMiliar } from '../../utils/excelHelper';

export const LaporanView: React.FC = () => {
  const { filteredItems, metrics, periode, pengelolaan } = useDashboard();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            Pusat Laporan & Ekspor Data AR
          </h2>
          <p className="text-xs text-[#627764] mt-0.5">
            Ekspor dataset Open Item AR ke format Microsoft Excel (.xlsx) atau Cetak Laporan Eksekutif
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#f4f7f2] hover:bg-[#e7eee5] text-[#2c3e2e] border border-[#cbd9cb] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={() => exportToExcel(filteredItems, `Laporan_AR_Telkom_${periode.replace(/\s+/g, '_')}_${pengelolaan}.xlsx`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2e4231] hover:bg-[#203022] text-white shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Summary Recap Card for Report */}
      <div className="bg-white rounded-2xl border border-[#dce5dc] p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#223324] font-['Space_Grotesk']">
          Ikhtisar Eksekutif Laporan AR - {periode} ({pengelolaan})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-[#f7faf6] border border-[#e2eae0]">
            <p className="text-[11px] font-bold text-[#5e7461] uppercase">Total AR</p>
            <p className="text-xl font-extrabold text-[#18261b] font-['Space_Grotesk'] mt-0.5">
              {formatRupiahMiliar(metrics.totalAR)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f7faf6] border border-[#e2eae0]">
            <p className="text-[11px] font-bold text-[#5e7461] uppercase">Layak Tagih</p>
            <p className="text-xl font-extrabold text-[#18261b] font-['Space_Grotesk'] mt-0.5">
              {formatRupiahMiliar(metrics.arLayakTagih)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f7faf6] border border-[#e2eae0]">
            <p className="text-[11px] font-bold text-[#5e7461] uppercase">Tidak Layak Tagih</p>
            <p className="text-xl font-extrabold text-[#18261b] font-['Space_Grotesk'] mt-0.5">
              {formatRupiahMiliar(metrics.arTidakLayakTagih)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f7faf6] border border-[#e2eae0]">
            <p className="text-[11px] font-bold text-[#5e7461] uppercase">Belum Invoiced</p>
            <p className="text-xl font-extrabold text-[#18261b] font-['Space_Grotesk'] mt-0.5">
              {formatRupiahMiliar(metrics.belumInvoiced)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#edf2ec] flex items-center justify-between">
          <p className="text-xs text-[#607763]">
            Jumlah Record: <strong>{filteredItems.length} transaksi</strong>
          </p>
          <button
            onClick={downloadSampleTemplate}
            className="text-xs font-bold text-[#345137] hover:underline flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Format Template Excel SharePoint</span>
          </button>
        </div>
      </div>
    </div>
  );
};
