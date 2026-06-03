import { buildWAMessage, formatPhoneWA } from './whatsapp';

describe('formatPhoneWA', () => {
  it('konversi 08xxx ke 628xxx', () => {
    expect(formatPhoneWA('081234567890')).toBe('6281234567890');
  });
  it('sudah 62xxx → tetap', () => {
    expect(formatPhoneWA('6281234567890')).toBe('6281234567890');
  });
  it('+62xxx → tanpa + (nomor panjang cukup)', () => {
    expect(formatPhoneWA('+628123456789')).toBe('628123456789');
  });
  it('nomor terlalu pendek → null', () => {
    expect(formatPhoneWA('0812')).toBeNull();
    expect(formatPhoneWA('0')).toBeNull();
  });
  it('null/undefined → null', () => {
    expect(formatPhoneWA(null)).toBeNull();
    expect(formatPhoneWA(undefined)).toBeNull();
  });
  it('strip non-digit (spasi, dash)', () => {
    expect(formatPhoneWA('0812-3456-7890')).toBe('6281234567890');
  });
});

describe('buildWAMessage', () => {
  it('memuat nama, nomor faktur, dan total', () => {
    const msg = buildWAMessage({
      namaCustomer: 'DENI',
      noFaktur: 'FA/BD/26/06/1',
      total: 65000,
      tglJatuhTempo: '2026-07-20',
    });
    expect(msg).toContain('DENI');
    expect(msg).toContain('FA/BD/26/06/1');
    expect(msg).toContain('65.000');
    expect(msg).toContain('BELUM LUNAS');
  });

  it('nama null → "Pelanggan"', () => {
    const msg = buildWAMessage({
      namaCustomer: null,
      noFaktur: null,
      total: 0,
      tglJatuhTempo: null,
    });
    expect(msg).toContain('Pelanggan');
  });
});
