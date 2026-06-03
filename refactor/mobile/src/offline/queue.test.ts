import { enqueue, loadQueue, makeLocalId, removeById } from './queue';
import { KeyValueStore, PendingReading } from './types';

// Store in-memory untuk test.
function memStore(initial?: Record<string, string>): KeyValueStore {
  const data: Record<string, string> = { ...initial };
  return {
    getItem: async (k) => data[k] ?? null,
    setItem: async (k, v) => {
      data[k] = v;
    },
  };
}

function reading(id: string): PendingReading {
  return {
    id,
    customerId: 1,
    customerNama: 'A',
    meterBaru: 100,
    createdAt: '2026-06-03T00:00:00.000Z',
  };
}

describe('offline queue', () => {
  it('enqueue menambah & loadQueue mengembalikan item', async () => {
    const store = memStore();
    await enqueue(store, reading('a'));
    await enqueue(store, reading('b'));
    const list = await loadQueue(store);
    expect(list.map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('removeById menghapus item tertentu', async () => {
    const store = memStore();
    await enqueue(store, reading('a'));
    await enqueue(store, reading('b'));
    const after = await removeById(store, 'a');
    expect(after.map((r) => r.id)).toEqual(['b']);
  });

  it('antrian kosong → []', async () => {
    expect(await loadQueue(memStore())).toEqual([]);
  });

  it('data rusak → [] (tidak crash)', async () => {
    const store = memStore({ meterair_pending_readings: '{bukan json' });
    expect(await loadQueue(store)).toEqual([]);
  });

  it('makeLocalId menghasilkan id unik', () => {
    expect(makeLocalId()).not.toBe(makeLocalId());
  });
});
