# Definition of Done (DoD) & PR Checklist

Sebuah story baru boleh berstatus **Done** jika **semua** poin di bawah terpenuhi.
Ini guardrail terakhir sebelum merge.

## Definition of Done

### Fungsional
- [ ] Semua **Acceptance Criteria** di story tercapai & dibuktikan (uji/contoh output).
- [ ] Menangani keadaan loading / error / empty (untuk layar/endpoint data).
- [ ] Pesan error ramah & berbahasa Indonesia.

### Kualitas kode
- [ ] Mematuhi [coding-standards.md](coding-standards.md) (SOLID/DRY/KISS, controller
      tipis, tanpa SQL string concat, validasi DTO).
- [ ] `tsc --noEmit` lolos (backend & mobile) tanpa error.
- [ ] Tidak ada kode mati / `console.log` debug / TODO menggantung tanpa catatan.

### Pengujian
- [ ] Unit test ditulis untuk logika bisnis baru & **hijau** (`npm test`).
- [ ] Skenario edge case relevan tercakup (lihat
      [testing-standards.md](testing-standards.md)).
- [ ] Tidak menurunkan coverage area bisnis di bawah target (≥ 80%).

### Keamanan & data
- [ ] Endpoint terlindungi guard (kecuali yang memang publik).
- [ ] Tidak ada kredensial/secret ter-commit.
- [ ] Perubahan tidak mengubah skema MySQL `pdam` (kecuali via migrasi yang disetujui).

### Dokumentasi
- [ ] Status story diperbarui (`In Review`/`Done`) + catatan QA.
- [ ] Bila ada keputusan teknis baru → ADR di `architecture.md`.
- [ ] README/endpoint terkait diperbarui bila perlu.

## PR Checklist (disalin ke deskripsi PR)

```
Story: S?-??  <judul>
- [ ] AC tercapai (lampirkan bukti: output curl / screenshot)
- [ ] Patuh coding-standards (SOLID/DRY/KISS, controller tipis, no SQL concat)
- [ ] tsc --noEmit lolos
- [ ] Unit test baru hijau (npm test) + edge case
- [ ] Guard/validasi terpasang; tak ada secret
- [ ] Skema DB tidak berubah tanpa persetujuan
- [ ] Status story & dokumen diperbarui
```

## Ukuran PR

Satu story = satu PR fokus, idealnya **< 400 baris** perubahan. PR besar dipecah.
