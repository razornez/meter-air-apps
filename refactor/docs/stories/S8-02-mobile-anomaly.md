# S8-02 — Mobile: layar Anomali

- **Epic:** E9 · **Sprint:** 8 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas/operator**, saya ingin **melihat daftar anomali di aplikasi**,
> agar **langsung tahu pelanggan mana yang perlu dicek**.

## Acceptance Criteria
- [ ] `AnomalyScreen`: daftar dari `GET /reports/anomalies`; badge tipe + warna severity
      (tinggi=merah, sedang=oranye); tampil alasan, terakhir vs rata-rata.
- [ ] Tap item → buka detail pelanggan.
- [ ] Loading/error/empty ("tidak ada anomali"). Entry dari Home.

## Tugas
- [ ] `services`: `apiAnomalies`. `types`: `Anomaly`.
- [ ] `AnomalyScreen` + registrasi navigasi + kartu "Anomali" di Home.

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
