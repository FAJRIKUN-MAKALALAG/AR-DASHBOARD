import { TindakLanjutAOC, UserAccount } from '../types';

export const STORAGE_KEYS = {
  openItems: 'telkom_ar_open_items',
  aocFollowUps: 'telkom_aoc_followups',
  userAccount: 'telkom_user_account',
  jwtToken: 'telkom_jwt_token',
  microsoftToken: 'telkom_ms_token',
  sharePointConfig: 'telkom_sharepoint_config'
} as const;

export const EMPTY_AOC_FOLLOWUPS: TindakLanjutAOC[] = [
  { id: 'AOC-1', kategori: 'Kontrak', nilai: 0, tindakLanjut: 'Menunggu sinkronisasi data dari SharePoint...', uic: 'Segmen, Legal & Pelanggan', dueDate: 'Q3', status: 'Open', lastUpdated: '-' },
  { id: 'AOC-2', kategori: 'BAST / BAPP', nilai: 0, tindakLanjut: 'Menunggu sinkronisasi data dari SharePoint...', uic: 'CGA, Segmen & Pelanggan', dueDate: 'Q3', status: 'Open', lastUpdated: '-' },
  { id: 'AOC-3', kategori: 'Rekon / SLG', nilai: 0, tindakLanjut: 'Menunggu sinkronisasi data dari SharePoint...', uic: 'Billing & Collection', dueDate: 'Q3', status: 'Open', lastUpdated: '-' },
  { id: 'AOC-4', kategori: 'Termin', nilai: 0, tindakLanjut: 'Menunggu sinkronisasi data dari SharePoint...', uic: 'Project Manager & Finance', dueDate: 'Q3', status: 'Open', lastUpdated: '-' },
  { id: 'AOC-5', kategori: 'Identifikasi', nilai: 0, tindakLanjut: 'Belum ada tindak lanjut', uic: '-', dueDate: '-', status: 'Open', lastUpdated: '-' }
];

export const EMPTY_USER: UserAccount = {
  name: '',
  email: '',
  role: '',
  department: '',
  avatarUrl: '',
  isLoggedIn: false,
  jwtToken: undefined,
  authProvider: undefined,
  microsoftConnected: false,
  microsoftAccessToken: undefined,
  microsoftAccountEmail: ''
};
