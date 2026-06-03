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
import { apiSaveReading, apiUploadPhoto } from '../api/services';
import {
  isAlreadyRecorded,
  isNetworkError,
  isPermanentError,
} from '../api/client';
import { useAuth } from '../auth/AuthContext';

type NewReading = Omit<PendingReading, 'id' | 'createdAt'>;

interface OfflineState {
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  enqueueReading: (item: NewReading) => Promise<void>;
  sync: () => Promise<SyncResult | null>;
}

const Ctx = createContext<OfflineState | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Ref agar callback stabil (tak memicu resubscribe NetInfo).
  const syncingRef = useRef(false);
  const tokenRef = useRef<string | null>(token);
  tokenRef.current = token;

  const refresh = useCallback(async () => {
    const q = await loadQueue(asyncStore);
    setPendingCount(q.length);
  }, []);

  const sync = useCallback(async (): Promise<SyncResult | null> => {
    // Hanya sinkron bila sudah login (hindari membuang antrian akibat 401).
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
      await refresh();
      return res;
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [refresh]);

  const enqueueReading = useCallback(
    async (item: NewReading) => {
      await enqueue(asyncStore, {
        ...item,
        id: makeLocalId(),
        createdAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh],
  );

  // Muat jumlah antrian saat awal.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Coba sinkron saat token tersedia (login) berubah.
  useEffect(() => {
    if (token) sync();
  }, [token, sync]);

  // Pantau konektivitas; auto-sync saat kembali online.
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
      value={{ isOnline, pendingCount, syncing, enqueueReading, sync }}
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
