# S2-00 — Infrastruktur unit test (Jest) + test logika existing

- **Epic:** — (guardrail QA) · **Sprint:** 2 · **Status:** Done · **Est:** M

## Story
> Sebagai **tim**, saya ingin **infrastruktur unit test + test untuk logika bisnis
> yang sudah ada**, agar **perubahan berikutnya tidak diam-diam merusak perhitungan**.

## Acceptance Criteria
- [ ] `npm test` di `refactor/api` menjalankan Jest dan **hijau**.
- [ ] `npm run test:cov` menghasilkan laporan coverage.
- [ ] Ada test untuk: `TariffService`, `AuthService`, `MeterService` (helper).
- [ ] Skenario edge case tarif (0, batas blok, lintas blok 25→60000, melimpah level
      tertinggi, jenis tak dikenal) tercakup.

## Tugas / Subtask
- [ ] Tambah devDeps: `jest`, `ts-jest`, `@types/jest`, `@nestjs/testing`.
- [ ] Konfig Jest (`jest.config.js`) + script `test`, `test:watch`, `test:cov`.
- [ ] `tariff.service.spec.ts` (mock repository `level_pemakaian`).
- [ ] `auth.service.spec.ts` (mock repo user + jwt; plaintext/bcrypt/salah/nonaktif).
- [ ] `meter.service.spec.ts` (generateNoFaktur, dueDate, guard duplikat).

## Catatan Test
Lihat [testing-standards.md](../standards/testing-standards.md) §5 (skenario wajib).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
