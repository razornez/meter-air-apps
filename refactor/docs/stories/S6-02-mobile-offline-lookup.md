# S6-02 — Mobile: lookup pelanggan offline (fallback cache)

- **Epic:** E7b · **Sprint:** 6 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas**, saya ingin **scan/cari pelanggan tetap berfungsi saat offline**,
> agar **bisa langsung mencatat meter di lapangan tanpa sinyal**.

## Acceptance Criteria
- [ ] Saat scan/cari gagal karena jaringan, sistem **fallback ke cache**: kembalikan
      data pelanggan + meter terakhir dari cache.
- [ ] `alreadyRecordedThisMonth` saat offline mempertimbangkan **antrian lokal**
      (sudah diantre → tidak dobel).
- [ ] Bila pelanggan tak ada di cache & offline → pesan jelas (mungkin cache belum
      diunduh).
- [ ] Online tetap memakai API seperti biasa.

## Tugas / Subtask
- [ ] `ScanScreen` & `HomeScreen` (lookup manual): tangkap error jaringan →
      `resolveOffline` → buka `Reading`.
- [ ] Bangun `MeterInfo` dari cache + cek `hasPendingForCustomer`.
- [ ] Indikator "data per <waktu sinkron>" di Home.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
