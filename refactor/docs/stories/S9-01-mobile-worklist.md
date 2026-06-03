# S9-01 — Mobile worklist pencatatan

- **Epic:** E10 · **Sprint:** 9 · **Status:** Done · **Est:** M

## Story
> Sebagai **petugas**, saya ingin **layar worklist dengan progres & daftar belum
> dicatat**, agar **bisa langsung catat dari situ**.

## Acceptance Criteria
- [ ] `WorklistScreen`: header progres (done/total + %, progress bar), periode.
- [ ] Daftar pelanggan belum dicatat; tap → buka **Reading** (langsung catat).
- [ ] Loading/error; empty = "semua sudah dicatat 🎉".
- [ ] Kartu **Worklist** menonjol di Home (alat harian).

## Tugas
- [ ] `services`: `apiWorklist`. `types`: `Worklist`.
- [ ] `WorklistScreen` + registrasi nav + kartu di Home (bangun `MeterInfo` dari item
      → navigasi Reading, `alreadyRecordedThisMonth=false`).

## DoD
Lihat [definition-of-done.md](../standards/definition-of-done.md).
