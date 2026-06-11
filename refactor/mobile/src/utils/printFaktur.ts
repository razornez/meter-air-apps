import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { AppConfig, FakturDetail } from '../types';
import { buildFakturHtml } from './fakturHtml';
import { formatRupiah } from '../theme';
import { alertDialog } from './dialog';

/**
 * Cetak / bagikan faktur sebagai PDF.
 * - Web: Web Share API bila ada → fallback buka HTML via Blob URL (andal, tak blank).
 * - Native: generate PDF (expo-print) → share sheet / print dialog (iOS print, Android share).
 * Diekstrak dari FakturDetailScreen agar layar tetap ramping (SRP).
 */
export async function printOrShareFaktur(
  data: FakturDetail,
  config: AppConfig | null,
  share: boolean,
  setActing: (v: boolean) => void,
): Promise<void> {
  const cfg = config ?? ({ perusahaan: 'Meter Air', alamat: '', telp: '' } as AppConfig);

  if (Platform.OS === 'web') {
    const html = buildFakturHtml(data, cfg);
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    if (share && nav && typeof nav.share === 'function') {
      try {
        await nav.share({ title: `Faktur ${data.noFaktur}`, text: `Tagihan ${data.noFaktur}: ${formatRupiah(data.total ?? 0)}` });
        return;
      } catch { /* user batal / tak didukung → lanjut fallback buka HTML */ }
    }
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (!w) { alertDialog('Popup diblokir', 'Izinkan popup untuk mencetak/membagikan faktur.'); return; }
      if (!share) setTimeout(() => { try { w.print(); } catch {} }, 700);
      setTimeout(() => { try { URL.revokeObjectURL(url); } catch {} }, 60000);
    } catch (e: any) {
      alertDialog('Gagal', e?.message ?? String(e));
    }
    return;
  }

  setActing(true);
  try {
    const html = buildFakturHtml(data, cfg);
    const { uri: tmpUri } = await Print.printToFileAsync({ html });
    const safeName = (data.noFaktur ?? 'faktur').replace(/\//g, '-');
    const destUri = `${FileSystem.cacheDirectory}Faktur-${safeName}.pdf`;
    await FileSystem.copyAsync({ from: tmpUri, to: destUri });

    if (share) {
      await Sharing.shareAsync(destUri, { mimeType: 'application/pdf', dialogTitle: `Faktur ${data.noFaktur}`, UTI: 'com.adobe.pdf' });
    } else if (Platform.OS === 'ios') {
      await Print.printAsync({ uri: destUri });
    } else {
      // Android: Print.printAsync sering gagal tanpa printer service → share sheet (buka di PDF viewer / print dari sana).
      await Sharing.shareAsync(destUri, { mimeType: 'application/pdf', dialogTitle: `Cetak Faktur ${data.noFaktur}`, UTI: 'com.adobe.pdf' });
    }
  } catch (e: any) {
    alertDialog('Gagal', `Tidak dapat memproses PDF.\n\n${e?.message ?? String(e)}`);
  } finally {
    setActing(false);
  }
}
