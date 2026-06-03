// Pisahkan pelanggan menjadi "belum dicatat" (pending) vs jumlah "sudah".
// Murni → mudah diuji.

export function partitionWorklist<T extends { id: number }>(
  customers: T[],
  recordedIds: Set<string>,
): { pending: T[]; done: number } {
  const pending = customers.filter((c) => !recordedIds.has(String(c.id)));
  return { pending, done: customers.length - pending.length };
}
