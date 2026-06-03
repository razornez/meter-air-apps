# Deployment & Konfigurasi Environment

> **Prinsip: SEMUA key & credential disimpan di environment variables, BUKAN di kode.**
> File `.env` di-gitignore (tidak pernah masuk repo). Kode hanya membaca `process.env`
> dengan default aman untuk dev. Sudah diverifikasi: tidak ada secret hardcoded di
> `refactor/api/src` maupun `refactor/mobile/src`.

## 1. Backend API (NestJS) — variabel env

Sumber template: [`api/.env.example`](api/.env.example). Salin ke `api/.env` untuk dev.

| Variabel | Wajib | Contoh | Keterangan |
|----------|:-----:|--------|------------|
| `DB_HOST` | ✓ | `localhost` | Host MySQL |
| `DB_PORT` | ✓ | `3306` | Port MySQL |
| `DB_USERNAME` | ✓ | `root` | User MySQL |
| `DB_PASSWORD` | ✓ | `••••` | **Password MySQL — credential, hanya di env** |
| `DB_DATABASE` | ✓ | `pdam` | Nama database |
| `JWT_SECRET` | ✓ | `(acak panjang)` | **Secret JWT — credential, WAJIB diganti di produksi** |
| `JWT_EXPIRES_IN` | – | `7d` | Masa berlaku token |
| `PORT` | – | `4000` | Port server (3000/3001 dipakai app lain di mesin dev) |
| `UPLOAD_DIR` | – | `uploads/foto_meter` | Folder simpan foto meter |
| `AUTH_UPGRADE_PLAINTEXT` | – | `false` | `true` saat cutover → rehash password lama ke bcrypt |
| `WATER_PRODUCT_BARCODE` | – | `B1502200001` | Barcode produk air (legacy) |
| `NODE_ENV` | – | `production` | `production` → boot gagal bila `JWT_SECRET` default |
| `CORS_ORIGIN` | – | `https://app.contoh.com` | Domain frontend (pisahkan koma). Kosong = izinkan semua (dev) |

> Keamanan lengkap & checklist produksi: lihat [SECURITY.md](SECURITY.md).

## 2. Mobile (Expo / React Native) — variabel env

| Variabel | Contoh | Keterangan |
|----------|--------|------------|
| `EXPO_PUBLIC_API_URL` | `http://192.168.1.10:4000/api` | URL backend. Emulator Android default `http://10.0.2.2:4000/api`. HP fisik → IP LAN PC. |

Set lewat file `mobile/.env` (juga gitignore) atau saat menjalankan:
`EXPO_PUBLIC_API_URL=... npx expo start`.

## 3. Menyetel env di Vercel

> Catatan: Vercel cocok untuk frontend/serverless. Untuk **NestJS + MySQL** yang
> butuh koneksi persisten, host seperti Railway/Render/VPS umumnya lebih pas. Bila
> tetap di Vercel (serverless), pakai connection pooling MySQL.

Project → **Settings → Environment Variables** → tambahkan tiap variabel di tabel
backend (`DB_HOST`, `DB_PASSWORD`, `JWT_SECRET`, dst). Untuk client web tambahkan
prefix yang diekspos sesuai framework (mis. `NEXT_PUBLIC_...`). Pisahkan nilai untuk
*Production* / *Preview* / *Development*.

Lewat CLI:

```bash
vercel env add JWT_SECRET production
vercel env add DB_PASSWORD production
# ... ulangi untuk variabel lain
```

## 4. Aturan keamanan kredensial

- `.env`, `mobile/.env`, dan `TEST-USERS.md` **gitignore** — tidak pernah di-commit.
- Ganti `JWT_SECRET` & semua password default sebelum produksi.
- Aktifkan `AUTH_UPGRADE_PLAINTEXT=true` saat cutover untuk meng-hash password lama.
- Jangan menaruh kredensial DB di aplikasi mobile — mobile hanya tahu `EXPO_PUBLIC_API_URL`.
