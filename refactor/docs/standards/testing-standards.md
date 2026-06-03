# Standar Pengujian (QA Guardrail)

Tujuan: setiap aturan bisnis terlindungi test otomatis sehingga refactor & fitur baru
tidak diam-diam merusak perhitungan tagihan/pencatatan.

## 1. Piramida test

```
        /\        e2e (sedikit)      — alur kritis ujung-ke-ujung (login→catat meter)
       /--\
      /    \      integration        — controller + DB uji (opsional per story)
     /------\
    /        \    unit (banyak)       — service & util, mock dependensi  ◄── FOKUS UTAMA
   /----------\
```

Prioritas: **unit test untuk service berisi logika bisnis**. Itu yang paling murah,
cepat, dan paling sering jadi sumber bug regresi (perhitungan tarif, no_faktur, dll).

## 2. Target cakupan

| Area | Target coverage |
|------|-----------------|
| Logika bisnis (`tariff`, `meter`, `auth`, `faktur` service) | **≥ 80%** |
| Controller / DTO | smoke test secukupnya |
| UI mobile | komponen logika (helper) diuji; layar = manual/e2e |

Coverage **bukan** tujuan akhir — yang penting **skenario penting & edge case** teruji.

## 3. Tooling

**Backend (NestJS):** Jest + ts-jest + `@nestjs/testing`.
- File test: `*.spec.ts` bersebelahan dengan kode.
- Jalankan: `npm test` (sekali), `npm run test:watch`, `npm run test:cov` (coverage).
- Mock repository TypeORM dengan objek sederhana (lihat contoh di `tariff.service.spec.ts`).

**Mobile (Expo):** `jest-expo` + React Native Testing Library (ditambah saat ada
komponen logika non-trivial). Helper murni (mis. `formatRupiah`) wajib diuji.

## 4. Pola penulisan test

- **AAA**: Arrange → Act → Assert.
- Satu `it()` menguji **satu perilaku**; nama deskriptif berbahasa Indonesia
  (`it('menghitung tarif berjenjang tipe B untuk 25 m3 = 60000')`).
- Uji **happy path + edge case**: nol, batas blok, melimpah ke level tertinggi,
  input negatif, data kosong, duplikat.
- Test harus **deterministik** (tanggal/relasi waktu di-*inject* atau di-mock bila
  memengaruhi hasil).

## 5. Skenario wajib (minimum) untuk fitur ada saat ini

- **TariffService**: 0 m³ → 0; ≤ blok-1; lintas beberapa blok (25→60000);
  melimpah ke level tertinggi; jenis tidak dikenal → 0.
- **AuthService**: plaintext cocok diterima; bcrypt cocok; password salah → 401;
  user nonaktif → 401; flag upgrade off ⇒ tidak rehash.
- **MeterService**: `generateNoFaktur` (counter+1, format), `dueDate` (tgl 20 bulan
  depan), guard duplikat bulan ini → `ConflictException`.

## 6. Guardrail performa

Selain test fungsional, ada **budget latensi**: tidak ada endpoint fetch data yang
boleh > **1000 ms**. Dijaga skrip `api/scripts/perf-check.mjs` (`npm run perf`) yang
mengukur tiap endpoint dan gagal bila ada yang melebihi budget. Hasil terukur dicatat
di [`PERFORMANCE.md`](../../PERFORMANCE.md). Jalankan setiap menambah endpoint/query
baru. Optimasi utama: index DB (lihat `migrations/002_add_indexes.sql`).

## 7. Definition of Done terkait test

Story dengan logika bisnis **tidak boleh** "Done" tanpa unit test yang lulus untuk
skenario utamanya. Story yang menambah endpoint/query **tidak boleh** "Done" bila
`npm run perf` melebihi budget. Lihat [definition-of-done.md](definition-of-done.md).
