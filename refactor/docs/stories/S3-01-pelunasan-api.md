# S3-01 — API: pelunasan faktur (set/batal lunas) + audit

- **Epic:** E5 · **Sprint:** 3 · **Status:** Done · **Est:** M

## Story
> Sebagai **operator**, saya ingin **menandai tagihan lunas atau membatalkannya**,
> agar **status penagihan akurat & teraudit**.

## Acceptance Criteria
- [ ] `POST /faktur/payment` body `{ noFaktur, lunas }` → set `faktur.is_lunas`.
- [ ] Saat lunas: `transaksi.dibayar` diisi sebesar total; saat batal: kembali 0.
- [ ] Operasi **atomik** (faktur + transaksi dalam satu transaksi DB).
- [ ] Mencatat audit ke `log_aktivitas` (user, aksi, waktu).
- [ ] Idempoten (set lunas saat sudah lunas tetap aman). 404 bila faktur tak ada.
- [ ] Terlindungi guard.

## Tugas / Subtask
- [ ] DTO `PaymentDto` (`noFaktur` wajib, `lunas` boolean default true).
- [ ] `FakturService.setLunas()` (transaksional) + tulis log.
- [ ] Endpoint controller.
- [ ] Unit test: 404 saat tak ada; tidak menyentuh DB saat tak ada; mapping lunas→1.

## Catatan Dev
**Tanpa ubah skema** — pakai `faktur.is_lunas` & `transaksi.dibayar`. Riwayat
pembayaran granular = backlog (tabel `pembayaran`, ADR-005). noFaktur lewat **body**
(memuat '/').

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
