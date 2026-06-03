import { KeyValueStore, PendingReading } from './types';

const QUEUE_KEY = 'meterair_pending_readings';

// ID lokal sederhana & unik (tanpa dependensi tambahan).
export function makeLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadQueue(
  store: KeyValueStore,
): Promise<PendingReading[]> {
  const raw = await store.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingReading[]) : [];
  } catch {
    // data rusak → mulai dari kosong (jangan crash)
    return [];
  }
}

export async function saveQueue(
  store: KeyValueStore,
  list: PendingReading[],
): Promise<void> {
  await store.setItem(QUEUE_KEY, JSON.stringify(list));
}

export async function enqueue(
  store: KeyValueStore,
  item: PendingReading,
): Promise<PendingReading[]> {
  const list = await loadQueue(store);
  const next = [...list, item];
  await saveQueue(store, next);
  return next;
}

export async function removeById(
  store: KeyValueStore,
  id: string,
): Promise<PendingReading[]> {
  const list = await loadQueue(store);
  const next = list.filter((r) => r.id !== id);
  await saveQueue(store, next);
  return next;
}
