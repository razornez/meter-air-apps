import {
  dueDate20th,
  fakturTotal,
  fotoMeterName,
  nextFakturNumber,
} from './faktur.util';

describe('faktur.util', () => {
  describe('nextFakturNumber', () => {
    const tgl = new Date(2026, 5, 15); // Juni 2026

    it('menghasilkan counter 1 bila belum ada faktur', () => {
      expect(nextFakturNumber(null, tgl)).toBe('FA/BD/26/06/1');
    });

    it('menaikkan counter dari faktur terakhir (+1)', () => {
      expect(nextFakturNumber('FA/BD/20/07/3539', tgl)).toBe('FA/BD/26/06/3540');
    });

    it('memakai tahun & bulan dari tanggal saat ini, bukan dari faktur lama', () => {
      const desember = new Date(2026, 11, 1);
      expect(nextFakturNumber('FA/BD/20/07/100', desember)).toBe(
        'FA/BD/26/12/101',
      );
    });

    it('aman bila ekor nomor bukan angka', () => {
      expect(nextFakturNumber('FA/BD/26/06/abc', tgl)).toBe('FA/BD/26/06/1');
    });
  });

  describe('dueDate20th', () => {
    it('jatuh tempo tanggal 20 bulan berikutnya', () => {
      expect(dueDate20th(new Date(2026, 5, 7))).toBe('2026-07-20');
    });

    it('Desember → Januari tahun depan', () => {
      expect(dueDate20th(new Date(2026, 11, 7))).toBe('2027-01-20');
    });
  });

  describe('fotoMeterName', () => {
    it('mengganti slash dengan strip dan menyertakan id pelanggan', () => {
      expect(fotoMeterName('FA/BD/26/06/3540', 200212011)).toBe(
        'pic_FA-BD-26-06-3540_200212011.jpeg',
      );
    });
  });

  describe('fakturTotal', () => {
    it('total = subtotal + beban', () => {
      expect(fakturTotal(60000, 5000)).toBe(65000);
    });
  });
});
