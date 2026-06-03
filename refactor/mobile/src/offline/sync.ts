import { KeyValueStore } from './types';
import { loadQueue, removeById } from './queue';

export interface SyncDeps {
  store: KeyValueStore;
  // Kirim satu catatan; mengembalikan nomor faktur hasil.
  saveReading: (
    customerId: number,
    meterBaru: number,
    catatan?: string,
  ) => Promise<{ noFaktur: string }>;
  uploadPhoto: (noFaktur: string, photoUri: string) => Promise<unknown>;
  // True bila error berarti "sudah tercatat di server" (HTTP 409).
  isAlreadyRecorded: (err: unknown) => boolean;
  // True bila error PERMANEN (mis. 400 validasi) → tak akan pernah sukses.
  isPermanent: (err: unknown) => boolean;
}

export interface SyncResult {
  synced: number; // berhasil dikirim / sudah tercatat
  remaining: number; // sisa di antrian
  stopped: boolean; // berhenti sebelum tuntas (jaringan/auth/server)
}

/**
 * Kirim antrian ke server satu per satu.
 * - sukses → buang dari antrian (synced++).
 * - 409 (sudah tercatat, mis. retry) → anggap sukses, buang.
 * - error permanen (400) → buang TANPA hitung sukses (agar antrian tidak macet).
 * - error lain (jaringan/auth 401/server 5xx) → BERHENTI, sisa disimpan untuk
 *   percobaan berikutnya (data tidak hilang).
 */
export async function syncQueue(deps: SyncDeps): Promise<SyncResult> {
  let list = await loadQueue(deps.store);
  let synced = 0;

  for (const item of [...list]) {
    try {
      const res = await deps.saveReading(
        item.customerId,
        item.meterBaru,
        item.catatan,
      );
      if (item.photoUri) {
        // Foto best-effort: kegagalan tidak menggagalkan sinkron catatan.
        try {
          await deps.uploadPhoto(res.noFaktur, item.photoUri);
        } catch {
          /* abaikan */
        }
      }
      list = await removeById(deps.store, item.id);
      synced++;
    } catch (e) {
      if (deps.isAlreadyRecorded(e)) {
        list = await removeById(deps.store, item.id);
        synced++;
        continue;
      }
      if (deps.isPermanent(e)) {
        list = await removeById(deps.store, item.id);
        continue;
      }
      // Jaringan / auth / server → berhenti, simpan sisa untuk retry.
      return { synced, remaining: list.length, stopped: true };
    }
  }

  return { synced, remaining: list.length, stopped: false };
}
