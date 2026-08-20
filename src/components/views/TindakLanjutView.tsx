import React from 'react';
import { ListTodo, Plus, Edit3, Trash2, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { TindakLanjutTable } from '../TindakLanjutTable';
import { formatNumberMiliar } from '../../utils/excelHelper';

export const TindakLanjutView: React.FC = () => {
  const { aocFollowUps, setIsAddFollowUpOpen, setEditFollowUpItem, deleteFollowUpItem } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#dce5dc] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a291c] font-['Space_Grotesk']">
            Tindak Lanjut AOC (Action Oriented Communication)
          </h2>
          <p className="text-xs text-[#627764] mt-0.5">
            Pelacakan status resolusi hambatan invoice dan penugasan PIC
          </p>
        </div>
        <button
          onClick={() => setIsAddFollowUpOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#2d4130] text-white hover:bg-[#1f2f22] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Action Item</span>
        </button>
      </div>

      {/* Main AOC Table */}
      <TindakLanjutTable />

      {/* Detailed Action Cards */}
      <div className="bg-white rounded-2xl border border-[#dce5dc] p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#223324] font-['Space_Grotesk']">
          Daftar Log Rencana Tindak Lanjut Terperinci
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aocFollowUps.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-[#f8faf7] border border-[#e2eae0] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-[#1e2d21]">{item.kategori}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-[#314633] font-medium leading-relaxed mb-3">
                  {item.tindakLanjut}
                </p>
                <div className="text-[11px] text-[#556d58] space-y-1 bg-white p-2.5 rounded-lg border border-[#e5ede4]">
                  <p><span className="font-bold">UIC:</span> {item.uic}</p>
                  <p><span className="font-bold">Target Due Date:</span> {item.dueDate}</p>
                  <p><span className="font-bold">Nilai Terdampak:</span> Rp{formatNumberMiliar(item.nilai)} M</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#e7eee6] flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Update: {item.lastUpdated}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditFollowUpItem(item)}
                    className="p-1.5 text-[#3b523e] hover:bg-[#eaf2e8] rounded-lg transition-colors"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFollowUpItem(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
