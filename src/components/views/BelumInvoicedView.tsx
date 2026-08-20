import React from 'react';
import { FileText, Folder, RotateCw, CalendarDays, Search, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatRupiahMiliar } from '../../utils/excelHelper';
import { KategoriBelumInvoiced } from '../../types';

export const BelumInvoicedView: React.FC = () => {
  const { metrics, filteredItems, setSelectedDrilldown } = useDashboard();

  const getIcon = (cat: KategoriBelumInvoiced) => {
    switch (cat) {
      case 'Kontrak': return <FileText className="w-5 h-5 text-[#3b593f]" />;
      case 'BAST / BAPP': return <Folder className="w-5 h-5 text-[#3b593f]" />;
      case 'Rekon / SLG': return <RotateCw className="w-5 h-5 text-[#3b593f]" />;
      case 'Termin': return <CalendarDays className="w-5 h-5 text-[#3b593f]" />;
      case 'Identifikasi': return <Search className="w-5 h-5 text-[#cf6d22]" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            Pipeline Hambatan Belum Invoiced
          </h2>
          <p className="text-xs text-[#627764] mt-0.5">
            5 Tahapan administratif percepatan penerbitan invoice
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-[#5c725f] uppercase">Total Belum Invoiced</span>
          <p className="text-2xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            {formatRupiahMiliar(metrics.belumInvoiced)}
          </p>
        </div>
      </div>

      {/* 5 Detailed Category Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.kategoriBreakdown.map(cat => {
          const items = filteredItems.filter(i => i.kategoriBelumInvoiced === cat.kategori);

          return (
            <div 
              key={cat.kategori}
              className="bg-white rounded-2xl p-5 border border-[#dce5dc] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#edf4ec] flex items-center justify-center border border-[#d6e5d5]">
                      {getIcon(cat.kategori)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1b2b1d] font-['Space_Grotesk']">
                        {cat.kategori}
                      </h3>
                      <p className="text-[10px] text-[#6d8470]">{cat.percent.toFixed(1)}% dari Belum Invoiced</p>
                    </div>
                  </div>
                  {cat.isUpdated ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Updated
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Belum
                    </span>
                  )}
                </div>

                <div className="my-3 p-3 rounded-xl bg-[#f6f9f5] border border-[#e3ede1]">
                  <span className="text-[10px] font-bold text-[#5c7360] uppercase">Nilai Tertahan</span>
                  <p className="text-2xl font-extrabold text-[#17251a] font-['Space_Grotesk']">
                    {formatRupiahMiliar(cat.nilai)}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-[#2c3f2f] mb-4">
                  <p><span className="font-bold text-[#516b53]">AOC:</span> {cat.tindakLanjut}</p>
                  <p><span className="font-bold text-[#516b53]">UIC:</span> {cat.uic}</p>
                  <p><span className="font-bold text-[#516b53]">Due Date:</span> {cat.dueDate}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDrilldown({
                  title: `Rincian Belum Invoiced: ${cat.kategori}`,
                  category: cat.kategori,
                  items
                })}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#edf4ec] hover:bg-[#e1ede0] text-[#2c402f] border border-[#cbdacb] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Lihat {items.length} Transaksi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
