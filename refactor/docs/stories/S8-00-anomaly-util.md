# S8-00 — Util deteksi anomali (murni)

- **Epic:** E9 · **Sprint:** 8 · **Status:** Done · **Est:** S

## Story
> Sebagai **tim**, saya ingin **logika deteksi anomali yang murni & teruji**, agar
> **penandaan konsisten dan tidak menimbulkan false-positive konyol**.

## Acceptance Criteria
- [ ] `detectUsageAnomaly(usages: number[])` → `null` atau `{ type, severity, latest,
      rata, rasio, alasan }`.
- [ ] Tipe: `lonjakan` (≥3× & selisih ≥10, rata>0), `nol` (terakhir 0 & rata>0),
      `turun` (rata≥10 & terakhir ≤30% rata).
- [ ] Tidak menandai pelanggan baru (data < 2 periode) atau angka kecil tak berarti.
- [ ] Unit test untuk tiap tipe + kasus normal/baru.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
