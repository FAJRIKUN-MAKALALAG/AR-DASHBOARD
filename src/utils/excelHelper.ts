import * as XLSX from 'xlsx';
import { OpenItemAR, AgingBucket, StatusLayakTagih, StatusInvoice, KategoriBelumInvoiced, PengelolaanType, RegionalCategory } from '../types';

export function formatRupiahMiliar(valueInBillions: number): string {
  // Format to Indonesian locale number e.g. 111.28 -> "Rp111,28 M"
  const formatted = valueInBillions.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `Rp${formatted} M`;
}

export function formatNumberMiliar(valueInBillions: number): string {
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

// Parse Excel or CSV file buffer
export function parseExcelFile(fileData: ArrayBuffer): OpenItemAR[] {
  const workbook = XLSX.read(fileData, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const parsedItems: OpenItemAR[] = rawRows.map((row, idx) => {
    // Determine raw values with flexible column key aliases
    const id = row['ID AR'] || row['id'] || row['ID'] || `AR-IMPORT-${idx + 1}`;
    const nomorKontrak = row['Nomor Kontrak'] || row['nomorKontrak'] || row['No Kontrak'] || `CTR-${idx + 100}`;
    const nomorInvoice = row['Nomor Invoice'] || row['nomorInvoice'] || row['No Invoice'] || '-';
    const namaPelanggan = row['Nama Pelanggan'] || row['namaPelanggan'] || row['Customer'] || 'Customer Telkom';
    const segmen = row['Segmen'] || row['segmen'] || 'Enterprise';
    const pengelolaanRaw = (row['Pengelolaan'] || row['pengelolaan'] || 'ERS').toString().toUpperCase();
    const pengelolaan: PengelolaanType = ['ERS', 'DES', 'DBS', 'DPS', 'RWS'].includes(pengelolaanRaw) 
      ? (pengelolaanRaw as PengelolaanType) 
      : 'ERS';

    const regional = row['Regional'] || row['regional'] || 'Jakarta';
    const regionalCategory: RegionalCategory = regional.toLowerCase().includes('jakarta') ? 'Jakarta' : 'Regional';

    let nilaiAR = 0;
    if (typeof row['Nilai AR (Rupiah)'] === 'number') {
      nilaiAR = row['Nilai AR (Rupiah)'];
    } else if (typeof row['Nilai AR (Miliar Rp)'] === 'number') {
      nilaiAR = row['Nilai AR (Miliar Rp)'] * 1000000000;
    } else if (typeof row['Nilai AR'] === 'number') {
      nilaiAR = row['Nilai AR'] > 10000 ? row['Nilai AR'] : row['Nilai AR'] * 1000000000;
    } else {
      const parsedNum = parseFloat(String(row['Nilai AR (Rupiah)'] || row['Nilai AR'] || '0').replace(/[^0-9.-]+/g, ''));
      nilaiAR = !isNaN(parsedNum) ? (parsedNum < 10000 ? parsedNum * 1000000000 : parsedNum) : 1000000000;
    }

    const tanggalAR = row['Tanggal AR'] || row['tanggalAR'] || '2026-06-01';
    const agingMonths = parseInt(String(row['Aging (Bulan)'] || row['agingMonths'] || '2'), 10) || 2;
    
    let agingBucket: AgingBucket = '0-3 Bulan';
    if (row['Aging Bucket'] && ['0-3 Bulan', '4-12 Bulan', '13-24 Bulan', '>24 Bulan'].includes(row['Aging Bucket'])) {
      agingBucket = row['Aging Bucket'] as AgingBucket;
    } else {
      if (agingMonths <= 3) agingBucket = '0-3 Bulan';
      else if (agingMonths <= 12) agingBucket = '4-12 Bulan';
      else if (agingMonths <= 24) agingBucket = '13-24 Bulan';
      else agingBucket = '>24 Bulan';
    }

    const statusLayakTagih: StatusLayakTagih = 
      String(row['Status Layak Tagih'] || '').toLowerCase().includes('tidak') ? 'Tidak Layak Tagih' : 'Layak Tagih';

    const statusInvoice: StatusInvoice = 
      String(row['Status Invoice'] || '').toLowerCase().includes('sudah') ? 'Sudah Invoiced' : 'Belum Invoiced';

    let kategoriBelumInvoiced: KategoriBelumInvoiced | null = null;
    const katRaw = String(row['Kategori Belum Invoiced'] || row['Kategori'] || '');
    if (katRaw.includes('Kontrak')) kategoriBelumInvoiced = 'Kontrak';
    else if (katRaw.includes('BAST') || katRaw.includes('BAPP')) kategoriBelumInvoiced = 'BAST / BAPP';
    else if (katRaw.includes('Rekon') || katRaw.includes('SLG')) kategoriBelumInvoiced = 'Rekon / SLG';
    else if (katRaw.includes('Termin')) kategoriBelumInvoiced = 'Termin';
    else if (katRaw.includes('Identifikasi')) kategoriBelumInvoiced = 'Identifikasi';

    const isUpdated = String(row['Updated'] || 'Ya').toLowerCase().includes('ya') || String(row['Updated'] || '').toLowerCase().includes('true');
    const uic = row['UIC / PIC'] || row['UIC'] || row['uic'] || 'Segmen, Legal & Pelanggan';
    const tindakLanjut = row['Tindak Lanjut AOC'] || row['Tindak Lanjut'] || row['tindakLanjut'] || 'Follow up penagihan';
    const dueDate = row['Due Date'] || row['dueDate'] || 'Q3';
    const periode = row['Periode'] || row['periode'] || 'Agustus 2026';
    const catatan = row['Catatan Khusus'] || row['catatan'] || '';

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
