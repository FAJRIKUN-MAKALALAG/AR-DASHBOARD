import * as XLSX from 'xlsx';
import { OpenItemAR, AgingBucket, StatusLayakTagih, StatusInvoice, KategoriBelumInvoiced, PengelolaanType, RegionalCategory } from '../types';

export function formatRupiahMiliar(value: number): string {
  // If the value is full Rupiah (large), convert it to billions (divide by 1,000,000,000)
  const valueInBillions = Math.abs(value) >= 1000000 ? value / 1000000000 : value;
  const formatted = valueInBillions.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `Rp${formatted} M`;
}

export function formatNumberMiliar(value: number): string {
  const valueInBillions = Math.abs(value) >= 1000000 ? value / 1000000000 : value;
  return valueInBillions.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatRupiahFull(valueInRupiah: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(valueInRupiah);
}

// Convert OpenItemAR array to Excel sheet and download
export function exportToExcel(items: OpenItemAR[], fileName = 'Open_Item_AR_Telkom.xlsx') {
  const exportData = items.map((item, idx) => ({
    'No': idx + 1,
    'ID AR': item.id,
    'Nomor Kontrak': item.nomorKontrak,
    'Nomor Invoice': item.nomorInvoice || '-',
    'Nama Pelanggan': item.namaPelanggan,
    'Segmen': item.segmen,
    'Pengelolaan': item.pengelolaan,
    'Regional': item.regional,
    'Wilayah': item.regionalCategory,
    'Nilai AR (Rupiah)': item.nilaiAR,
    'Nilai AR (Miliar Rp)': +(item.nilaiAR / 1000000000).toFixed(2),
    'Tanggal AR': item.tanggalAR,
    'Aging (Bulan)': item.agingMonths,
    'Aging Bucket': item.agingBucket,
    'Status Layak Tagih': item.statusLayakTagih,
    'Status Invoice': item.statusInvoice,
    'Kategori Belum Invoiced': item.kategoriBelumInvoiced || '-',
    'Updated': item.isUpdated ? 'Ya' : 'Belum',
    'UIC / PIC': item.uic,
    'Tindak Lanjut AOC': item.tindakLanjut,
    'Due Date': item.dueDate,
    'Periode': item.periode,
    'Catatan Khusus': item.catatan || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Open Item AR');
  
  // Auto-width columns
  const colWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA CLEANING UTILITIES  (mirip pandas Python)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Membersihkan string: trim spasi, buang newline tersembunyi, lowercase optional
 */
function cleanStr(val: any, lowercase = false): string {
  if (val === null || val === undefined) return '';
  const s = String(val).trim().replace(/[\r\n\t]+/g, ' ');
  return lowercase ? s.toLowerCase() : s;
}

/**
 * Fuzzy column finder — cari nama kolom di row secara case-insensitive & trim.
 * Mirip df.columns.str.strip().str.lower() di pandas.
 */
function col(row: any, ...aliases: string[]): string {
  // Bangun map lowercase → original key sekali per row
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const a = alias.toLowerCase().trim();
    const found = keys.find(k => k.toLowerCase().trim() === a);
    if (found !== undefined && row[found] !== '' && row[found] !== null && row[found] !== undefined) {
      return cleanStr(row[found]);
    }
  }
  return '';
}

/**
 * Parse nilai Rupiah dari berbagai format:
 *   - number Excel asli        → pakai langsung
 *   - "1.200.000.000"          → format Indonesia titik = separator ribuan
 *   - "1,200,000,000"          → format EN koma = separator ribuan
 *   - "Rp 1.200.000.000"       → strip prefix
 *   - "1.2 M" / "1,2 M"       → dalam miliar
 *   - bilangan < 10000         → anggap sudah miliar, kali 1e9
 */
function parseRupiah(val: any): number {
  if (typeof val === 'number' && !isNaN(val)) {
    return val < 10_000 ? val * 1_000_000_000 : val;
  }
  const raw = String(val ?? '').trim();
  if (!raw || raw === '-') return 0;

  // Cek suffix miliar: "1.2 M" atau "1,2M" atau "1.28 Miliar"
  const miliarMatch = raw.match(/^[Rp\s]*([\d.,]+)\s*[MmBb](?:iliar)?/);
  if (miliarMatch) {
    const n = parseFloat(miliarMatch[1].replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n * 1_000_000_000;
  }

  // Strip prefix Rp, spasi, lalu deteksi format
  const stripped = raw.replace(/^[Rp\s]+/i, '').trim();

  // Format Indonesia: titik sebagai ribuan, koma sebagai desimal → "1.200.000.000" atau "1.200.000,50"
  // Format EN: koma sebagai ribuan, titik sebagai desimal → "1,200,000.50"
  let numeric: number;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(stripped)) {
    // Indonesian: "1.200.000.000" or "1.200.000,50"
    numeric = parseFloat(stripped.replace(/\./g, '').replace(',', '.'));
  } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(stripped)) {
    // EN: "1,200,000.50"
    numeric = parseFloat(stripped.replace(/,/g, ''));
  } else {
    // Fallback: strip semua kecuali digit dan titik/koma terakhir
    const plain = stripped.replace(/[^0-9.,]/g, '');
    numeric = parseFloat(plain.replace(',', '.'));
  }

  if (isNaN(numeric)) return 0;
  return numeric < 10_000 ? numeric * 1_000_000_000 : numeric;
}

/**
 * Normalize nilai Pengelolaan — mirip df['Pengelolaan'].str.upper().str.strip().map(mapping)
 * Terima nilai parsial / alias umum.
 */
function normalizePengelolaan(raw: string): PengelolaanType {
  const v = raw.toUpperCase().trim();
  if (v === 'ERS' || v.includes('ENTERPRISE REGIONAL') || v.includes('ENTERPISE') || v.startsWith('ERS')) return 'ERS';
  if (v === 'DES' || v.includes('DIGITAL ENT') || v.startsWith('DES')) return 'DES';
  if (v === 'DBS' || v.includes('DIGITAL BIZ') || v.startsWith('DBS')) return 'DBS';
  if (v === 'DPS' || v.includes('DIGITAL PART') || v.startsWith('DPS')) return 'DPS';
  if (v === 'RWS' || v.includes('REGIONAL WHOLE') || v.startsWith('RWS')) return 'RWS';
  // Coba ambil 3 huruf pertama yang cocok
  const prefix = v.substring(0, 3);
  if (['ERS','DES','DBS','DPS','RWS'].includes(prefix)) return prefix as PengelolaanType;
  return 'ERS'; // default
}

/**
 * Normalize Aging Bucket dari nilai bulan
 */
function calcAgingBucket(months: number): AgingBucket {
  if (months <= 3) return '0-3 Bulan';
  if (months <= 12) return '4-12 Bulan';
  if (months <= 24) return '13-24 Bulan';
  return '>24 Bulan';
}

/**
 * Normalize periode ke format "Bulan Tahun" misalnya "Agustus 2026".
 * Terima: "Aug-26", "08/2026", "2026-08", "August 2026", "Agustus 2026", dll.
 */
function normalizePeriode(raw: string): string {
  if (!raw || raw.trim() === '') return 'Agustus 2026';
  const v = raw.trim();

  const bulanId: Record<string, string> = {
    '01':'Januari','02':'Februari','03':'Maret','04':'April','05':'Mei','06':'Juni',
    '07':'Juli','08':'Agustus','09':'September','10':'Oktober','11':'November','12':'Desember',
    jan:'Januari', feb:'Februari', mar:'Maret', apr:'April', may:'Mei', mei:'Mei',
    jun:'Juni', jul:'Juli', aug:'Agustus', agu:'Agustus', sep:'September',
    oct:'Oktober', okt:'Oktober', nov:'November', dec:'Desember', des:'Desember',
  };

  // Sudah dalam format "Agustus 2026" — cek apakah ada nama bulan Indonesia/EN + tahun 4 digit
  if (/^[A-Za-z]+ \d{4}$/.test(v)) return v;

  // Format "Aug-26" atau "Aug 26"
  const mShort = v.match(/^([A-Za-z]{3})[-\s](\d{2,4})$/);
  if (mShort) {
    const bln = bulanId[mShort[1].toLowerCase()] || mShort[1];
    const yr = mShort[2].length === 2 ? `20${mShort[2]}` : mShort[2];
    return `${bln} ${yr}`;
  }

  // Format "08/2026" atau "08-2026"
  const mNum = v.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (mNum) {
    const bln = bulanId[mNum[1].padStart(2,'0')] || mNum[1];
    return `${bln} ${mNum[2]}`;
  }

  // Format "2026-08" atau "2026/08"
  const mYearFirst = v.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if (mYearFirst) {
    const bln = bulanId[mYearFirst[2].padStart(2,'0')] || mYearFirst[2];
    return `${bln} ${mYearFirst[1]}`;
  }

  return v; // kembalikan apa adanya jika tidak dikenali
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PARSER  —  sekarang dengan data cleaning pipeline
// ─────────────────────────────────────────────────────────────────────────────

// Parse Excel or CSV file buffer
export function parseExcelFile(fileData: ArrayBuffer): OpenItemAR[] {
  const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawRows.length) return [];

  // Log kolom yang ditemukan di file (seperti df.columns di pandas)
  const detectedCols = Object.keys(rawRows[0]);
  console.info(`[ExcelParser] Ditemukan ${rawRows.length} baris | Kolom (${detectedCols.length}): ${detectedCols.join(', ')}`);

  const parsedItems: OpenItemAR[] = rawRows
    .filter(row => {
      // Buang baris kosong total (header duplikat atau baris pemisah)
      const vals = Object.values(row).map(v => cleanStr(v));
      return vals.some(v => v.length > 0);
    })
    .map((row, idx) => {

      // ── ID ──
      const id = col(row, 'ID AR', 'id', 'ID', 'No', 'Nomor AR', 'AR ID') || `AR-IMPORT-${idx + 1}`;

      // ── Nomor ──
      const nomorKontrak = col(row, 'Nomor Kontrak', 'No Kontrak', 'nomorKontrak', 'Kontrak', 'No. Kontrak') || `CTR-${idx + 100}`;
      const nomorInvoice = col(row, 'Nomor Invoice', 'No Invoice', 'nomorInvoice', 'Invoice No', 'No. Invoice') || '-';

      // ── Pelanggan ──
      const namaPelanggan = col(row, 'Nama Pelanggan', 'namaPelanggan', 'Customer', 'Pelanggan', 'Nama Customer', 'Customer Name') || 'Customer Telkom';
      const segmen = col(row, 'Segmen', 'segmen', 'Segment', 'Customer Segment') || 'Enterprise';

      // ── Pengelolaan (CRITICAL — fuzzy normalize) ──
      const pengelolaanRaw = col(row, 'Pengelolaan', 'pengelolaan', 'Divisi', 'Division', 'Unit', 'Bagian');
      const pengelolaan: PengelolaanType = normalizePengelolaan(pengelolaanRaw || 'ERS');

      // ── Regional ──
      const regional = col(row, 'Regional', 'regional', 'Region', 'Area', 'Wilayah') || 'Jakarta';
      const regionalCategory: RegionalCategory = regional.toLowerCase().includes('jakarta') ? 'Jakarta' : 'Regional';

      // ── Nilai AR — parse Rupiah Indonesian format ──
      const nilaiARRaw =
        row['Nilai AR (Rupiah)'] ?? row['Nilai AR (Miliar Rp)'] ??
        row['Nilai AR'] ?? row['nilai ar (rupiah)'] ?? row['NILAI AR'] ??
        col(row, 'Nilai AR (Rupiah)', 'Nilai AR', 'Nilai AR (Miliar Rp)', 'AR Value', 'Amount', 'Jumlah AR', 'Nilai');
      let nilaiAR = parseRupiah(nilaiARRaw);
      // Jika kolom ditemukan sebagai miliar (kolom namanya mengandung "Miliar")
      const miliarKey = Object.keys(row).find(k => k.toLowerCase().includes('miliar') && k.toLowerCase().includes('ar'));
      if (nilaiAR === 0 && miliarKey && row[miliarKey]) {
        const miliarVal = parseRupiah(row[miliarKey]);
        nilaiAR = miliarVal < 10_000 ? miliarVal * 1_000_000_000 : miliarVal;
      }
      if (nilaiAR <= 0) nilaiAR = 0;

      // ── Tanggal AR ──
      let tanggalAR = col(row, 'Tanggal AR', 'tanggalAR', 'Tgl AR', 'Tanggal', 'Date AR', 'Tgl Invoice');
      // Jika Excel parsing menghasilkan Date object
      const tanggalKey = Object.keys(row).find(k => k.toLowerCase().includes('tanggal') || k.toLowerCase() === 'date ar');
      if (tanggalKey && row[tanggalKey] instanceof Date) {
        tanggalAR = (row[tanggalKey] as Date).toISOString().slice(0, 10);
      }
      if (!tanggalAR) tanggalAR = '2026-06-01';

      // ── Aging ──
      const agingRaw = col(row, 'Aging (Bulan)', 'Aging', 'agingMonths', 'Umur (Bulan)', 'Umur Piutang', 'Aging Month');
      const agingMonths = parseInt(agingRaw, 10) || 0;

      // Cek kolom Aging Bucket langsung, kalau kosong hitung dari agingMonths
      const agingBucketRaw = cleanStr(
        col(row, 'Aging Bucket', 'agingBucket', 'Bucket', 'Aging Category', 'Kategori Aging')
      );
      let agingBucket: AgingBucket;
      if (['0-3 Bulan', '4-12 Bulan', '13-24 Bulan', '>24 Bulan'].includes(agingBucketRaw)) {
        agingBucket = agingBucketRaw as AgingBucket;
      } else {
        agingBucket = calcAgingBucket(agingMonths);
      }

      // ── Status Layak Tagih ──
      const sltRaw = col(row, 'Status Layak Tagih', 'statusLayakTagih', 'Layak Tagih', 'Collectible Status', 'Status Collectible').toLowerCase();
      const statusLayakTagih: StatusLayakTagih = sltRaw.includes('tidak') || sltRaw.includes('no') || sltRaw.includes('false')
        ? 'Tidak Layak Tagih' : 'Layak Tagih';

      // ── Status Invoice ──
      const siRaw = col(row, 'Status Invoice', 'statusInvoice', 'Invoice Status', 'Status Invoiced').toLowerCase();
      const statusInvoice: StatusInvoice = siRaw.includes('sudah') || siRaw.includes('invoiced') || siRaw.includes('yes') || siRaw.includes('ya')
        ? 'Sudah Invoiced' : 'Belum Invoiced';

      // ── Kategori Belum Invoiced ──
      let kategoriBelumInvoiced: KategoriBelumInvoiced | null = null;
      const katRaw = col(row, 'Kategori Belum Invoiced', 'Kategori', 'kategoriBelumInvoiced', 'Kategori Invoice', 'Alasan Belum Invoice').toLowerCase();
      if (katRaw.includes('kontrak')) kategoriBelumInvoiced = 'Kontrak';
      else if (katRaw.includes('bast') || katRaw.includes('bapp')) kategoriBelumInvoiced = 'BAST / BAPP';
      else if (katRaw.includes('rekon') || katRaw.includes('slg')) kategoriBelumInvoiced = 'Rekon / SLG';
      else if (katRaw.includes('termin')) kategoriBelumInvoiced = 'Termin';
      else if (katRaw.includes('identifikasi') || katRaw.includes('identif')) kategoriBelumInvoiced = 'Identifikasi';
      else if (statusInvoice === 'Belum Invoiced' && katRaw === '') kategoriBelumInvoiced = 'Kontrak'; // default jika belum invoiced

      // ── Updated ──
      const updatedRaw = col(row, 'Updated', 'isUpdated', 'Update Status', 'Status Update').toLowerCase();
      const isUpdated = updatedRaw.includes('ya') || updatedRaw.includes('yes') || updatedRaw.includes('true') || updatedRaw === '1';

      // ── UIC / PIC ──
      const uic = col(row, 'UIC / PIC', 'UIC', 'uic', 'PIC', 'Penanggung Jawab', 'Account Manager', 'AM') || 'Segmen, Legal & Pelanggan';

      // ── Tindak Lanjut ──
      const tindakLanjut = col(row, 'Tindak Lanjut AOC', 'Tindak Lanjut', 'tindakLanjut', 'Action', 'Follow Up', 'Notes') || 'Follow up penagihan';

      // ── Due Date ──
      const dueDate = col(row, 'Due Date', 'dueDate', 'Target', 'Deadline', 'Jatuh Tempo') || 'Q3';

      // ── Periode (normalize ke "Bulan Tahun") ──
      const periodeRaw = col(row, 'Periode', 'periode', 'Period', 'Bulan', 'Month', 'Reporting Period');
      const periode = normalizePeriode(periodeRaw || 'Agustus 2026');

      // ── Catatan ──
      const catatan = col(row, 'Catatan Khusus', 'catatan', 'Catatan', 'Notes', 'Keterangan', 'Remarks') || '';

      return {
        id,
        nomorInvoice,
        nomorKontrak,
        namaPelanggan,
        segmen,
        pengelolaan,
        regional,
        regionalCategory,
        nilaiAR,
        tanggalAR,
        agingMonths,
        agingBucket,
        statusLayakTagih,
        statusInvoice,
        kategoriBelumInvoiced,
        isUpdated,
        uic,
        tindakLanjut,
        dueDate,
        periode,
        catatan
      };
    });

  // Log ringkasan hasil cleaning (seperti df.info() di pandas)
  const pengelolaanSummary = parsedItems.reduce((acc, it) => {
    acc[it.pengelolaan] = (acc[it.pengelolaan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const periodeSummary = [...new Set(parsedItems.map(i => i.periode))];
  console.info(`[ExcelParser] ✅ Cleaned ${parsedItems.length} records`);
  console.info(`[ExcelParser] Pengelolaan breakdown:`, pengelolaanSummary);
  console.info(`[ExcelParser] Periode ditemukan:`, periodeSummary);

  return parsedItems;
}


export function downloadSampleTemplate() {
  const sampleItems: OpenItemAR[] = [
    {
      id: 'AR-SAMPLE-001',
      nomorInvoice: '-',
      nomorKontrak: 'CTR-TEL/2026/ERS-089',
      namaPelanggan: 'PT Bank Mandiri (Persero) Tbk',
      segmen: 'Enterprise Banking',
      pengelolaan: 'ERS',
      regional: 'Jakarta',
      regionalCategory: 'Jakarta',
      nilaiAR: 12500000000,
      tanggalAR: '2026-06-15',
      agingMonths: 2,
      agingBucket: '0-3 Bulan',
      statusLayakTagih: 'Layak Tagih',
      statusInvoice: 'Belum Invoiced',
      kategoriBelumInvoiced: 'Kontrak',
      isUpdated: true,
      uic: 'Segmen, Legal & Pelanggan',
      tindakLanjut: 'Percepatan proses review kontrak di Legal Telkom',
      dueDate: 'Q3',
      periode: 'Agustus 2026',
      catatan: 'Addendum SLA & finalisasi klausul sekuriti data.'
    },
    {
      id: 'AR-SAMPLE-002',
      nomorInvoice: '-',
      nomorKontrak: 'CTR-TEL/2026/ERS-055',
      namaPelanggan: 'PT Pertamina Hulu Energi',
      segmen: 'BUMN Oil & Gas',
      pengelolaan: 'ERS',
      regional: 'Jakarta',
      regionalCategory: 'Jakarta',
      nilaiAR: 4800000000,
      tanggalAR: '2026-07-02',
      agingMonths: 1,
      agingBucket: '0-3 Bulan',
      statusLayakTagih: 'Layak Tagih',
      statusInvoice: 'Belum Invoiced',
      kategoriBelumInvoiced: 'BAST / BAPP',
      isUpdated: true,
      uic: 'CGA, Segmen & Pelanggan',
      tindakLanjut: 'Percepatan penerbitan dokumen BAST',
      dueDate: 'Q3',
      periode: 'Agustus 2026',
      catatan: 'Acceptance test link remote.'
    },
    {
      id: 'AR-SAMPLE-003',
      nomorInvoice: 'INV/2026/08/TEL-0981',
      nomorKontrak: 'CTR-TEL/2026/ERS-019',
      namaPelanggan: 'PT Telkomsel Indonesia',
      segmen: 'Wholesale & Telco',
      pengelolaan: 'ERS',
      regional: 'Jakarta',
      regionalCategory: 'Jakarta',
      nilaiAR: 24500000000,
      tanggalAR: '2026-07-20',
      agingMonths: 1,
      agingBucket: '0-3 Bulan',
      statusLayakTagih: 'Layak Tagih',
      statusInvoice: 'Sudah Invoiced',
      kategoriBelumInvoiced: null,
      isUpdated: true,
      uic: 'Collection & Finance',
      tindakLanjut: 'Konfirmasi jadwal transfer pembayaran',
      dueDate: '2026-08-25',
      periode: 'Agustus 2026',
      catatan: 'Invoice diterima.'
    }
  ];

  exportToExcel(sampleItems, 'Template_Open_Item_AR_SharePoint.xlsx');
}
