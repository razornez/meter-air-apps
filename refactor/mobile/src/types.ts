export interface UserProfile {
  id: number;
  username: string;
  fullname: string;
  foto: string;
  isAdmin: boolean;
  lastLogin: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: UserProfile;
}

export interface CustomerInfo {
  id: number;
  nama: string | null;
  alamat: string | null;
  tipe: string | null;
  barcode: string | null;
}

export interface MeterInfo {
  customer: CustomerInfo;
  lastMeter: number;
  alreadyRecordedThisMonth: boolean;
}

export interface TariffItem {
  level: number;
  harga: number;
  quantity: number;
  total: number;
}

export interface TariffResult {
  posts: TariffItem[];
  totalBiaya: number;
}

export interface ReadingResult {
  noFaktur: string;
  customerId: number;
  tipe: string;
  meterLama: number;
  meterBaru: number;
  pemakaian: number;
  rincian: TariffItem[];
  subtotal: number;
  beban: number;
  total: number;
  tglJatuhTempo: string;
  fotoMeter: string;
}

// ---- Fase 2 ----

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerListItem {
  id: number;
  nama: string | null;
  alamat: string | null;
  tipe: string | null;
  barcode: string | null;
}

export interface CustomerDetail {
  id: number;
  nama: string | null;
  alamat: string | null;
  tipe: string | null;
  kota: string | null;
  rt: number | null;
  rw: number | null;
  telp: string | null;
  barcode: string | null;
  lastMeter: number;
  alreadyRecordedThisMonth: boolean;
}

export interface MeterHistoryItem {
  id: number;
  tanggal: string;
  jam: string;
  meter: number;
  pemakaian: number | null;
  noFaktur: string;
}

export interface FakturListItem {
  noFaktur: string | null;
  tanggal: string | null;
  customerId: number | null;
  namaPelanggan: string | null;
  total: number;
  isLunas: boolean;
  tglJatuhTempo: string | null;
}

export interface AppConfig {
  perusahaan: string;
  alamat: string;
  telp: string;
  logo: string;
}

// ---- Sprint 4 (laporan & master data) ----

export interface ReportSummary {
  totalPelanggan: number;
  bulanIni: {
    periode: string;
    jumlahFaktur: number;
    totalTagihan: number;
    totalTerbayar: number;
    totalBelum: number;
    pemakaianM3: number;
  };
}

export interface MonthlyReport {
  periode: string;
  jumlahFaktur: number;
  totalTagihan: number;
  totalTerbayar: number;
  totalBelum: number;
}

export interface ProdukItem {
  id: number;
  barcode: string | null;
  nama: string | null;
  satuan: string | null;
  hargaJual: number | null;
  stok: string | null;
}

export interface SupplierItem {
  id: number;
  nama: string | null;
  alamat: string | null;
  telepon: string | null;
}

export interface FakturDetail {
  noFaktur: string | null;
  tanggal: string | null;
  subtotal: number | null;
  beban: number | null;
  denda: number | null;
  total: number | null;
  isLunas: boolean;
  tglJatuhTempo: string | null;
  fotoMeter: string | null;
  catatan: string | null;
  pelanggan: {
    id: number;
    nama: string | null;
    alamat: string | null;
    tipe: string | null;
  } | null;
  items: {
    produk: string | null;
    quantity: string | null;
    harga: number;
    total: number | null;
  }[];
  meter: { meter: number; tanggal: string }[];
}
