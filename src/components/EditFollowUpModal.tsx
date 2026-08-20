import React, { useState, useEffect } from 'react';
import { X, Check, FileText, UserCheck, Calendar, AlertCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { KategoriBelumInvoiced, TindakLanjutAOC } from '../types';

export const EditFollowUpModal: React.FC = () => {
  const { 
    editFollowUpItem, 
    setEditFollowUpItem, 
    isAddFollowUpOpen, 
    setIsAddFollowUpOpen,
    saveFollowUpItem,
    addFollowUpItem,
    metrics
  } = useDashboard();

  const isAdding = isAddFollowUpOpen && !editFollowUpItem;
  const isOpen = isAddFollowUpOpen || editFollowUpItem !== null;

  const [kategori, setKategori] = useState<KategoriBelumInvoiced>('Kontrak');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [uic, setUic] = useState('Segmen, Legal & Pelanggan');
  const [dueDate, setDueDate] = useState('Q3');
  const [status, setStatus] = useState<'Open' | 'In Progress' | 'Resolved'>('In Progress');
  const [nilai, setNilai] = useState<number>(0);

  useEffect(() => {
    if (editFollowUpItem) {
      setKategori(editFollowUpItem.kategori);
      setTindakLanjut(editFollowUpItem.tindakLanjut || '');
      setUic(editFollowUpItem.uic || 'Segmen, Legal & Pelanggan');
      setDueDate(editFollowUpItem.dueDate || 'Q3');
      setStatus(editFollowUpItem.status || 'In Progress');
      setNilai(editFollowUpItem.nilai || 0);
    } else {
      setKategori('Kontrak');
      setTindakLanjut('');
      setUic('Segmen, Legal & Pelanggan');
      setDueDate('Q3');
      setStatus('In Progress');
      setNilai(0);
    }
  }, [editFollowUpItem, isAddFollowUpOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setEditFollowUpItem(null);
    setIsAddFollowUpOpen(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editFollowUpItem) {
      saveFollowUpItem({
        ...editFollowUpItem,
        kategori,
        tindakLanjut: tindakLanjut.trim() || 'Follow up dalam proses',
        uic: uic.trim() || 'Segmen & Finance',
        dueDate: dueDate.trim() || 'Q3',
        status,
        nilai: nilai || editFollowUpItem.nilai
      });
    } else {
      addFollowUpItem({
        kategori,
        tindakLanjut: tindakLanjut.trim() || 'Follow up baru dicatat',
        uic: uic.trim() || 'Segmen & Finance',
        dueDate: dueDate.trim() || 'Q3',
        status,
        nilai: nilai || 1.00
      });
    }

    handleClose();
  };

  const uicOptions = [
    'Segmen, Legal & Pelanggan',
    'CGA, Segmen & Pelanggan',
    'Segmen, Pelanggan & CGA',
    'Segmen & CGA',
    'Collection & Finance',
    'Legal & Risk Telkom',
    'Internal Audit & Segmen',
    'Bad Debt Recovery'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#c9d8c8] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2eae0] flex items-center justify-between bg-[#f8faf7]">
          <div>
            <h3 className="text-base font-extrabold text-[#1a281c] font-['Space_Grotesk']">
              {isAdding ? 'Tambah Tindak Lanjut AOC' : `Edit Tindak Lanjut - ${kategori}`}
            </h3>
            <p className="text-xs text-[#637a65] mt-0.5">
              Perbarui action item, unit in charge, dan tenggat waktu
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Kategori */}
          <div>
            <label className="block font-bold text-[#2d4030] mb-1">
              Kategori Belum Invoiced
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as KategoriBelumInvoiced)}
              disabled={!isAdding}
              className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl font-semibold text-[#1e2e21] focus:ring-2 focus:ring-[#446046] focus:outline-none disabled:opacity-80"
            >
              <option value="Kontrak">Kontrak</option>
              <option value="BAST / BAPP">BAST / BAPP</option>
              <option value="Rekon / SLG">Rekon / SLG</option>
              <option value="Termin">Termin</option>
              <option value="Identifikasi">Identifikasi</option>
            </select>
          </div>

          {/* Tindak Lanjut Description */}
          <div>
            <label className="block font-bold text-[#2d4030] mb-1">
              Rencana Tindak Lanjut (AOC)
            </label>
            <textarea
              rows={3}
              required
              placeholder="Contoh: Percepatan proses review kontrak di Legal Telkom..."
              value={tindakLanjut}
              onChange={(e) => setTindakLanjut(e.target.value)}
              className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl text-[#1e2e21] font-medium focus:ring-2 focus:ring-[#446046] focus:outline-none"
            />
          </div>

          {/* UIC */}
          <div>
            <label className="block font-bold text-[#2d4030] mb-1">
              UIC (Unit In Charge / PIC)
            </label>
            <input
              type="text"
              list="uic-list"
              required
              placeholder="Pilih atau ketik UIC..."
              value={uic}
              onChange={(e) => setUic(e.target.value)}
              className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl text-[#1e2e21] font-medium focus:ring-2 focus:ring-[#446046] focus:outline-none"
            />
            <datalist id="uic-list">
              {uicOptions.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </div>

          {/* Due Date & Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#2d4030] mb-1">
                Due Date
              </label>
              <input
                type="text"
                placeholder="Contoh: Q3 atau 2026-09-30"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl text-[#1e2e21] font-medium focus:ring-2 focus:ring-[#446046] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2d4030] mb-1">
                Status Follow Up
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#f4f7f2] border border-[#d8e2d7] rounded-xl font-semibold text-[#1e2e21] focus:ring-2 focus:ring-[#446046] focus:outline-none"
              >
                <option value="In Progress">In Progress (Updated)</option>
                <option value="Open">Open (Belum Ada Tindak Lanjut)</option>
                <option value="Resolved">Resolved / Selesai</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#e5eee4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2d4130] hover:bg-[#1e2d21] text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
