# S5-02 — Indikator status + sinkronisasi (auto + manual)

- **Epic:** E7 · **Sprint:** 5 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas**, saya ingin **melihat status koneksi & jumlah antrian dan
> menyinkronkan**, agar **yakin data terkirim**.

## Acceptance Criteria
- [ ] Status online/offline terdeteksi (NetInfo) dan ditampilkan.
- [ ] Jumlah catatan pending tampil di Home; bila ada antrian, ada tombol "Sinkronkan".
- [ ] **Auto-sync** saat koneksi kembali (offline→online) dan saat aplikasi dibuka.
- [ ] Hasil sinkron diberi umpan balik (jumlah terkirim / sisa).

## Tugas / Subtask
- [ ] `OfflineContext` (NetInfo listener, pendingCount, sync, enqueueReading);
      bungkus `App`.
- [ ] Banner/indikator + tombol Sinkronkan di `HomeScreen`.
- [ ] Auto-sync di mount + saat transisi ke online.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
