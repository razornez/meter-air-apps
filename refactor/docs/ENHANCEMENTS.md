# Brainstorm Enhancement — Performance & Killer Features

Dokumen hidup. Sumber ide untuk sprint berikutnya. Skor **ICE** (Impact, Confidence,
Ease) skala 1–10; prioritas tinggi = impact besar + percaya diri + mudah.

## Konteks saat ini

- Inti lengkap (E1–E7 + E7b), ter-hardening, **61 unit test**, perf **semua ≤ 13ms**.
- Karena latensi per-request sudah sangat baik, "performance" berikutnya bergeser ke:
  **bandwidth lapangan, beban konkuren, ukuran payload/foto, dan efisiensi sinkron** —
  bukan lagi sekadar waktu query.

---

## Track A — Performance

| # | Enhancement | I | C | E | Catatan |
|---|-------------|:-:|:-:|:-:|---------|
| A1 | **Kompresi respons (gzip/brotli)** | 6 | 9 | 9 | Middleware `compression`; besar utk `/customers/snapshot`. Quick win. |
| A2 | **Sinkron snapshot inkremental (`?since=`) + ETag** | 8 | 7 | 6 | Hanya unduh pelanggan yang berubah, bukan 658 tiap kali. Hemat data petugas. |
| A3 | **Cache tarif/config di memori (TTL)** | 5 | 8 | 8 | `level_pemakaian` & `config` jarang berubah tapi sering dibaca. |
| A4 | **Kompres & resize foto meter sebelum upload** | 7 | 8 | 7 | `expo-image-manipulator` → upload lebih cepat di sinyal lemah. |
| A5 | **Load test konkuren (k6/autocannon)** | 6 | 8 | 7 | Validasi p95 di bawah beban, bukan hanya 1 request. Tambah ke guardrail. |
| A6 | **Lazy-load layar + audit bundle** | 4 | 6 | 6 | Startup mobile lebih cepat; profil dengan `expo-atlas`. |
| A7 | **HTTP cache headers + Cache-Control** | 5 | 7 | 7 | Mobile skip re-fetch config/snapshot bila belum berubah. |
| A8 | **Indeks lanjutan + EXPLAIN audit berkala** | 5 | 8 | 7 | Tinjau query saat data tumbuh (mis. `faktur` ratusan ribu). |

**Quick wins paling murah:** A1 (kompresi), A3 (cache tarif), A4 (kompres foto).

---

## Track B — Killer Features (nilai bisnis PDAM)

| # | Fitur | I | C | E | Kenapa "killer" |
|---|-------|:-:|:-:|:-:|-----------------|
| B1 | **Pembayaran digital QRIS / Virtual Account** (Midtrans/Xendit) | 10 | 7 | 4 | Pelanggan bayar online → otomatis `lunas`. Transformasi tingkat penagihan. |
| B2 | **OCR angka meter dari foto** (on-device/cloud) | 9 | 6 | 4 | Pra-isi angka meter dari foto → lebih cepat & minim salah ketik. Efisiensi inti harian. |
| B3 | **Kirim tagihan via WhatsApp** (PDF/link) | 9 | 7 | 6 | Auto-kirim faktur ke pelanggan; hemat distribusi manual. |
| B4 | **Deteksi anomali konsumsi (rule-based)** | 8 | 8 | 7 | Lonjakan = bocor; nol = meter rusak/tampering; drop = reset. Tangkap kebocoran & kecurangan otomatis. |
| B5 | **Reminder tunggakan otomatis** (WA/SMS) | 8 | 7 | 6 | Ingatkan pelanggan jatuh tempo/menunggak → tingkatkan koleksi. |
| B6 | **Foto meter ber-watermark GPS + waktu** | 6 | 8 | 7 | Bukti lokasi & waktu baca; anti-fraud petugas. |
| B7 | **Peta pelanggan + rute baca optimal** | 7 | 6 | 4 | Kurangi waktu tempuh petugas (butuh geocode rt/rw). |
| B8 | **RBAC peran (petugas/kasir/manajer) + audit** | 6 | 8 | 7 | Saat ini semua admin. Pisahkan wewenang + jejak audit. |
| B9 | **Dashboard manajer (web) dgn grafik** | 7 | 7 | 6 | Tren konsumsi, collection rate, top penunggak. Lengkapi admin web. |
| B10 | **Tarif simulator (what-if)** | 5 | 7 | 6 | Simulasi dampak perubahan tarif ke pendapatan. |

---

## Matriks prioritas (rekomendasi)

```
        Impact tinggi
            ▲
    B1 ●    │   ● B4 (anomali)     ← B4: impact tinggi + MUDAH (rule-based, tanpa dep)
    B2 ●    │   ● B3  ● B5
    ────────┼───────────────► Ease tinggi
    B7 ●    │   ● A2  ● A4  ● A1/A3 (quick wins)
            │
```

- **Cepat & berdampak (lakukan dulu):** B4 (anomali), A1/A3/A4 (perf quick wins).
- **Bertaruh besar (rencanakan):** B1 (pembayaran), B2 (OCR), B3 (WhatsApp).

---

## Rekomendasi Sprint 7 — "Cepat lapangan + cerdas"

Campuran perf quick-win + 1 killer feature berdampak tinggi yang **mudah & tanpa
dependensi eksternal**:

| Story | Ringkas | Track |
|-------|---------|-------|
| **S7-00** | Kompresi respons + cache tarif/config (A1, A3) | Perf |
| **S7-01** | Kompres+resize foto meter sebelum upload (A4) | Perf |
| **S7-02** | Sinkron snapshot inkremental `?since=` + ETag (A2) | Perf |
| **S7-03** | **Deteksi anomali konsumsi (rule-based)** + flag "perlu verifikasi" (B4) | Killer |
| **S7-04** | Load test k6/autocannon → tambah ke guardrail (A5) | Perf/QA |

**Kenapa B4 dulu:** memakai data yang sudah ada (`history_meter`/pemakaian), logika
murni (mudah di-unit-test sesuai standar kita), tanpa biaya pihak ketiga, langsung
menangkap kebocoran/kecurangan — ROI tertinggi untuk usaha terkecil.

### Sprint 8+ (bertaruh besar)
- **B1 Pembayaran digital** (QRIS/VA via Midtrans/Xendit) + webhook → auto-lunas +
  tabel `pembayaran` (sudah ada) menampung detail.
- **B2 OCR meter** (mulai dari cloud OCR, lalu on-device).
- **B3/B5 WhatsApp** (kirim tagihan + reminder).

---

## Catatan implementasi (agar tetap sesuai guardrail)

- Setiap fitur: 1 story = 1 PR, unit test untuk logika murni, `npm run perf` tetap
  hijau (<1s), tidak ubah skema tanpa migrasi.
- Fitur berbiaya (gateway, WA, OCR cloud): kredensial **hanya di env** (lihat
  DEPLOYMENT.md); buat mode "mock" untuk dev/test agar tak bergantung jaringan.
