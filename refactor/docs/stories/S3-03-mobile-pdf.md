# S3-03 — Mobile: cetak & bagikan faktur PDF

- **Epic:** E5 · **Sprint:** 3 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas/operator**, saya ingin **mencetak atau membagikan faktur sebagai PDF**,
> agar **bisa memberi bukti tagihan ke pelanggan (cetak / WhatsApp / email)**.

## Acceptance Criteria
- [ ] Di detail faktur ada tombol **Cetak / Bagikan**.
- [ ] PDF berisi kop perusahaan (dari `GET /config`), data pelanggan, rincian, total,
      status lunas, jatuh tempo.
- [ ] "Bagikan" membuka share sheet (`expo-sharing`); "Cetak" memakai dialog cetak
      (`expo-print`).
- [ ] Format rupiah & tanggal rapi.

## Tugas / Subtask
- [ ] `expo install expo-print expo-sharing`.
- [ ] `services`: `apiGetConfig()`.
- [ ] Util murni `buildFakturHtml(detail, config)` (template HTML).
- [ ] Tombol + handler cetak/bagikan di `FakturDetailScreen`.

## Catatan Dev
PDF dibuat di sisi mobile (ADR-006). `Print.printToFileAsync({ html })` → uri →
`Sharing.shareAsync(uri)`; `Print.printAsync({ html })` untuk cetak langsung.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
