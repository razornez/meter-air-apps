import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiErrorMessage } from '../api/client';

/**
 * Boilerplate fetch/loading/error/refresh untuk layar data — auto-fetch saat layar fokus.
 * Mengganti pola useState×4 + load() + onRefresh yang sebelumnya di-copy-paste di banyak layar.
 *
 *   const { data, loading, error, refreshing, reload, onRefresh } = useAsyncData(() => apiAnomalies(100));
 *   const items = data ?? [];
 *
 * Fetcher boleh arrow inline (di-pegang via ref → tak memicu refetch tiap render).
 */
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher; // selalu pakai versi terbaru (mis. closure filter)

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setData(await fetcherRef.current());
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch saat layar pertama tampil & tiap kembali fokus (data selalu segar).
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const onRefresh = useCallback(() => load(true), [load]);
  return { data, loading, error, refreshing, reload: load, onRefresh };
}
