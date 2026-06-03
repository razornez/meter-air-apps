import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { asyncStore } from './storage';
import { enqueue, loadQueue, makeLocalId } from './queue';
import { syncQueue, SyncResult } from './sync';
import { PendingReading } from './types';
import {
  CachedCustomer,
  loadCustomerCache,
  resolveFromCache,
  saveCustomerCache,
  searchCache,
} from './customerCache';
import {
  apiCustomerSnapshot,
  apiSaveReading,
  apiUploadPhoto,
} from '../api/services';
import {
  isAlreadyRecorded,
  isNetworkError,
  isPermanentError,
} from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { CustomerListItem, MeterInfo } from '../types';

type NewReading = Omit<PendingReading, 'id' | 'createdAt'>;

interface OfflineState {
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  enqueueReading: (item: NewReading) => Promise<void>;
  sync: () => Promise<SyncResult | null>;
  // E7b — cache pelanggan untuk lookup offline
  cacheCount: number;
  cacheSyncedAt: string | null;
  refreshingCache: boolean;
  refreshCustomerCache: () => Promise<void>;
  resolveOffline: (code: string) => Promise<MeterInfo | null>;
  searchOffline: (query: string) => CustomerListItem[];
}

const Ctx = createContext<OfflineState | undefined>(undefined);
const SNAPSHOT_PAGE_SIZE = 500;

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);
  const [cacheSyncedAt, setCacheSyncedAt] = useState<string | null>(null);
  const [refreshingCache, setRefreshingCache] = useState(false);

  const syncingRef = useRef(false);
  const refreshingRef = useRef(false);
  const tokenRef = useRef<string | null>(token);
  tokenRef.current = token;
  // Cache di memori untuk lookup cepat (sumber: AsyncStorage).
  const customersRef = useRef<CachedCustomer[]>([]);

  const refreshPending = useCallback(async () => {
    const q = await loadQueue(asyncStore);
    setPendingCount(q.length);
  }, []);

  const sync = useCallback(async (): Promise<SyncResult | null> => {
    if (!tokenRef.current || syncingRef.current) return null;
    const q = await loadQueue(asyncStore);
    if (q.length === 0) return null;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const res = await syncQueue({
        store: asyncStore,
        saveReading: (cid, m, c) => apiSaveReading(cid, m, c),
        uploadPhoto: apiUploadPhoto,
        isAlreadyRecorded,
        isPermanent: isPermanentError,
      });
      await refreshPending();
      return res;
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [refreshPending]);

  const enqueueReading = useCallback(
    async (item: NewReading) => {
      await enqueue(asyncStore, {
        ...item,
        id: makeLocalId(),
        createdAt: new Date().toISOString(),
      });
      await refreshPending();
    },
    [refreshPending],
  );

  // Unduh seluruh snapshot pelanggan (berhalaman) → simpan cache.
  const refreshCustomerCache = useCallback(async () => {
    if (!tokenRef.current || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshingCache(true);
    try {
      let page = 1;
      let all: CachedCustomer[] = [];
      // batasi loop agar aman
      for (let guard = 0; guard < 50; guard++) {
        const res = await apiCustomerSnapshot(page, SNAPSHOT_PAGE_SIZE);
        all = all.concat(res.data);
        if (all.length >= res.total || res.data.length === 0) break;
        page++;
      }
      const saved = await saveCustomerCache(asyncStore, all);
      customersRef.current = all;
      setCacheCount(all.length);
      setCacheSyncedAt(saved.syncedAt);
    } catch {
      // offline / gagal → biarkan cache lama
    } finally {
      refreshingRef.current = false;
      setRefreshingCache(false);
    }
  }, []);

  const hasPendingForCustomer = useCallback(
    async (id: number): Promise<boolean> => {
      const q = await loadQueue(asyncStore);
      return q.some((r) => r.customerId === id);
    },
    [],
  );

  const resolveOffline = useCallback(
    async (code: string): Promise<MeterInfo | null> => {
      const c = resolveFromCache(customersRef.current, code);
      if (!c) return null;
      const pending = await hasPendingForCustomer(c.id);
      return {
        customer: {
          id: c.id,
          nama: c.nama,
          alamat: c.alamat,
          tipe: c.tipe,
          barcode: c.barcode,
        },
        lastMeter: c.lastMeter,
        // Offline: anggap "sudah" bila sudah ada di antrian (cegah dobel-antre).
        alreadyRecordedThisMonth: pending,
      };
    },
    [hasPendingForCustomer],
  );

  const searchOffline = useCallback((query: string): CustomerListItem[] => {
    return searchCache(customersRef.current, query).map((c) => ({
      id: c.id,
      nama: c.nama,
      alamat: c.alamat,
      tipe: c.tipe,
      barcode: c.barcode,
    }));
  }, []);

  // Muat cache & antrian dari storage saat awal.
  useEffect(() => {
    (async () => {
      await refreshPending();
      const cache = await loadCustomerCache(asyncStore);
      customersRef.current = cache.customers;
      setCacheCount(cache.customers.length);
      setCacheSyncedAt(cache.syncedAt);
    })();
  }, [refreshPending]);

  // Saat login: sinkron antrian + segarkan cache pelanggan.
  useEffect(() => {
    if (token) {
      sync();
      refreshCustomerCache();
    }
  }, [token, sync, refreshCustomerCache]);

  // Pantau konektivitas; auto-sync antrian saat kembali online.
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = state.isConnected !== false;
      setIsOnline(online);
      if (online) sync();
    });
    return () => unsub();
  }, [sync]);

  return (
    <Ctx.Provider
      value={{
        isOnline,
        pendingCount,
        syncing,
        enqueueReading,
        sync,
        cacheCount,
        cacheSyncedAt,
        refreshingCache,
        refreshCustomerCache,
        resolveOffline,
        searchOffline,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useOffline() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useOffline harus dipakai di dalam OfflineProvider');
  return c;
}
