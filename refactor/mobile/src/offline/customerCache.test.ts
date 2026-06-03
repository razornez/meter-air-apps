import {
  CachedCustomer,
  resolveFromCache,
  searchCache,
} from './customerCache';

const list: CachedCustomer[] = [
  { id: 200212011, nama: 'DENI FARSITO', alamat: 'Kiangroke', tipe: 'B', barcode: null, lastMeter: 4420 },
  { id: 200212012, nama: 'H.D WASMANA', alamat: 'Kiangroke', tipe: 'B', barcode: 'BC-12', lastMeter: 262 },
  { id: 5, nama: 'AGUS', alamat: 'Bandung', tipe: 'N', barcode: null, lastMeter: 10 },
];

describe('resolveFromCache', () => {
  it('cocok via barcode', () => {
    expect(resolveFromCache(list, 'BC-12')?.id).toBe(200212012);
  });
  it('fallback ke id numerik', () => {
    expect(resolveFromCache(list, '200212011')?.nama).toBe('DENI FARSITO');
  });
  it('tidak ditemukan → null', () => {
    expect(resolveFromCache(list, 'XYZ')).toBeNull();
    expect(resolveFromCache(list, '999')).toBeNull();
  });
});

describe('searchCache', () => {
  it('cari berdasar nama (case-insensitive)', () => {
    expect(searchCache(list, 'deni').map((c) => c.id)).toEqual([200212011]);
  });
  it('cari berdasar id parsial', () => {
    expect(searchCache(list, '2002120').length).toBe(2);
  });
  it('cari berdasar alamat', () => {
    expect(searchCache(list, 'bandung').map((c) => c.id)).toEqual([5]);
  });
  it('query kosong → kembalikan daftar (dibatasi)', () => {
    expect(searchCache(list, '').length).toBe(3);
  });
});
