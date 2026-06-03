# Sprint 3 — Review & Retrospektif

**Tema:** Pelunasan tagihan & cetak/kirim faktur PDF (E5)
**Status:** ✅ Selesai. Semua story Done, lolos Definition of Done.

## Hasil per story

| Story | Hasil | Bukti |
|-------|-------|-------|
| S3-00 API config perusahaan | ✅ Done | `GET /config` → "BUMDES KIANGROKE 2016" (data asli) |
| S3-01 API pelunasan + audit | ✅ Done | `POST /faktur/payment` lunas → is_lunas=1, dibayar=total; batal → 0; log_aktivitas terisi; 404/401 benar; **3 unit test** |
| S3-02 Mobile aksi lunas | ✅ Done | tombol Tandai/Batal Lunas + konfirmasi + refresh |
| S3-03 Mobile cetak/bagikan PDF | ✅ Done | expo-print + expo-sharing; HTML faktur berkop perusahaan |

## Verifikasi guardrail

- Backend `npx jest`: **7 suite, 31 test, semua hijau** (+3 dari Sprint 2).
- Backend `tsc --noEmit`: lolos.
- Mobile `tsc --noEmit`: lolos.
- Mobile bundle Metro: **838 modul, tanpa error** (+7 dari expo-print/sharing).
- Pelunasan diuji ke DB `pdam` memakai **baris faktur uji milik sendiri**
  (sentinel `ZZ/TEST/...`) lalu dihapus — TIDAK menyentuh data pelanggan asli.

## Keputusan teknis (ADR baru)

- **ADR-005** pelunasan tanpa tabel baru (pakai `is_lunas` + `dibayar`).
- **ADR-006** PDF dibuat di sisi mobile (expo-print), bukan server.

## Retrospektif

**Berjalan baik**
- Guardrail keamanan menolak modifikasi record produksi → mendorong pola uji
  dengan data sendiri (lebih aman & berulang).
- PDF sisi-mobile menghindari dependensi server berat; siap cetak & WhatsApp.

**Catatan / utang teknis**
- TD-5: Belum ada **tabel `pembayaran`** → riwayat pembayaran granular (jumlah,
  metode, waktu, kasir) belum tersimpan. Rekomendasi: migrasi aditif di fase lanjut.
- TD-6: **Unit test mobile (jest-expo) belum disiapkan** — util murni seperti
  `buildFakturHtml`/`formatRupiah` idealnya diuji. Versi SDK 56/RN 0.85/React 19
  masih sangat baru → setup ditunda agar tidak rapuh. Masuk backlog guardrail.

## Berikutnya (Sprint 4 — E6)

Master data (produk, stok, supplier), laporan/rekap, panel admin web. Lihat
`prd.md` §4. Pertimbangkan juga TD-5 (tabel pembayaran) & TD-6 (test mobile).
