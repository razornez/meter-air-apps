import { Linking, Platform } from 'react-native';

// Format nomor HP Indonesia ke format internasional tanpa '+' (untuk wa.me).
// Contoh: "081234567890" → "6281234567890"
//         "+6281234..." → "6281234..."
//         "6281234..."  → "6281234..."
export function formatPhoneWA(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) return null; // terlalu pendek → tidak valid
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  // Nomor lokal tanpa 0 dan tanpa 62 (jarang, tapi aman)
  return '62' + digits;
}

// Template pesan reminder tagihan air.
export function buildWAMessage(params: {
  namaCustomer: string | null;
  noFaktur: string | null;
  total: number;
  tglJatuhTempo: string | null;
  namaPerusahaan?: string;
}): string {
  const nama = params.namaCustomer ?? 'Pelanggan';
  const perusahaan = params.namaPerusahaan ?? 'BUMDES Meter Air';
  const faktur = params.noFaktur ?? '-';
  const jatuhTempo = params.tglJatuhTempo
    ? new Date(params.tglJatuhTempo).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  const total = params.total.toLocaleString('id-ID');

  return (
    `Yth. *${nama}*,\n\n` +
    `Tagihan air Anda:\n` +
    `• No. Faktur: *${faktur}*\n` +
    `• Total tagihan: *Rp ${total}*\n` +
    `• Jatuh tempo: *${jatuhTempo}*\n` +
    `• Status: *BELUM LUNAS* ❗\n\n` +
    `Mohon segera melakukan pembayaran kepada petugas tagihan.\n\n` +
    `Terima kasih 🙏\n` +
    `_${perusahaan}_`
  );
}

// Buka WhatsApp dengan pesan terisi. Kembalikan true bila WA tersedia/dibuka.
export async function openWA(
  phone: string | null | undefined,
  message: string,
): Promise<boolean> {
  const formatted = formatPhoneWA(phone);
  if (!formatted) return false;

  const encoded = encodeURIComponent(message);
  const url =
    Platform.OS === 'web'
      ? `https://web.whatsapp.com/send?phone=${formatted}&text=${encoded}`
      : `https://wa.me/${formatted}?text=${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen && Platform.OS !== 'web') return false;
  await Linking.openURL(url);
  return true;
}
