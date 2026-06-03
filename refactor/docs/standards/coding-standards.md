# Standar Kode (Guardrail)

Wajib dipatuhi setiap story. Reviewer **menolak** PR yang melanggar tanpa alasan
terdokumentasi. Berlaku untuk backend (NestJS/TS) & mobile (RN/TS).

## 1. Prinsip inti

### SOLID
- **S — Single Responsibility.** Satu kelas/fungsi = satu alasan berubah.
  Controller hanya orkestrasi HTTP; **logika bisnis di service**; akses data di
  repository/entity. Jangan campur query DB di controller.
- **O — Open/Closed.** Tambah perilaku lewat unit baru, bukan mengubah yang stabil.
  Mis. jenis tarif baru = data di `level_pemakaian`, bukan if-else baru.
- **L — Liskov.** Implementasi interface harus bisa saling tukar tanpa kejutan.
- **I — Interface Segregation.** DTO/kontrak kecil & spesifik per kebutuhan; jangan
  satu DTO raksasa untuk semua.
- **D — Dependency Inversion.** Service bergantung pada abstraksi yang di-*inject*
  (DI NestJS), bukan `new` langsung. Memudahkan test (mock repository).

### DRY (Don't Repeat Yourself)
- Logika berulang → fungsi/service bersama (mis. `TariffService`, `formatRupiah`,
  `apiErrorMessage`). Tapi **jangan abstraksi prematur** (lihat KISS): duplikasi 2×
  boleh menunggu, 3× wajib diangkat.

### KISS (Keep It Simple)
- Pilih solusi paling sederhana yang memenuhi acceptance criteria. Hindari
  generic/abstraksi spekulatif "untuk nanti". Hapus kode mati.

### Tambahan
- **YAGNI** — jangan bangun fitur yang belum ada di story.
- **Boy Scout Rule** — tinggalkan kode lebih bersih dari saat ditemukan.

## 2. Konvensi backend (NestJS)

- Struktur per fitur: `module / controller / service / entities / dto`.
- **Controller tipis**: validasi (DTO) + panggil service + kembalikan hasil. Tanpa
  query/aturan bisnis.
- **Service**: seluruh aturan bisnis; idempoten bila relevan; lempar
  `HttpException` yang tepat (`NotFound`, `Conflict`, `Unauthorized`).
- **Akses DB** lewat Repository/QueryBuilder dengan **parameter binding**. SQL string
  concatenation = **dilarang** (alasan keamanan, lihat kode lama).
- **Validasi input** wajib via `class-validator` di DTO; aktifkan `whitelist`.
- **Transaksi DB** untuk operasi multi-tabel (mis. simpan meter = faktur+history+
  transaksi) → `dataSource.transaction`.
- **Konstanta bisnis** diberi nama (mis. `BEBAN = 5000`), tidak "magic number".

## 3. Konvensi mobile (React Native)

- Komponen fungsional + hooks. Pisahkan: `screens/` (layar), `components/`
  (UI reusable), `api/` (panggilan), `auth/` (state sesi).
- **Tidak ada fetch di dalam komponen UI murni**; lewat `api/services.ts`.
- State sesi di context; token di `expo-secure-store` (bukan AsyncStorage biasa).
- Tangani 3 keadaan setiap layar data: **loading / error / empty**.

## 4. Penamaan

| Hal | Gaya | Contoh |
|-----|------|--------|
| File kelas NestJS | kebab-case + sufiks | `tariff.service.ts` |
| Kelas/Interface/Type | PascalCase | `MeterService`, `MeterInfo` |
| Variabel/fungsi | camelCase | `generateNoFaktur` |
| Konstanta global | UPPER_SNAKE | `BEBAN` |
| Komponen React | PascalCase file | `ReadingScreen.tsx` |
| Endpoint | kebab/plural | `/customers`, `/meter/readings` |

## 5. Error & logging

- Pesan error untuk user: ramah & berbahasa Indonesia.
- Jangan menelan error diam-diam; minimal log atau lempar ulang yang bermakna.
- Mobile: gunakan `apiErrorMessage()` agar pesan konsisten.

## 6. Format & lint

- TypeScript `strictNullChecks` aktif. Tidak ada `any` tanpa alasan.
- Komentar seperlunya & **berbahasa Indonesia**, menjelaskan *kenapa*, bukan *apa*.
- Ikuti gaya kode sekitarnya (indentasi, kuotasi) agar konsisten.
