# S3-02 — Mobile: aksi Tandai Lunas / Batal Lunas

- **Epic:** E5 · **Sprint:** 3 · **Status:** Done · **Est:** M

## Story
> Sebagai **operator**, saya ingin **mengubah status lunas dari layar detail tagihan**,
> agar **tidak perlu kembali ke sistem lama**.

## Acceptance Criteria
- [ ] Di detail faktur ada tombol **Tandai Lunas** (jika belum) / **Batal Lunas** (jika lunas).
- [ ] Konfirmasi sebelum aksi; saat proses tampil loading; sukses → status & badge ter-update.
- [ ] Error ditangani dengan pesan ramah.

## Tugas / Subtask
- [ ] `services`: `apiSetFakturLunas(noFaktur, lunas)`.
- [ ] Tombol + state di `FakturDetailScreen` (refresh data setelah sukses).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
