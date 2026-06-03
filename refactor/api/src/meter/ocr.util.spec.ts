import { bestMeterCandidate, extractMeterCandidates } from './ocr.util';

describe('extractMeterCandidates', () => {
  it('menemukan angka 5 digit dari teks bersih', () => {
    const r = extractMeterCandidates('Meter: 04420 m3');
    expect(r[0].value).toBe(4420); // 04420 → parseInt → 4420
    expect(r[0].confidence).toBe('high');
  });

  it('normalisasi O→0, I→1, S→5', () => {
    // "O4S2O" → "04520"
    const r = extractMeterCandidates('O4S2O reading today');
    expect(r.some((c) => c.value === 4520)).toBe(true);
  });

  it('urutkan high confidence (≥5 digit) sebelum medium (4 digit)', () => {
    const r = extractMeterCandidates('4420 atau 44200');
    expect(r[0].raw).toBe('44200'); // 5 digit lebih dulu
  });

  it('tidak ada digit 4-8 → array kosong', () => {
    expect(extractMeterCandidates('tidak ada angka')).toEqual([]);
    expect(extractMeterCandidates('12 99')).toEqual([]); // < 4 digit
  });

  it('hilangkan duplikat', () => {
    const r = extractMeterCandidates('04420 04420 04420');
    expect(r.filter((c) => c.value === 4420)).toHaveLength(1);
  });
});

describe('bestMeterCandidate', () => {
  it('kembalikan kandidat terbaik', () => {
    const c = bestMeterCandidate('reading 44200');
    expect(c?.value).toBe(44200);
  });
  it('kembalikan null bila tidak ada angka', () => {
    expect(bestMeterCandidate('no numbers here')).toBeNull();
  });
});
