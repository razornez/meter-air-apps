import { formatRupiah } from './theme';

describe('formatRupiah', () => {
  it('memformat ribuan dengan pemisah id-ID', () => {
    expect(formatRupiah(60000)).toBe('Rp 60.000');
  });

  it('memformat jutaan', () => {
    expect(formatRupiah(27611000)).toBe('Rp 27.611.000');
  });

  it('nol & nilai kosong aman', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
    // nilai undefined diperlakukan sebagai 0
    expect(formatRupiah(undefined as unknown as number)).toBe('Rp 0');
  });
});
