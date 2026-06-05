export interface UserProfile {
  id: number;
  username: string;
  fullname: string;
  foto: string;
  isAdmin: boolean;
  lastLogin: string | null;
}

export interface TenantInfo {
  id: number;
  nama: string;
  kode: string;
  expired_at: string | null;
  sisa_hari: number | null;
  dalam_grace_period: boolean;
}
export interface LoginResponse {
  access_token: string;
  user: UserProfile;
  tenant: TenantInfo;
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
  // Opsional: diisi dari CustomerDetail (untuk hint GPS di ReadingScreen).
  latitude?: number | null;
  longitude?: number | null;
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
  latitude: number | null;
  longitude: number | null;
}

export interface CustomerMarker {
  id: number;
  nama: string | null;
  alamat: string | null;
  lat: number;
  lng: number;
  status: 'lunas' | 'belum' | 'none';
}

export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  type: 'cash' | 'ewallet' | 'bank_static' | 'midtrans';
  isActive: number;
  icon: string;
  logoBg: string;
  logoText: string;
  logoUrl: string | null;
  instructions: string | null;
  accountNumber: string | null;
  accountName: string | null;
  sortOrder: number;
}

export interface PayResponse {
  type: string;
  // cash
  success?: boolean;
  jumlah?: number;
  // midtrans
  alreadyPaid?: boolean;
  token?: string;
  redirectUrl?: string;
  orderId?: string;
  // transfer
  accountNumber?: string;
  accountName?: string;
  amount?: number;
  instructions?: string;
}

export interface TunggakanItem {
  customerId: number;
  nama: string | null;
  alamat: string | null;
  telp: string | null;
  jumlahFaktur: number;
  totalTagihan: number;
  totalDenda: number;
  grandTotal: number;
  hariTelatMax: number;
}

export interface TunggakanResponse {
  data: TunggakanItem[];
  total: number;
  totalTagihan: number;
  totalDenda: number;
  grandTotal: number;
  page: number;
  limit: number;
}

export interface WorklistItem {
  id: number;
  nama: string | null;
  alamat: string | null;
  tipe: string | null;
  barcode: string | null;
  lastMeter: number;
  alreadyRecorded?: boolean;      // sudah dicatat bulan ini
}

export interface Worklist {
  periode: string;
  total: number;
  done: number;
  pending: number;
  customers: WorklistItem[];
}

export interface Anomaly {
  customerId: number;
  nama: string | null;
  alamat: string | null;
  type: 'lonjakan' | 'nol' | 'turun';
  severity: 'tinggi' | 'sedang';
  latest: number;
  rata: number;
  rasio: number;
  alasan: string;
  lastMeter: number;
  tanggal: string;
}

export interface MeterHistoryItem {
  id: number;
  tanggal: string;
  jam: string;
  meter: number;
  pemakaian: number | null;
  noFaktur: string;
  fotoUrl?: string | null;   // foto bukti meteran bila tersedia
  isLunas?: boolean | null;  // status bayar faktur terkait
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

export interface KinerjaItem {
  kasirId: number;
  nama: string;
  jumlah: number;
  pct: number;
}

export interface KinerjaResponse {
  periode: string;
  total: number;
  totalPelanggan: number;
  data: KinerjaItem[];
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
    telp?: string | null;
  } | null;
  items: {
    produk: string | null;
    quantity: string | null;
    harga: number;
    total: number | null;
  }[];
  meter: { meter: number; tanggal: string }[];
}

