# S5-00 — Infra offline: storage + antrian + sync engine

- **Epic:** E7 · **Sprint:** 5 · **Status:** Done · **Est:** L

## Story
> Sebagai **tim**, saya ingin **fondasi antrian lokal & mesin sinkron yang teruji**,
> agar **pencatatan offline andal dan tidak menimbulkan dobel-catat**.

## Acceptance Criteria
- [ ] Antrian catatan meter tersimpan persisten (AsyncStorage): enqueue, load, hapus.
- [ ] `syncQueue` mengirim tiap item: sukses → buang; **409** (sudah tercatat) → buang;
      error jaringan → berhenti & simpan sisa.
- [ ] Foto diunggah best-effort (gagal foto ≠ gagal sinkron catatan).
- [ ] Logika queue & sync **murni** (storage & API di-inject) → unit test hijau.

## Tugas / Subtask
- [ ] `offline/types.ts` (PendingReading), `offline/queue.ts`, `offline/sync.ts`,
      `offline/storage.ts` (adapter AsyncStorage).
- [ ] Unit test `queue` (enqueue/remove/load rusak) & `sync` (sukses/409/network).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
