import { KeyValueStore } from './types';

export interface CachedCustomer {
  id: number;
  nama: string | null;
  alamat: string | null;
  tipe: string | null;
  barcode: string | null;
  lastMeter: number;
}

export interface CustomerCacheData {
  customers: CachedCustomer[];
  syncedAt: string | null;
}

const CACHE_KEY = 'meterair_customer_cache';
const EMPTY: CustomerCacheData = { customers: [], syncedAt: null };

export async function loadCustomerCache(
  store: KeyValueStore,
): Promise<CustomerCacheData> {
  const raw = await store.getItem(CACHE_KEY);
  if (!raw) return EMPTY;
  try {
    const p = JSON.parse(raw);
    return {
      customers: Array.isArray(p?.customers) ? p.customers : [],
      syncedAt: typeof p?.syncedAt === 'string' ? p.syncedAt : null,
    };
  } catch {
    return EMPTY;
  }
}

export async function saveCustomerCache(
  store: KeyValueStore,
  customers: CachedCustomer[],
): Promise<CustomerCacheData> {
  const data: CustomerCacheData = {
    customers,
    syncedAt: new Date().toISOString(),
  };
  await store.setItem(CACHE_KEY, JSON.stringify(data));
  return data;
}

// ---- Fungsi murni (mudah diuji) ----

// Cocokkan kode hasil scan: barcode dulu, lalu id numerik.
export function resolveFromCache(
  list: CachedCustomer[],
  code: string,
): CachedCustomer | null {
  const c = String(code).trim();
  const byBarcode = list.find((x) => x.barcode != null && x.barcode === c);
  if (byBarcode) return byBarcode;
  if (/^\d+$/.test(c)) {
    const id = parseInt(c, 10);
    return list.find((x) => x.id === id) ?? null;
  }
  return null;
}

// Cari di cache (nama / id / alamat), dibatasi agar ringan.
export function searchCache(
  list: CachedCustomer[],
  query: string,
  limit = 50,
): CachedCustomer[] {
  const s = query.trim().toLowerCase();
  if (!s) return list.slice(0, limit);
  return list
    .filter(
      (x) =>
        (x.nama ?? '').toLowerCase().includes(s) ||
        String(x.id).includes(s) ||
        (x.alamat ?? '').toLowerCase().includes(s),
    )
    .slice(0, limit);
}
