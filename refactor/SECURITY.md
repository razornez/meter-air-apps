# Keamanan — Ringkasan & Checklist

Lihat juga [DEPLOYMENT.md](DEPLOYMENT.md) (env) dan ADR-002/008 di
[docs/architecture/architecture.md](docs/architecture/architecture.md).

## Yang sudah diterapkan (backend API)

| Proteksi | Implementasi | Status |
|----------|--------------|:------:|
| Header keamanan HTTP | `helmet()` (CSP, HSTS, nosniff, X-Frame-Options, dll) | ✅ |
| Rate limit global | `@nestjs/throttler` — 120 req/menit/IP | ✅ |
| Rate limit login | `@Throttle` — 10 percobaan/menit/IP (anti brute-force) | ✅ |
| Validasi input ketat | `ValidationPipe` `whitelist` + `forbidNonWhitelisted` | ✅ |
| Auth | JWT (Bearer); semua endpoint di belakang `JwtAuthGuard` kecuali login | ✅ |
| Password lama | verifikasi backward-compatible; hash bcrypt saat login (flag) | ✅ |
| CORS | dibatasi via `CORS_ORIGIN` (produksi) | ✅ |
| Secret di env | semua key/credential di env; **tak ada hardcoded** (terverifikasi) | ✅ |
| Proteksi secret default | boot **berhenti** di `production` bila `JWT_SECRET` default | ✅ |
| Upload foto | maks 8MB, hanya `image/*` | ✅ |
| SQL injection | TypeORM/Query Builder + parameter binding (tanpa concat) | ✅ |

## Checklist sebelum PRODUKSI

- [ ] Set `JWT_SECRET` acak & panjang (mis. `openssl rand -base64 48`).
- [ ] Set `CORS_ORIGIN` ke domain frontend (pisahkan koma), bukan `*`.
- [ ] Set `NODE_ENV=production`.
- [ ] **Ganti semua password lemah** (`123456`, dst) & aktifkan
      `AUTH_UPGRADE_PLAINTEXT=true` untuk hashing — **setelah** panel admin lama
      (CodeIgniter) dipensiunkan, karena app lama membandingkan password plaintext.
- [ ] Pastikan HTTPS di depan API (reverse proxy / host).
- [ ] Backup DB sebelum migrasi apa pun.

## Catatan

- File berisi kredensial (`*.env`, `TEST-USERS.md`) **gitignore** — tidak pernah
  masuk repo publik.
- Rate limit & validasi tidak menggantikan audit berkala; tinjau dependensi (`npm
  audit`) secara rutin.
