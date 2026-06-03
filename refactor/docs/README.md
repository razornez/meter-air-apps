# Sistem Kerja Proyek (BMAD-style)

Dokumen ini mendefinisikan **cara kerja terstruktur** proyek refactor Meter Air,
terinspirasi metodologi **BMAD** (Breakthrough Method for Agile AI-Driven
Development): dokumentasi berlapis dari **PRD → Epic → Story**, dikerjakan
**per sprint**, dengan **standar kode & testing** sebagai guardrail.

## Hierarki dokumen

```
docs/
├── product/prd.md              # Visi, persona, epic, metrik sukses (SUMBER KEBENARAN produk)
├── architecture/architecture.md# Arsitektur teknis + keputusan (ADR)
├── standards/                  # GUARDRAIL — wajib dipatuhi setiap story
│   ├── coding-standards.md     # SOLID, DRY, KISS, konvensi
│   ├── testing-standards.md    # Strategi & target test
│   └── definition-of-done.md   # Checklist selesai + PR checklist
├── templates/story-template.md # Cetakan story
├── sprints/                    # Perencanaan & review per sprint
│   ├── sprint-01-review.md
│   └── sprint-02-plan.md
└── stories/                    # Unit kerja granular (1 story = 1 PR)
    └── S<sprint>-<no>-<slug>.md
```

## Peran (agent personas)

Satu orang/AI bisa memerankan beberapa peran, tapi *output*-nya tetap dipisah agar
jejak keputusan jelas.

| Peran | Tanggung jawab | Output |
|-------|----------------|--------|
| **Analyst / PM** | Definisikan kebutuhan & prioritas | `product/prd.md`, epic |
| **Architect** | Desain teknis, batasan, ADR | `architecture/architecture.md` |
| **Scrum Master** | Pecah epic → story, isi backlog sprint | `sprints/*`, `stories/*` |
| **Developer** | Implementasi sesuai story + standar | kode + unit test |
| **QA** | Verifikasi acceptance criteria & DoD | hasil uji, update status story |

## Alur kerja satu story (lifecycle)

```
Draft ──► Ready ──► In Progress ──► In Review ──► Done
          (AC &        (kode +        (DoD &        (merged,
        tugas jelas)   test ditulis)  test hijau)   AC tercapai)
```

Status ditulis di header tiap file story (`Status: ...`). **Satu story = satu PR**
yang fokus dan kecil (idealnya < 400 baris perubahan).

## Aturan emas

1. **Tidak ada kode tanpa story.** Setiap perubahan merujuk ID story (mis. `S2-03`).
2. **Tidak ada story "Done" tanpa lolos [Definition of Done](standards/definition-of-done.md).**
3. **Standar kode & test bukan opsional** — lihat folder `standards/`. Itu guardrail-nya.
4. **PRD adalah sumber kebenaran produk**; arsitektur sumber kebenaran teknis. Jika
   story bertentangan dengan keduanya, perbaiki dokumen dulu (atau buat ADR), baru kode.

## Penomoran

- Story: `S<nomor-sprint>-<urut>` — mis. `S2-01`.
- Epic: `E<urut>` — didefinisikan di PRD.
- ADR: `ADR-<urut>` — di `architecture/architecture.md`.
