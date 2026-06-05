import { AppConfig, FakturDetail } from '../types';

// Fungsi murni: bangun HTML faktur untuk dicetak/dibagikan (expo-print).

function rupiah(n: number | null | undefined): string {
  return 'Rp ' + (n ?? 0).toLocaleString('id-ID');
}

function esc(s: string | number | null | undefined): string {
  return String(s ?? '').replace(
    /[&<>"]/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );
}

export function buildFakturHtml(
  detail: FakturDetail,
  config: AppConfig,
): string {
  const items = detail.items
    .map(
      (it) => `
      <tr>
        <td>${esc(it.produk)}</td>
        <td style="text-align:right">${esc(it.quantity)} m³</td>
        <td style="text-align:right">${rupiah(it.harga)}</td>
        <td style="text-align:right">${rupiah(it.total)}</td>
      </tr>`,
    )
    .join('');

  const statusColor = detail.isLunas ? '#2E7D32' : '#C62828';
  const statusText = detail.isLunas ? 'LUNAS' : 'BELUM LUNAS';
  const tanggal = detail.tanggal ? detail.tanggal.slice(0, 10) : '-';

  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8" />
<style>
  * { font-family: -apple-system, Roboto, Arial, sans-serif; color: #1A2530; }
  body { padding: 28px; font-size: 13px; }
  .head { border-bottom: 3px solid #0277BD; padding-bottom: 12px; margin-bottom: 16px; }
  .perusahaan { font-size: 20px; font-weight: 800; color: #0277BD; }
  .muted { color: #6B7A8D; }
  .title { text-align: right; }
  .title h1 { margin: 0; font-size: 22px; letter-spacing: 2px; }
  .row { display: flex; justify-content: space-between; }
  table { width: 100%; border-collapse: collapse; margin-top: 14px; }
  th, td { padding: 8px 6px; border-bottom: 1px solid #E1E8EF; }
  th { text-align: left; background: #F4F7FA; font-size: 11px; text-transform: uppercase; color: #6B7A8D; }
  .totbox { margin-top: 14px; width: 260px; margin-left: auto; }
  .totbox .line { display:flex; justify-content: space-between; padding: 4px 0; }
  .grand { font-size: 16px; font-weight: 800; border-top: 2px solid #0277BD; padding-top: 6px; margin-top: 6px; }
  .badge { display:inline-block; padding: 5px 12px; border-radius: 6px; font-weight: 800; color: #fff; background: ${statusColor}; }
  .foot { margin-top: 30px; color: #6B7A8D; font-size: 11px; text-align: center; }
</style></head>
<body>
  <div class="head row">
    <div>
      <div class="perusahaan">${esc(config.perusahaan) || 'Perusahaan Air'}</div>
      <div class="muted">${esc(config.alamat)}</div>
      <div class="muted">Telp: ${esc(config.telp)}</div>
    </div>
    <div class="title">
      <h1>FAKTUR</h1>
      <div class="muted">${esc(detail.noFaktur)}</div>
      <div class="muted">Tanggal: ${tanggal}</div>
    </div>
  </div>

  <div class="row">
    <div>
      <div class="muted">Pelanggan</div>
      <div style="font-weight:700; font-size:15px">${esc(detail.pelanggan?.nama)}</div>
      <div class="muted">ID ${detail.pelanggan?.id ?? '-'} • Tipe ${esc(detail.pelanggan?.tipe)}</div>
      <div class="muted">${esc(detail.pelanggan?.alamat)}</div>
    </div>
    <div style="text-align:right">
      <span class="badge">${statusText}</span>
      <div class="muted" style="margin-top:6px">Jatuh tempo: ${esc(detail.tglJatuhTempo)}</div>
    </div>
  </div>

  <table>
    <thead><tr><th>Uraian</th><th style="text-align:right">Pemakaian</th><th style="text-align:right">Harga</th><th style="text-align:right">Jumlah</th></tr></thead>
    <tbody>${items}</tbody>
  </table>

  <div class="totbox">
    <div class="line"><span class="muted">Subtotal</span><span>${rupiah(detail.subtotal)}</span></div>
    <div class="line"><span class="muted">Beban</span><span>${rupiah(detail.beban)}</span></div>
    ${detail.denda ? `<div class="line"><span class="muted">Denda</span><span>${rupiah(detail.denda)}</span></div>` : ''}
    <div class="line grand"><span>Total</span><span>${rupiah(detail.total)}</span></div>
  </div>

  ${detail.catatan ? `<p class="muted">Catatan: ${esc(detail.catatan)}</p>` : ''}
  <div class="foot">Dokumen ini dibuat otomatis oleh aplikasi Meter Air.</div>
</body>
</html>`;
}
