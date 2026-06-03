import { normalizeFakturRow } from './faktur-mapper.util';

describe('normalizeFakturRow', () => {
  it('mengubah is_lunas numerik ke boolean & total ke number', () => {
    const out = normalizeFakturRow({
      noFaktur: 'FA/BD/26/06/1',
      tanggal: '2026-06-01T00:00:00.000Z',
      customerId: '200212011',
      namaPelanggan: 'DENI',
      total: '65000',
      isLunas: 1,
      tglJatuhTempo: '2026-07-20',
    });
    expect(out.isLunas).toBe(true);
    expect(out.total).toBe(65000);
    expect(out.customerId).toBe(200212011);
  });

  it('isLunas 0 → false; total null → 0', () => {
    const out = normalizeFakturRow({
      noFaktur: 'FA/BD/26/06/2',
      tanggal: null,
      customerId: null,
      namaPelanggan: null,
      total: null,
      isLunas: 0,
      tglJatuhTempo: null,
    });
    expect(out.isLunas).toBe(false);
    expect(out.total).toBe(0);
    expect(out.customerId).toBeNull();
  });

  it('tanggal Date dikonversi ke ISO string', () => {
    const d = new Date('2026-06-01T07:00:00.000Z');
    const out = normalizeFakturRow({
      noFaktur: 'x',
      tanggal: d,
      customerId: '1',
      namaPelanggan: 'A',
      total: 1000,
      isLunas: 0,
      tglJatuhTempo: null,
    });
    expect(out.tanggal).toBe('2026-06-01T07:00:00.000Z');
  });
});
