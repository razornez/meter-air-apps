import { normalizeMonthlyRow } from './reports.util';

describe('normalizeMonthlyRow', () => {
  it('mengubah string agregat ke number & menghitung belum', () => {
    const out = normalizeMonthlyRow({
      periode: '2020-05',
      jumlahFaktur: '563',
      totalTagihan: '27611000',
      totalTerbayar: '10000000',
    });
    expect(out).toEqual({
      periode: '2020-05',
      jumlahFaktur: 563,
      totalTagihan: 27611000,
      totalTerbayar: 10000000,
      totalBelum: 17611000,
    });
  });

  it('null agregat dianggap 0', () => {
    const out = normalizeMonthlyRow({
      periode: '2026-06',
      jumlahFaktur: 0,
      totalTagihan: null,
      totalTerbayar: null,
    });
    expect(out.totalTagihan).toBe(0);
    expect(out.totalBelum).toBe(0);
  });
});
