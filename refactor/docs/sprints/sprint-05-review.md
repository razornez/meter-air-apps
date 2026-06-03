# Sprint 5 — Review & Retrospektif

**Tema:** Mode offline + sinkronisasi pencatatan meter (E7)
**Status:** ✅ Selesai. Semua story Done, lolos Definition of Done.

## Hasil per story

| Story | Hasil | Bukti |
|-------|-------|-------|
| S5-00 Infra offline | ✅ Done | queue + sync engine murni; **10 unit test** (enqueue/remove/corrupt, sukses/409/network/permanen/foto-gagal) |
| S5-01 Auto-enqueue | ✅ Done | `ReadingScreen` deteksi error jaringan → simpan ke antrian lokal + layar "Tersimpan Offline" |
| S5-02 Status + sinkron | ✅ Done | `OfflineProvider` (NetInfo) + banner offline/pending + tombol Sinkronkan + auto-sync saat online/login |

## Desain kunci

- **Antrian lokal** di AsyncStorage; logika queue/sync **murni** (storage & API
  di-inject) → teruji tanpa perangkat.
- **Idempotensi tanpa ubah backend:** saat sync, respons **409** ("sudah dicatat
  bulan ini") diperlakukan sukses → item dibuang. Tidak ada dobel-catat.
- **Kebijakan error aman:** hanya buang item saat 409 atau permanen (400/422);
  error jaringan/auth(401)/server(5xx) → **berhenti & simpan** (data tak hilang).
- **Auth-gated sync:** tidak menyinkron saat belum login (cegah antrian terbuang oleh 401).
- **Foto offline** disimpan sebagai `photoUri` di item; diunggah best-effort saat sync.

## Verifikasi guardrail

- Mobile `npx jest`: **4 suite, 17 test** (7 TD-6 + 10 offline), semua hijau.
- Mobile `tsc --noEmit`: lolos.
- Mobile bundle Metro: sukses (async-storage + netinfo terintegrasi).
- Backend: **35 test** tetap hijau (tidak ada perubahan backend untuk E7).

## Retrospektif

**Berjalan baik**
- Memisah logika murni dari React/Storage membuat fitur offline sepenuhnya
  unit-testable — guardrail kuat untuk alur paling kritis di lapangan.
- Mengandalkan guard server bulanan sebagai idempotensi → nol perubahan skema.

**Catatan / backlog**
- **E7b:** cache turun data pelanggan untuk **lookup offline** (scan/cari saat tanpa
  sinyal) → butuh sinkron unduh + kemungkinan SQLite. Sprint ini fokus antrian tulis.
- Pengujian end-to-end offline nyata (matikan jaringan di perangkat) disarankan saat
  uji lapangan (unit test sudah menutup logika).

## Status epik

E1–E7 (inti) ✅. Sisa: **E6b** iterasi admin web (sudah ada), **E7b** cache lookup
offline. Lihat `prd.md`.
