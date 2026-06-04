# Migration 008 — Drop legacy `pdam` database

**Tanggal:** 2026-06-04  
**Sprint:** S12 (Multi-Tenancy)

## Apa yang dilakukan

Database `pdam` (legacy dari CI3 lama) dihapus karena sudah tidak digunakan.

## Alasan

- Laravel admin web sudah migrasi ke database `meterair` (commit e73185f Sprint S1)
- NestJS API juga sudah pindah ke `meterair` (Sprint S12, commit 48f5f7f)
- Data di `pdam` identik dengan `meterair` (658 customer, ~3329 faktur) — sudah di-copy saat migrasi admin web
- `pdam` tidak memiliki kolom `tenant_id` dan tabel `tenants` (skema multi-tenant)

## Database aktif saat ini

| Aplikasi | Database |
|---|---|
| Laravel Admin Web | `meterair` |
| NestJS API (mobile) | `meterair` |

## Backup

Sebelum dihapus, tidak ada koneksi aktif ke `pdam` (konfirmasi via `information_schema.processlist`).
Jika perlu restore, gunakan backup terakhir atau rekonstruksi dari data `meterair`.
