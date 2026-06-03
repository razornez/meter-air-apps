# Sprint 5 — Plan

**Tema:** Mode offline + sinkronisasi pencatatan meter (E7)
**Tujuan sprint:** Petugas dapat mencatat meter **tanpa sinyal**; data tersimpan lokal
dan **otomatis tersinkron** saat online kembali.

## Sasaran (Sprint Goal)

> "Di lapangan tanpa jaringan, saya tetap bisa mencatat meter; aplikasi menyimpannya
> dan mengirimkannya otomatis begitu ada koneksi — tanpa dobel-catat."

## Backlog sprint

| Story | Judul | Epic | Est | Status |
|-------|-------|------|-----|--------|
| **S5-00** | Infra offline: storage lokal + antrian (queue) + sync engine + unit test | E7 | L | ✅ Done |
| **S5-01** | Integrasi antrian ke alur catat meter (auto-enqueue saat offline) | E7 | M | ✅ Done |
| **S5-02** | Indikator status + antrian pending + sinkron (auto saat online + manual) | E7 | M | ✅ Done |

> Sprint **selesai**. Bukti uji & retrospektif: `sprint-05-review.md`.

## Urutan dependensi

**S5-00 → S5-01 → S5-02.**

## Keputusan teknis

- **Storage lokal:** `@react-native-async-storage/async-storage` (antrian kecil &
  terstruktur cukup; tidak perlu SQLite penuh untuk fase ini).
- **Konektivitas:** `@react-native-community/netinfo` → auto-sync saat reconnect.
- **Idempotensi:** mengandalkan guard server "1 catatan / pelanggan / bulan" — saat
  sync, respons **409** diperlakukan sebagai **sukses** (sudah tercatat) → item
  dibuang dari antrian. Tidak perlu perubahan skema/endpoint backend.
- **Foto offline:** `photoUri` lokal disimpan di item antrian; diunggah best-effort
  saat sync (kegagalan foto tidak menggagalkan sinkron catatan).
- Logika **queue** & **sync** dibuat murni (storage/api di-inject) agar mudah diuji.

## Di luar lingkup

- Cache penuh data pelanggan untuk lookup offline (butuh sinkron turun + SQLite) →
  backlog (E7b). Sprint ini fokus **antrian tulis** (paling kritis di lapangan).

## Penutup

Hasil & bukti uji: `sprint-05-review.md`.
