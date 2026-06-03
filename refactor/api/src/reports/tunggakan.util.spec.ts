import { groupTunggakan, RawTunggakanRow } from './tunggakan.util';

describe('groupTunggakan', () => {
  const rows: RawTunggakanRow[] = [
    { customerId: 1, nama: 'A', alamat: 'x', telp: '081234', total: 50000, denda: 5000, hariTelat: 100 },
    { customerId: 1, nama: 'A', alamat: 'x', telp: '081234', total: 30000, denda: 5000, hariTelat: 50 },
    { customerId: 2, nama: 'B', alamat: 'y', telp: null, total: 200000, denda: 5000, hariTelat: 200 },
  ];

  it('mengelompokkan multi-faktur per pelanggan', () => {
    const out = groupTunggakan(rows);
    expect(out).toHaveLength(2);
    const a = out.find((r) => r.customerId === 1)!;
    expect(a.jumlahFaktur).toBe(2);
    expect(a.totalTagihan).toBe(80000);
    expect(a.totalDenda).toBe(10000);
    expect(a.grandTotal).toBe(90000);
    expect(a.hariTelatMax).toBe(100);
  });

  it('urut grandTotal terbesar dulu', () => {
    const out = groupTunggakan(rows);
    expect(out[0].customerId).toBe(2); // grandTotal 205000 > 90000
  });

  it('input kosong → array kosong', () => {
    expect(groupTunggakan([])).toEqual([]);
  });

  it('denda null dianggap 0', () => {
    const out = groupTunggakan([
      { customerId: 5, nama: 'C', alamat: null, telp: null, total: '15000', denda: null, hariTelat: '10' },
    ]);
    expect(out[0].totalDenda).toBe(0);
    expect(out[0].grandTotal).toBe(15000);
  });
});
