# S3-00 — API: konfigurasi perusahaan (GET /config)

- **Epic:** E5 · **Sprint:** 3 · **Status:** Done · **Est:** S

## Story
> Sebagai **aplikasi**, saya ingin **mengambil identitas perusahaan**, agar **kop
> faktur (nama, alamat, telp, logo) tampil pada cetakan PDF**.

## Acceptance Criteria
- [ ] `GET /config` mengembalikan `{ perusahaan, alamat, telp, logo }` dari tabel `config`.
- [ ] Bila tabel kosong → kembalikan nilai default aman (string kosong), bukan error.
- [ ] Terlindungi `JwtAuthGuard`.

## Tugas / Subtask
- [ ] Entity `AppConfig` map ke tabel `config`.
- [ ] `ConfigAppService.get()` ambil baris pertama.
- [ ] Endpoint controller + module; daftarkan di `AppModule`.

## Catatan Dev
Tabel `config` punya 1 baris. Hindari bentrok nama dengan `@nestjs/config`
(gunakan nama `ConfigAppModule`/`AppConfig`).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
