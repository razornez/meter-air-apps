# 📱 Panduan Penggunaan Aplikasi Meter Air
### Untuk Petugas Lapangan PDAM / BUMDES

**Versi:** Sprint 10 (2026)  
**Untuk:** Petugas catat meter, petugas penagih, operator

---

## 📋 Daftar Isi

1. [Persiapan Sebelum Bekerja](#1-persiapan-sebelum-bekerja)
2. [Login ke Aplikasi](#2-login-ke-aplikasi)
3. [Halaman Utama (Home)](#3-halaman-utama-home)
4. [Worklist — Alur Kerja Harian](#4-worklist--alur-kerja-harian)
5. [Cara Mencatat Meter Pelanggan](#5-cara-mencatat-meter-pelanggan)
6. [OCR — Kenali Angka Meter dari Foto](#6-ocr--kenali-angka-meter-dari-foto)
7. [Mode Offline — Tidak Ada Sinyal](#7-mode-offline--tidak-ada-sinyal)
8. [Daftar & Pencarian Pelanggan](#8-daftar--pencarian-pelanggan)
9. [Riwayat Meter & Detail Pelanggan](#9-riwayat-meter--detail-pelanggan)
10. [Tagihan & Status Lunas](#10-tagihan--status-lunas)
11. [Tandai Lunas / Batal Lunas](#11-tandai-lunas--batal-lunas)
12. [Cetak & Bagikan Faktur](#12-cetak--bagikan-faktur)
13. [Peta Konsumen](#13-peta-konsumen)
14. [Atur Lokasi Pelanggan di Peta](#14-atur-lokasi-pelanggan-di-peta)
15. [Deteksi Anomali Konsumsi](#15-deteksi-anomali-konsumsi)
16. [Tunggakan & Denda](#16-tunggakan--denda)
17. [Laporan & Rekap](#17-laporan--rekap)
18. [Master Data (Produk & Supplier)](#18-master-data-produk--supplier)
19. [Logout](#19-logout)
20. [Masalah Umum & Solusinya](#20-masalah-umum--solusinya)

---

## 1. Persiapan Sebelum Bekerja

Sebelum berangkat ke lapangan, pastikan:

- ✅ **HP terisi daya** minimal 50% (atau bawa power bank)
- ✅ **Koneksi internet tersedia** — aplikasi bisa offline, tapi data terbaru butuh internet
- ✅ **Sudah login** ke aplikasi (cukup sekali, token tersimpan)
- ✅ **Cache pelanggan diperbarui** — di halaman utama, ketuk **"Perbarui"** di pojok bawah
  bagian info cache. Ini penting agar bisa cari pelanggan walau sinyal hilang nanti.

---

## 2. Login ke Aplikasi

1. Buka aplikasi **Meter Air** di HP Anda.
2. Akan muncul layar login dengan logo dan form.
3. Ketik **username** dan **password** Anda (tanya admin bila belum punya).
4. Ketuk tombol **"Masuk"**.
5. Bila berhasil, langsung masuk ke halaman utama.

> **Tip:** Tidak perlu login ulang setiap hari — aplikasi menyimpan sesi Anda.  
> Bila muncul "Login Gagal", periksa koneksi internet dan coba lagi.

---

## 3. Halaman Utama (Home)

Halaman utama adalah pusat kendali. Dari sini Anda bisa mengakses semua fitur.

```
╔══════════════════════════════╗
║  Halo, [Nama Anda]           ║
║  Petugas Lapangan · Meter Air║
║                              ║
║  ┌──────────────────────┐    ║
║  │ WORKLIST HARI INI    │    ║
║  │ [grafik lingkaran]   │    ║
║  │ 0 dari 658 tercatat  │    ║
║  │ 658 belum dicatat  › │    ║
║  └──────────────────────┘    ║
║                              ║
║  [📷 SCAN QR METER]          ║
║                              ║
║  [👥 Pelanggan] [🧾 Tagihan] ║
║  [📊 Laporan]  [🗂️ Master]  ║
║                              ║
║  [🗺️ PETA KONSUMEN]         ║
║  [💸 TUNGGAKAN & DENDA]      ║
║  [⚠️ ANOMALI KONSUMSI]       ║
║                              ║
║  Input manual: [____] [Cari] ║
║  📇 Cache: 658 pelanggan     ║
╚══════════════════════════════╝
```

**Penjelasan tiap bagian:**

| Tombol/Kartu | Fungsi |
|---|---|
| **Worklist Hari Ini** | Daftar pelanggan yang belum dicatat bulan ini + progres |
| **Scan QR Meter** | Scan barcode di kartu pelanggan untuk langsung mencatat |
| **Pelanggan** | Cari dan lihat daftar semua pelanggan |
| **Tagihan** | Daftar faktur tagihan air |
| **Laporan** | Ringkasan KPI + rekap bulanan |
| **Master** | Data produk & supplier (referensi) |
| **Peta Konsumen** | Tampilkan semua pelanggan di peta |
| **Tunggakan & Denda** | Daftar pelanggan yang menunggak |
| **Anomali Konsumsi** | Pelanggan dengan pemakaian tidak wajar |
| **Input manual** | Cari pelanggan berdasarkan nomor ID |

---

## 4. Worklist — Alur Kerja Harian

**Worklist adalah fitur paling penting untuk petugas catat meter.**  
Ini menunjukkan siapa yang belum dicatat bulan ini.

### Cara membuka Worklist:
1. Di halaman utama, ketuk kartu **"Worklist Hari Ini"** di bagian atas.
2. Layar **"Worklist Pencatatan"** terbuka.

### Tampilan layar Worklist:
```
╔══════════════════════════════╗
║  Pencatatan 2026-06          ║
║  0 / 658 selesai (0%)        ║
║  [████████████░░░░░░░░░░░]   ║ ← progress bar
║  658 pelanggan belum dicatat ║
╠══════════════════════════════╣
║  CEP II KRISTIAWAN          ║
║  Kiangroke · meter 2        ›║
║──────────────────────────────║
║  DENI FARSITO               ║
║  Kiangroke · meter 4420     ›║
║──────────────────────────────║
║  ... (urut nama)             ║
╚══════════════════════════════╝
```

3. Tiap baris = satu pelanggan yang **belum dicatat** bulan ini.
4. Terlihat: **nama**, **alamat**, dan **angka meter terakhir**.
5. **Ketuk nama pelanggan** → langsung masuk ke layar Input Meter.

> **Tip:** Worklist otomatis **diperbarui** setiap kali Anda membukanya kembali setelah mencatat. Setelah mencatat satu pelanggan dan kembali, nama itu akan hilang dari daftar.

---

## 5. Cara Mencatat Meter Pelanggan

Ini adalah alur utama kerja petugas lapangan.

### Langkah 1 — Buka layar catat meter

Ada 3 cara:
- **A. Dari Worklist** → ketuk nama pelanggan (paling mudah & cepat ✓)
- **B. Scan QR** → ketuk "Scan QR Meter" → arahkan kamera ke QR/barcode pelanggan
- **C. Input manual** → di halaman utama, ketik nomor ID pelanggan → ketuk "Cari"

### Langkah 2 — Layar Input Meter

```
╔══════════════════════════════╗
║  DENI FARSITO               ║
║  ID 200212011                ║
║  Kiangroke                   ║
║  [Tipe B] [Meter lama: 4420] ║
║                              ║
║  📍 Tandai lokasi? (ketuk)   ║ ← muncul bila belum ada koordinat
║                              ║
║  Angka Meter Baru            ║
║  [________________]          ║ ← ketik angka di sini
║  Pemakaian: 0 m³             ║
║                              ║
║  [Hitung Tagihan]            ║
║                              ║
║  Catatan (opsional)          ║
║  [________________]          ║
║                              ║
║  Foto Meter                  ║
║  [📷 Ambil Foto Meter]       ║
║                              ║
║  [    Simpan Catatan Meter  ]║
╚══════════════════════════════╝
```

### Langkah 3 — Isi angka meter

1. Lihat angka pada meteran air di rumah pelanggan.
2. Ketuk kotak **"Angka Meter Baru"** dan ketik angkanya.
3. Pemakaian langsung dihitung otomatis (meter baru - meter lama).

### Langkah 4 — Hitung tagihan (opsional tapi disarankan)

4. Ketuk **"Hitung Tagihan"** untuk melihat perkiraan tagihan.
5. Rincian tarif berjenjang akan muncul:
   ```
   Blok 1 · 10 m³ × Rp 2.000 = Rp 20.000
   Blok 2 · 10 m³ × Rp 2.500 = Rp 25.000
   Blok 3 · 5  m³ × Rp 3.000 = Rp 15.000
   ─────────────────────────────────────
   Subtotal pemakaian          Rp 60.000
   Beban tetap                 Rp  5.000
   Perkiraan total             Rp 65.000
   ```

### Langkah 5 — Tambah catatan (bila perlu)

6. Bila ada keterangan khusus (mis. *"meter buram"*, *"segel rusak"*, *"pelanggan tidak ada di rumah"*), ketik di kolom **Catatan**.

### Langkah 6 — Ambil foto meter

7. Ketuk **"📷 Ambil Foto Meter"** → kamera terbuka.
8. Arahkan kamera ke angka pada meteran.
9. Ketuk **lingkaran putih** (tombol rana) untuk memotret.
10. Foto tersimpan.

> **Tip:** Foto penting sebagai **bukti bacaan**. Usahakan angka terlihat jelas dan tidak kabur.

### Langkah 7 — Kenali angka dari foto (OCR, opsional)

Setelah memotret, muncul tombol **"🔍 Kenali Angka Meter"**:

11. Ketuk tombol tersebut.
12. Tunggu beberapa detik (sistem membaca angka dari foto).
13. Bila berhasil, angka otomatis **terisi di kotak meter** (dengan badge ungu kecil "dari OCR").
14. **Periksa apakah angka benar** — bandingkan dengan meter fisik.
15. Bila ada angka yang salah, **hapus dan ketik ulang** yang benar.

> ⚠️ **OCR bisa salah** bila foto buram, cahaya kurang, atau angka tertutup. Selalu verifikasi sebelum simpan!

### Langkah 8 — Tandai lokasi GPS (bila diminta)

Bila pelanggan **belum ada titik di peta**, muncul banner biru:  
*"📍 Tandai lokasi pelanggan saat ini? (ketuk)"*

16. Ketuk banner tersebut → HP mengambil posisi GPS Anda.
17. Koordinat tersimpan otomatis sebagai lokasi pelanggan tersebut.

> Lakukan ini selama Anda berada **di depan rumah pelanggan**.

### Langkah 9 — Simpan

18. Ketuk tombol **"Simpan Catatan Meter"** (besar, di bawah).
19. Tunggu sebentar.
20. Muncul layar sukses dengan rincian lengkap: nomor faktur, total tagihan, jatuh tempo.
21. Ketuk **"Selesai"** → kembali ke halaman utama atau worklist.

✅ **Selesai! Satu pelanggan sudah dicatat.**

---

## 6. OCR — Kenali Angka Meter dari Foto

Fitur ini membantu petugas **tidak perlu mengetik angka manual** — sistem membaca sendiri dari foto.

### Cara menggunakan:
1. Di layar Input Meter, ambil foto meter terlebih dahulu.
2. Setelah foto muncul, ketuk **"🔍 Kenali Angka Meter"**.
3. Indikator loading muncul — tunggu (bisa 5–30 detik tergantung foto).
4. Angka terisi otomatis di kotak input (border ungu, badge "dari OCR · bisa diedit").

### Hal yang perlu diperhatikan:
- **Selalu verifikasi** angka yang muncul — bandingkan dengan angka di meteran fisik.
- Bila angka **tidak ditemukan**, sistem memberi tahu. Ketik manual saja.
- Bila angka **salah**: hapus isi kotak, ketik yang benar — badge OCR akan hilang otomatis.
- Foto yang baik = hasil OCR lebih akurat. Tips foto meter yang bagus:
  - Cahaya cukup (jangan backlight/gelap)
  - Kamera tegak lurus ke meteran
  - Angka terlihat jelas, tidak buram
  - Jarak 15–25 cm dari meteran

---

## 7. Mode Offline — Tidak Ada Sinyal

Aplikasi tetap bisa dipakai **walau tidak ada sinyal internet**.

### Yang bisa dilakukan saat offline:
- ✅ Mencatat meter (tersimpan di HP, dikirim nanti)
- ✅ Mencari pelanggan dari cache lokal
- ✅ Melihat worklist dan riwayat meter (dari cache)
- ❌ OCR tidak bisa (butuh server backend)
- ❌ Peta tidak bisa (butuh internet untuk tile peta)

### Apa yang terjadi saat simpan meter offline:

1. Anda menekan "Simpan Catatan Meter" saat tidak ada sinyal.
2. Muncul layar **"Tersimpan Offline"** (ikon abu-abu):
   ```
   📥 Tersimpan Offline
   
   Catatan disimpan di perangkat &
   akan dikirim otomatis saat ada
   koneksi internet.
   ```
3. Data tersimpan di HP Anda — **tidak hilang** meski HP dimatikan.

### Sinkronisasi otomatis:
Begitu sinyal kembali, aplikasi **otomatis mengirim** catatan yang tertunda.  
Anda juga bisa memicu manual:

1. Di halaman utama, bila ada antrian, muncul banner biru:  
   *"X catatan menunggu sinkron"*
2. Ketuk tombol **"Sinkronkan"**.
3. Muncul konfirmasi berapa yang berhasil terkirim.

### Tips offline:
- Perbarui cache pelanggan **sebelum** berangkat ke lokasi tanpa sinyal.
- Di halaman utama, cek bagian bawah: *"📇 Cache: 658 pelanggan · [tanggal/jam sinkron]"*
- Ketuk **"Perbarui"** bila sudah lebih dari sehari.

---

## 8. Daftar & Pencarian Pelanggan

Gunakan fitur ini untuk **mencari pelanggan** tanpa scan.

### Cara membuka:
- Ketuk **"👥 Pelanggan"** di halaman utama.

### Mencari pelanggan:
1. Ketik nama, nomor ID, atau alamat di kotak pencarian.
2. Hasil muncul real-time saat Anda mengetik.
3. Ketuk nama pelanggan → masuk ke Detail Pelanggan.

### Tips:
- Pencarian **tidak sensitif huruf besar/kecil**.
- Bisa cari dengan bagian nama saja (mis. "DENI" menemukan "DENI FARSITO").
- Geser ke bawah untuk memuat lebih banyak (infinite scroll).

---

## 9. Riwayat Meter & Detail Pelanggan

Layar ini menampilkan semua info pelanggan dan riwayat pembacaan meternya.

### Cara membuka:
- Dari Daftar Pelanggan → ketuk nama pelanggan, ATAU
- Dari Layar Anomali/Tunggakan → ketuk nama pelanggan.

### Isi layar Detail Pelanggan:
```
DENI FARSITO
ID 200212011
Kiangroke

[Tipe B] [Meter: 4420] [☎ 0]

[+ Catat Meter]
[📍 Atur Lokasi]

Riwayat Pemakaian
────────────────
2020-07-07   meter 4420   pemakaian: 20 m³
2020-06-06   meter 4400   pemakaian: 15 m³
...
```

- **"+ Catat Meter"**: langsung buka layar input meter untuk pelanggan ini.
- **"📍 Atur Lokasi"** / **"📍 Ubah Lokasi"**: atur/perbarui titik di peta.
- Riwayat pemakaian ditampilkan dari terbaru ke terlama.
- Baris **paling atas adalah paling baru**.

> ℹ️ Bila tombol "Catat Meter" berwarna **abu-abu** dan bertuliskan *"Sudah dicatat bulan ini"*, artinya pelanggan ini sudah dicatat pada bulan berjalan. Catatn berikutnya baru bisa dibuat bulan depan.

---

## 10. Tagihan & Status Lunas

Untuk melihat daftar tagihan semua pelanggan atau per pelanggan.

### Cara membuka:
- Ketuk **"🧾 Tagihan"** di halaman utama, ATAU
- Dari Detail Pelanggan → akan otomatis filter ke pelanggan itu.

### Filter yang tersedia:
| Filter | Keterangan |
|--------|-----------|
| **Semua** | Semua tagihan |
| **Bulan ini** | Hanya tagihan bulan & tahun berjalan |
| **Belum lunas** | Yang belum dibayar |

### Keterangan warna:
- 🟢 **LUNAS** (latar hijau) — sudah dibayar
- 🔴 **BELUM** (latar merah) — belum dibayar

### Membuka detail tagihan:
- Ketuk baris tagihan → layar **Detail Tagihan** terbuka.
- Terlihat: pelanggan, rincian pemakaian, total, jatuh tempo, foto meter.

---

## 11. Tandai Lunas / Batal Lunas

Petugas penagih bisa mengubah status pembayaran langsung dari aplikasi.

### Cara:
1. Buka **Detail Tagihan** (dari menu Tagihan atau Tunggakan).
2. Di bagian atas, ada tiga tombol:
   - **"✓ Tandai Lunas"** (hijau) — bila belum lunas
   - **"Batal Lunas"** (oranye) — bila sudah lunas (untuk koreksi)
   - **"🖨 Cetak"** dan **"📤 Bagikan"**
3. Ketuk **"✓ Tandai Lunas"**.
4. Muncul konfirmasi: *"Ubah status faktur FA/BD/...?"* → ketuk **"Ya"**.
5. Status berubah dan halaman diperbarui.

> ⚠️ Pastikan sudah menerima pembayaran sebelum menandai lunas!

---

## 12. Cetak & Bagikan Faktur

### Cara:
1. Buka **Detail Tagihan**.
2. Ketuk **"🖨 Cetak"** → dialog cetak terbuka (butuh printer yang terhubung).
3. Atau ketuk **"📤 Bagikan"** → pilih WhatsApp, Email, dll.

Faktur yang dibagikan berisi:
- Kop perusahaan/BUMDES lengkap
- Data pelanggan (nama, ID, tipe)
- Rincian pemakaian per blok tarif
- Total tagihan + denda (bila ada)
- Jatuh tempo
- Status lunas/belum

---

## 13. Peta Konsumen

Tampilkan **semua pelanggan dalam satu peta** dengan warna status pembayaran.

### Cara membuka:
- Ketuk **"🗺️ Peta Konsumen"** di halaman utama.

### Tampilan peta:
```
[Peta OpenStreetMap dengan titik-titik berwarna]

🟢 Lunas (161)
🔴 Belum bayar (457)
⚪ Belum ada tagihan (40)
```

### Cara menggunakan peta:
- **Cubit/perbesar** (pinch zoom) untuk memperbesar area.
- **Ketuk titik** → muncul popup nama pelanggan dan statusnya.
- Peta otomatis **terpusat** di area rata-rata pelanggan.

> ℹ️ Peta butuh **koneksi internet** (tile peta dari OpenStreetMap). Tidak bisa offline.

---

## 14. Atur Lokasi Pelanggan di Peta

Setiap petugas bisa memperbarui koordinat pelanggan saat berada di lokasi.

### Cara 1 — Dari Detail Pelanggan:
1. Buka Detail Pelanggan.
2. Ketuk **"📍 Atur Lokasi"** atau **"📍 Ubah Lokasi"**.
3. Layar peta terbuka dengan tombol GPS di atas.

### Cara 2 — Saat Mencatat Meter:
1. Di layar Input Meter, ketuk banner biru *"📍 Tandai lokasi pelanggan saat ini?"*
2. GPS bekerja otomatis — koordinat tersimpan tanpa membuka peta.

### Di layar Atur Lokasi:
```
DENI FARSITO
Tekan peta untuk menaruh titik — atau:
[📍 Gunakan GPS saat ini]

[PETA OPENSTREETMAP]
  · (tekan titik mana saja)

Titik: -7.021030, 107.582410
[      Simpan Lokasi      ]
```

- **"📍 Gunakan GPS saat ini"**: otomatis menaruh pin di posisi HP sekarang.
- **Ketuk peta**: taruh pin di lokasi yang tepat.
- **Seret pin**: koreksi posisi.
- Ketuk **"Simpan Lokasi"** setelah selesai.

---

## 15. Deteksi Anomali Konsumsi

Sistem otomatis mendeteksi pelanggan dengan **pemakaian air tidak wajar** — kemungkinan bocor, meter rusak, atau masalah lain.

### Cara membuka:
- Ketuk **"⚠️ Anomali Konsumsi"** di halaman utama.

### Jenis anomali:
| Tanda | Jenis | Arti | Tindakan |
|-------|-------|------|----------|
| ⤴ **Lonjakan** | Merah | Pemakaian ≥3× rata-rata | Cek kebocoran pipa |
| ⛔ **Nol** | Merah | 0 padahal biasanya ada | Cek meter / segel |
| ⤵ **Turun** | Oranye | Turun drastis (≤30%) | Cek meter / penghuni |

### Contoh tampilan:
```
⚠ 8 pelanggan perlu diverifikasi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ ADE RUKMIN              [⤴ Lonjakan]
│ Pemakaian melonjak 79.7× rata-rata
│ Terakhir 526 m³ · rata-rata 6.6 m³
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ YETI RUSMIATI           [⤴ Lonjakan]
│ Pemakaian melonjak 88× rata-rata
│ Terakhir 22 m³ · rata-rata 0.3 m³
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- **Ketuk nama** → buka detail pelanggan untuk verifikasi dan tindak lanjut.

---

## 16. Tunggakan & Denda

Daftar pelanggan yang **belum bayar** tagihan air (melewati jatuh tempo).

### Cara membuka:
- Ketuk **"💸 Tunggakan & Denda"** di halaman utama.

### Tampilan:
```
┌─────────────────────────────┐
│ Pelanggan menunggak: 600    │
│ Total tagihan: Rp 93.938.000│
│ Total denda:   Rp 10.660.000│
│ Grand total:  Rp 104.598.000│ ← ini yang ditagihkan
└─────────────────────────────┘

YANI BUDIYANI             Rp 8.480.000
6 faktur · telat 2326 hari
denda Rp 30.000            ›

MCK RW 12                 Rp 5.125.000
3 faktur · telat 2266 hari
denda Rp 15.000            ›
```

- Diurutkan dari **nominal terbesar** (yang paling prioritas ditagih).
- Tertera: jumlah faktur, berapa hari telat, total denda.
- **Ketuk nama** → daftar faktur pelanggan tersebut.

> ℹ️ Grand total = tagihan + denda yang harus dibayar pelanggan.

---

## 17. Laporan & Rekap

Untuk melihat ringkasan kinerja penagihan.

### Cara membuka:
- Ketuk **"📊 Laporan"** di halaman utama.

### Isi laporan:
```
Bulan Ini (2026-06)
┌────────┬────────────┐
│Pelanggan│      658  │
│Faktur   │        0  │ ← jumlah faktur bulan ini
│Pemakaian│      0 m³ │
│Tagihan  │   Rp 0    │
│Terbayar │   Rp 0    │ ← hijau
│Belum    │   Rp 0    │ ← merah
└────────┴────────────┘

Rekap 6 Bulan
2020-12   2 faktur   Rp 26.000
2020-07   1 faktur   Rp 80.000
2020-05 563 faktur   Rp 27.611.000
...
```

---

## 18. Master Data (Produk & Supplier)

Data referensi untuk keperluan administrasi.

### Cara membuka:
- Ketuk **"🗂️ Master"** di halaman utama.

### Tabs:
- **Produk**: daftar barang/unit yang dipakai sistem (mis. Air PDAM)
- **Supplier**: daftar pemasok

---

## 19. Logout

Untuk keluar dari aplikasi (ganti akun atau HP):

1. Di halaman utama, ketuk tombol **⏻** (power/logout) di pojok kanan atas.
   > *Atau tombol "Keluar" tergantung versi aplikasi.*
2. Sesi dihapus — perlu login ulang untuk masuk kembali.

---

## 20. Masalah Umum & Solusinya

### ❌ "Koneksi timeout ke server"
**Penyebab:** Backend API tidak aktif atau URL API salah.  
**Solusi:**
1. Pastikan koneksi internet aktif.
2. Minta admin menyalakan server backend.
3. Bila di WiFi kampus/kantor, pastikan server juga di jaringan yang sama.

### ❌ "Login gagal"
**Penyebab:** Username/password salah atau server mati.  
**Solusi:** Cek username & password. Bila benar tapi tetap gagal, hubungi admin.

### ❌ OCR tidak menemukan angka
**Penyebab:** Foto buram, gelap, atau angka tidak terlihat jelas.  
**Solusi:** Ambil ulang foto dengan pencahayaan lebih baik, lalu coba lagi. Atau ketik manual.

### ❌ "Pelanggan tidak ada di cache"
**Penyebab:** Cache belum diperbarui atau pelanggan belum ada di database.  
**Solusi:** Perbarui cache (ketuk "Perbarui" di halaman utama) saat ada internet.

### ❌ "Sudah dicatat bulan ini"
**Penyebab:** Pelanggan sudah punya catatan meter bulan ini.  
**Solusi:** Normal. Tidak perlu mencatat ulang — tunggu bulan depan.

### ❌ Data tidak muncul / layar kosong
**Penyebab:** Belum ada data atau koneksi terputus.  
**Solusi:** Tarik ke bawah untuk refresh, atau kembali dan buka ulang layar.

### ❌ Peta tidak tampil (hanya abu-abu)
**Penyebab:** Tidak ada koneksi internet (tile peta butuh internet).  
**Solusi:** Sambungkan ke WiFi/data seluler.

### ❌ GPS tidak akurat / minta izin
**Penyebab:** Izin lokasi belum diberikan atau GPS HP tidak akurat.  
**Solusi:** Pastikan izin lokasi diaktifkan di Pengaturan HP → Aplikasi → Meter Air. Tunggu beberapa detik agar GPS memperbarui posisi.

---

## 📞 Kontak & Bantuan

Bila mengalami masalah yang tidak tercantum di panduan ini:

- **Admin sistem:** [isi kontak admin]
- **WhatsApp grup petugas:** [isi link/nomor]

---

*Panduan ini diperbarui sesuai versi aplikasi Sprint 10. Bila tampilan berbeda, kemungkinan ada pembaruan aplikasi.*
