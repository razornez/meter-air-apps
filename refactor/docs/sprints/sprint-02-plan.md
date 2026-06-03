# Sprint 2 — Plan

**Tema:** QA guardrail + Manajemen pelanggan & tagihan (E3, E4)
**Tujuan sprint:** Operator/petugas dapat menelusuri pelanggan, melihat riwayat
pemakaian, dan daftar/detail tagihan — di atas fondasi test otomatis.

## Sasaran (Sprint Goal)

> "Dari mobile, saya bisa mencari pelanggan, melihat riwayat meternya, dan
> melihat daftar tagihan beserta statusnya — dan semua logika bisnis dijaga unit test."

## Backlog sprint

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S2-00** | Infrastruktur unit test (Jest) + test logika existing | — | M | ✅ Done |
| **S2-01** | API: daftar pelanggan (search + pagination) | E3 | M | ✅ Done |
| **S2-02** | API: detail pelanggan + riwayat meter (pemakaian) | E3 | M | ✅ Done |
| **S2-03** | API: daftar & detail faktur (filter periode/status) | E4 | L | ✅ Done |
| **S2-04** | Mobile: layar daftar pelanggan + cari | E3 | M | ✅ Done |
| **S2-05** | Mobile: detail pelanggan + riwayat meter | E3 | M | ✅ Done |
| **S2-06** | Mobile: daftar tagihan + detail | E4 | M | ✅ Done |

> Sprint **selesai**. Bukti uji & retrospektif: lihat `sprint-02-review.md`.

## Kapasitas & urutan

Urutan dependensi: **S2-00 → (S2-01, S2-02, S2-03) → (S2-04, S2-05, S2-06)**.
Test (S2-00) didahulukan agar story berikutnya langsung menulis test di atas infra
yang sudah ada.

## Definition of Ready (untuk tiap story)

- AC jelas & terukur · kontrak data disepakati · dependensi tersedia.

## Risiko

- Volume data pelanggan (658) & faktur (ribuan) → wajib pagination (ADR-004).
- Tanggal/format faktur lama tidak konsisten → normalisasi di service, bukan UI.

## Catatan penutup sprint

Diisi di `sprint-02-review.md` saat sprint selesai (hasil uji, coverage, demo).
