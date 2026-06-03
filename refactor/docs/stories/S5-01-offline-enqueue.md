# S5-01 — Integrasi antrian ke alur catat meter

- **Epic:** E7 · **Sprint:** 5 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas**, saya ingin **tetap bisa menyimpan catatan saat tidak ada sinyal**,
> agar **pekerjaan lapangan tidak terhenti**.

## Acceptance Criteria
- [ ] Saat simpan catatan gagal karena jaringan (tanpa respons server), data
      (customerId, meterBaru, catatan, photoUri) **otomatis masuk antrian lokal**.
- [ ] Pengguna diberi tahu "disimpan offline, akan disinkronkan otomatis".
- [ ] Bila online & sukses, perilaku tetap seperti semula (langsung tersimpan).

## Tugas / Subtask
- [ ] Di `ReadingScreen.onSave`, deteksi error jaringan (axios tanpa `response`) →
      `enqueueReading` (dari OfflineContext) + tampilan sukses-offline.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
