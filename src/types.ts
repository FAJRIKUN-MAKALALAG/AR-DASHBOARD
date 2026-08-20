export type AgingBucket = '0-3 Bulan' | '4-12 Bulan' | '13-24 Bulan' | '>24 Bulan';
export type StatusLayakTagih = 'Layak Tagih' | 'Tidak Layak Tagih';
export type StatusInvoice = 'Sudah Invoiced' | 'Belum Invoiced';
export type KategoriBelumInvoiced = 'Kontrak' | 'BAST / BAPP' | 'Rekon / SLG' | 'Termin' | 'Identifikasi';
export type RegionalCategory = 'Jakarta' | 'Regional';
export type PengelolaanType = 'ERS' | 'DES' | 'DBS' | 'DPS' | 'RWS' | 'Semua';

export interface OpenItemAR {
  id: string;
  nomorInvoice?: string;
  nomorKontrak: string;
  namaPelanggan: string;
  segmen: string;
  pengelolaan: PengelolaanType;
  regional: string;
  regionalCategory: RegionalCategory;
  nilaiAR: number; // in Rupiah (e.g., 21800000000 for 21.80 M)
  tanggalAR: string;
  agingMonths: number;
  agingBucket: AgingBucket;
  statusLayakTagih: StatusLayakTagih;
  statusInvoice: StatusInvoice;
  kategoriBelumInvoiced: KategoriBelumInvoiced | null;
  isUpdated: boolean;
  uic: string;
  tindakLanjut: string;
  dueDate: string;
  periode: string; // e.g. "Agustus 2026"
  catatan?: string;
}

export interface TindakLanjutAOC {
  id: string;
  kategori: KategoriBelumInvoiced;
  nilai: number; // in billions (e.g. 21.80)
  tindakLanjut: string;
  uic: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  lastUpdated: string;
}

export interface UserAccount {
  uid?: string;
  name: string;
  email: string;
  role: string;
  department: string;
  division?: PengelolaanType;
  avatarUrl: string;
  isLoggedIn: boolean;
  jwtToken?: string;
  authProvider?: 'firebase' | 'demo' | 'google' | 'microsoft' | 'jwt';
  microsoftConnected: boolean;
  microsoftAccessToken?: string;
  microsoftTenant?: string;
  microsoftAccountEmail?: string;
}

export interface SharePointConfig {
  siteUrl: string;
  shareLink: string; // The direct shareable link or file URL entered by user
  filePath: string;
  driveName: string;
  tenantId: string;
  clientId: string;
  authToken?: string; // Microsoft Graph / Azure AD Bearer token for private files
  isPrivateRequiresAuth?: boolean;
  authMethodUsed?: string;
  autoSync: boolean;
  syncIntervalSeconds: number;
  lastSyncTime: string;
  isConnected: boolean;
  lastFetchStatus: 'idle' | 'loading' | 'success' | 'error';
  lastFetchMessage: string;
  fetchedCount: number;
  mode: 'live_sharepoint' | 'excel_upload' | 'empty';
}

export type ActiveTab =
  | 'dashboard'
  | 'ringkasan'
  | 'aging'
  | 'layak-tagih'
  | 'invoice-status'
  | 'belum-invoiced'
  | 'tindak-lanjut'
  | 'laporan'
  | 'profil'
  | 'pengaturan';
