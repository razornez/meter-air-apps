import { api } from './client';
import {
  AppConfig,
  CustomerDetail,
  CustomerListItem,
  FakturDetail,
  FakturListItem,
  LoginResponse,
  MeterHistoryItem,
  MeterInfo,
  MonthlyReport,
  Paginated,
  ProdukItem,
  ReadingResult,
  ReportSummary,
  SupplierItem,
  TariffResult,
  UserProfile,
} from '../types';

export async function apiLogin(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  return data;
}

export async function apiMe() {
  const { data } = await api.get<UserProfile>('/auth/me');
  return data;
}

// Resolusi kode hasil scan (barcode atau id pelanggan) → info meter.
export async function apiResolveCustomer(code: string) {
  const { data } = await api.get<MeterInfo>(
    `/customers/resolve/${encodeURIComponent(code)}`,
  );
  return data;
}

export async function apiCalculate(tipe: string, pemakaian: number) {
  const { data } = await api.post<TariffResult>('/meter/calculate', {
    tipe,
    pemakaian,
  });
  return data;
}

export async function apiSaveReading(
  customerId: number,
  meterBaru: number,
  catatan?: string,
) {
  const { data } = await api.post<ReadingResult>('/meter/readings', {
    customerId,
    meterBaru,
    catatan,
  });
  return data;
}

// ---- Fase 2 ----

export async function apiListCustomers(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<Paginated<CustomerListItem>>('/customers', {
    params,
  });
  return data;
}

export async function apiCustomerDetail(id: number) {
  const { data } = await api.get<CustomerDetail>(`/customers/${id}`);
  return data;
}

export async function apiCustomerHistory(id: number, limit = 24) {
  const { data } = await api.get<MeterHistoryItem[]>(
    `/customers/${id}/history`,
    { params: { limit } },
  );
  return data;
}

export async function apiListFaktur(params: {
  customerId?: number;
  month?: number;
  year?: number;
  isLunas?: number;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<Paginated<FakturListItem>>('/faktur', {
    params,
  });
  return data;
}

export async function apiFakturDetail(noFaktur: string) {
  const { data } = await api.get<FakturDetail>('/faktur/detail', {
    params: { noFaktur },
  });
  return data;
}

// ---- Sprint 3 ----

export async function apiGetConfig() {
  const { data } = await api.get<AppConfig>('/config');
  return data;
}

export async function apiSetFakturLunas(noFaktur: string, lunas: boolean) {
  const { data } = await api.post<{
    noFaktur: string;
    isLunas: boolean;
    dibayar: number;
  }>('/faktur/payment', { noFaktur, lunas });
  return data;
}

// ---- Sprint 4 ----

export async function apiReportSummary() {
  const { data } = await api.get<ReportSummary>('/reports/summary');
  return data;
}

export async function apiReportMonthly(months = 6) {
  const { data } = await api.get<MonthlyReport[]>('/reports/monthly', {
    params: { months },
  });
  return data;
}

export async function apiListProduk(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<Paginated<ProdukItem>>('/produk', { params });
  return data;
}

export async function apiListSupplier(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<Paginated<SupplierItem>>('/supplier', {
    params,
  });
  return data;
}

export async function apiUploadPhoto(noFaktur: string, photoUri: string) {
  const form = new FormData();
  form.append('photo', {
    uri: photoUri,
    name: 'meter.jpeg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const { data } = await api.post(
    `/meter/readings/${encodeURIComponent(noFaktur)}/photo`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data as { filename: string; path: string };
}
