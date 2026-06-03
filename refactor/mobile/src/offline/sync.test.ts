import { syncQueue, SyncDeps } from './sync';
import { enqueue } from './queue';
import { KeyValueStore, PendingReading } from './types';

function memStore(): KeyValueStore {
  const data: Record<string, string> = {};
  return {
    getItem: async (k) => data[k] ?? null,
    setItem: async (k, v) => {
      data[k] = v;
    },
  };
}

function reading(id: string, photo?: string): PendingReading {
  return {
    id,
    customerId: Number(id) || 1,
    customerNama: 'A',
    meterBaru: 100,
    photoUri: photo ?? null,
    createdAt: '2026-06-03T00:00:00.000Z',
  };
}

function baseDeps(store: KeyValueStore): SyncDeps {
  return {
    store,
    saveReading: async () => ({ noFaktur: 'FA/X' }),
    uploadPhoto: async () => undefined,
    isAlreadyRecorded: () => false,
    isPermanent: () => false,
  };
}

describe('syncQueue', () => {
  it('mengirim semua item & mengosongkan antrian', async () => {
    const store = memStore();
    await enqueue(store, reading('1'));
    await enqueue(store, reading('2'));
    const res = await syncQueue(baseDeps(store));
    expect(res).toEqual({ synced: 2, remaining: 0, stopped: false });
  });

  it('respons 409 (sudah tercatat) diperlakukan sukses', async () => {
    const store = memStore();
    await enqueue(store, reading('1'));
    const res = await syncQueue({
      ...baseDeps(store),
      saveReading: async () => {
        throw { status: 409 };
      },
      isAlreadyRecorded: () => true,
    });
    expect(res.synced).toBe(1);
    expect(res.remaining).toBe(0);
  });

  it('error jaringan/auth menghentikan sinkron & menyimpan sisa', async () => {
    const store = memStore();
    await enqueue(store, reading('1'));
    await enqueue(store, reading('2'));
    const res = await syncQueue({
      ...baseDeps(store),
      saveReading: async () => {
        throw { message: 'Network Error' };
      },
    });
    expect(res.synced).toBe(0);
    expect(res.remaining).toBe(2);
    expect(res.stopped).toBe(true);
  });

  it('error permanen (400) membuang item agar antrian tidak macet', async () => {
    const store = memStore();
    await enqueue(store, reading('1'));
    const res = await syncQueue({
      ...baseDeps(store),
      saveReading: async () => {
        throw { status: 400 };
      },
      isPermanent: () => true,
    });
    expect(res.synced).toBe(0);
    expect(res.remaining).toBe(0); // dibuang, tidak dihitung sukses
  });

  it('kegagalan upload foto tidak menggagalkan sinkron catatan', async () => {
    const store = memStore();
    await enqueue(store, reading('1', 'file://foto.jpg'));
    const res = await syncQueue({
      ...baseDeps(store),
      uploadPhoto: async () => {
        throw new Error('upload gagal');
      },
    });
    expect(res.synced).toBe(1);
    expect(res.remaining).toBe(0);
  });
});
