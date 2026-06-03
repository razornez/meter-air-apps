# S10-03 — GPS otomatis saat catat meter

- **Epic:** E8b · **Sprint:** 10 · **Status:** Done · **Est:** S

## Acceptance Criteria
- [ ] Di `ReadingScreen`, bila pelanggan **belum punya koordinat**, tampil banner
      "📍 Tandai lokasi saat ini?". Petugas tap "Ya" → GPS → `PATCH /:id/location`
      background (tidak blok alur catat).
- [ ] Berhasil atau gagal tidak menggagalkan simpan meter.

## DoD
[definition-of-done.md](../standards/definition-of-done.md).
