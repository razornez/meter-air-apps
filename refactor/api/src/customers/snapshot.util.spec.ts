import { normalizeSnapshotRow } from './snapshot.util';

describe('normalizeSnapshotRow', () => {
  it('cast id & lastMeter ke number', () => {
    const out = normalizeSnapshotRow({
      id: '200212011',
      nama: 'DENI',
      alamat: 'Kiangroke',
      tipe: 'B',
      barcode: null,
      lastMeter: '4420',
    });
    expect(out).toEqual({
      id: 200212011,
      nama: 'DENI',
      alamat: 'Kiangroke',
      tipe: 'B',
      barcode: null,
      lastMeter: 4420,
    });
  });

  it('lastMeter null → 0', () => {
    const out = normalizeSnapshotRow({
      id: 1,
      nama: 'A',
      alamat: null,
      tipe: 'N',
      barcode: 'X',
      lastMeter: null,
    });
    expect(out.lastMeter).toBe(0);
  });
});
