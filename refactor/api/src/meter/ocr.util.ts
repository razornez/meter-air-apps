// Ekstrak angka meter (4-8 digit) dari teks mentah hasil OCR. Murni → mudah diuji.

export interface OcrCandidate {
  value: number; // angka yang diekstrak
  raw: string; // teks asli sebelum normalisasi
  confidence: 'high' | 'medium'; // high = 5-8 digit tanpa karakter lain
}

/**
 * Cari semua urutan digit 4-8 karakter dalam teks OCR, kembalikan diurutkan dari
 * yang paling mungkin angka meter (5-8 digit dulu, lalu 4 digit).
 */
export function extractMeterCandidates(text: string): OcrCandidate[] {
  // Normalisasi: O/o → 0, I/l/| → 1, S/s → 5 (kesalahan OCR umum pada angka)
  const normalized = text
    .replace(/O/g, '0')
    .replace(/o/g, '0')
    .replace(/[Il|]/g, '1')
    .replace(/S/g, '5')
    .replace(/s/g, '5')
    .replace(/B/g, '8');

  // Cari semua sequence digit 4-8 karakter
  const matches = normalized.match(/\d{4,8}/g) ?? [];
  const unique = [...new Set(matches)];

  const candidates: OcrCandidate[] = unique.map((raw) => ({
    value: parseInt(raw, 10),
    raw,
    confidence: raw.length >= 5 ? 'high' : 'medium',
  }));

  // Urutkan: high confidence dulu, lalu panjang digit terbesar
  return candidates.sort(
    (a, b) =>
      (a.confidence === b.confidence ? 0 : a.confidence === 'high' ? -1 : 1) ||
      b.raw.length - a.raw.length,
  );
}

// Kandidat terbaik (pertama dari daftar), atau null bila tidak ada.
export function bestMeterCandidate(text: string): OcrCandidate | null {
  const candidates = extractMeterCandidates(text);
  return candidates[0] ?? null;
}
