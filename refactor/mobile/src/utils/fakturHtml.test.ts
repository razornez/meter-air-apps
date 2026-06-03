import { buildFakturHtml } from './fakturHtml';
import { AppConfig, FakturDetail } from '../types';

const config: AppConfig = {
  perusahaan: 'BUMDES KIANGROKE',
  alamat: 'Jl. A',
  telp: '08123',
  logo: '',
};

const detail: FakturDetail = {
  noFaktur: 'FA/BD/26/06/1',
  tanggal: '2026-06-01T00:00:00.000Z',
  subtotal: 60000,
  beban: 5000,
  denda: 0,
  total: 65000,
  isLunas: false,
  tglJatuhTempo: '2026-07-20',
  fotoMeter: null,
  catatan: null,
  pelanggan: { id: 1, nama: 'DENI', alamat: 'Kiangroke', tipe: 'B' },
  items: [{ produk: 'Air', quantity: '25', harga: 0, total: 60000 }],
  meter: [{ meter: 4445, tanggal: '2026-06-01' }],
};

describe('buildFakturHtml', () => {
  it('memuat kop perusahaan & nomor faktur', () => {
    const html = buildFakturHtml(detail, config);
    expect(html).toContain('BUMDES KIANGROKE');
    expect(html).toContain('FA/BD/26/06/1');
  });

  it('menampilkan total terformat & status belum lunas', () => {
    const html = buildFakturHtml(detail, config);
    expect(html).toContain('Rp 65.000');
    expect(html).toContain('BELUM LUNAS');
  });

  it('menandai LUNAS saat isLunas true', () => {
    const html = buildFakturHtml({ ...detail, isLunas: true }, config);
    expect(html).toContain('>LUNAS<');
  });

  it('meng-escape karakter HTML pada input (cegah injeksi)', () => {
    const d: FakturDetail = {
      ...detail,
      pelanggan: { ...detail.pelanggan!, nama: 'A & <b>x</b>' },
    };
    const html = buildFakturHtml(d, config);
    expect(html).toContain('A &amp; &lt;b&gt;x&lt;/b&gt;');
    expect(html).not.toContain('<b>x</b>');
  });
});
