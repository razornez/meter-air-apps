import { mapUsageHistory, RawReading } from './meter-history.util';

function reading(id: number, meter: number): RawReading {
  return {
    id,
    meter,
    tanggalCatat: `2026-0${id}-01`,
    jamCatat: '08:00:00',
    noFaktur: `FA/BD/26/0${id}/${id}`,
  };
}

describe('mapUsageHistory', () => {
  it('menghitung pemakaian sebagai selisih meter berurutan, terbaru dulu', () => {
    // diberikan desc: 130, 110, 100
    const out = mapUsageHistory([reading(3, 130), reading(2, 110), reading(1, 100)]);
    expect(out.map((r) => r.meter)).toEqual([130, 110, 100]);
    expect(out.map((r) => r.pemakaian)).toEqual([20, 10, null]);
  });

  it('baris tertua memiliki pemakaian null', () => {
    const out = mapUsageHistory([reading(1, 50)]);
    expect(out[0].pemakaian).toBeNull();
  });

  it('reset meter (selisih negatif) dianggap 0', () => {
    const out = mapUsageHistory([reading(2, 5), reading(1, 100)]);
    expect(out[0].pemakaian).toBe(0); // 5 - 100 < 0 → 0
  });

  it('input kosong → array kosong', () => {
    expect(mapUsageHistory([])).toEqual([]);
  });
});
