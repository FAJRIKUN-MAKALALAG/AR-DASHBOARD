import React from 'react';
import { 
  FileText, 
  Folder, 
  RotateCw, 
  CalendarDays, 
  Search, 
  ChevronRight, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatRupiahMiliar } from '../utils/excelHelper';
import { KategoriBelumInvoiced } from '../types';

export const BelumInvoicedSection: React.FC = () => {
  const { metrics, filteredItems, setSelectedDrilldown } = useDashboard();

  const getCategoryIcon = (category: KategoriBelumInvoiced) => {
    switch (category) {
      case 'Kontrak':
        return <FileText className="w-5 h-5" />;
      case 'BAST / BAPP':
        return <Folder className="w-5 h-5" />;
      case 'Rekon / SLG':
        return <RotateCw className="w-5 h-5" />;
      case 'Termin':
        return <CalendarDays className="w-5 h-5" />;
      case 'Identifikasi':
        return <Search className="w-5 h-5" />;
    }
  };

  return (
    <section className="mb-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-extrabold tracking-wider text-[#223324] uppercase font-['Space_Grotesk']">
          BELUM INVOICED
        </h3>
        <span className="text-sm font-bold text-[#1f2d21] font-['Space_Grotesk']">
          {formatRupiahMiliar(metrics.belumInvoiced)}
        </span>
      </div>

      {/* 5 Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {metrics.kategoriBreakdown.map((item) => {
          const isIdentifikasi = item.kategori === 'Identifikasi';
          const icon = getCategoryIcon(item.kategori);

          return (
            <div
              key={item.kategori}
              id={`card-belum-invoiced-${item.kategori.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setSelectedDrilldown({
                title: `Belum Invoiced: ${item.kategori}`,
                category: item.kategori,
                items: filteredItems.filter(i => i.kategoriBelumInvoiced === item.kategori)
              })}
              className={`group bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                isIdentifikasi 
                  ? 'border-[#f2dec9] hover:border-[#dfba94] bg-gradient-to-b from-white to-[#fffaf5]' 
                  : 'border-[#dce5dc] hover:border-[#a9c2ac]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 border ${
                  isIdentifikasi 
                    ? 'bg-[#fef4ea] text-[#cf6d22] border-[#fce3cb]' 
                    : 'bg-[#edf4ec] text-[#3d5940] border-[#d8e6d7]'
                }`}>
                  {icon}
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                  isIdentifikasi ? 'text-[#c78652]' : 'text-[#879f8b]'
                }`} />
              </div>

              <p className="text-xs font-bold text-[#556c59] uppercase tracking-wider mb-1">
                {item.kategori}
              </p>

              <h4 className="text-xl font-extrabold text-[#17251a] font-['Space_Grotesk'] tracking-tight">
                {formatRupiahMiliar(item.nilai)}
              </h4>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#edf2ec] text-[11px]">
                <span className="font-semibold text-[#667e6a]">
                  {item.percent.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </span>

                {item.isUpdated ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Updated</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    <AlertCircle className="w-3 h-3" />
                    <span>Belum</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
