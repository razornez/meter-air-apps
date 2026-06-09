// Changelog aplikasi. Tambahkan entri BARU di paling atas tiap rilis
// (termasuk update OTA). `date` format YYYY-MM-DD.
export interface ChangelogEntry {
  version: string;
  date: string;
  id: string[]; // Bahasa Indonesia
  en: string[]; // English
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.6.2',
    date: '2026-06-09',
    id: [
      'Label metode bayar lebih jelas (Nomor GoPay, No. Rek BCA, dll)',
      'Dialog konfirmasi & notifikasi lebih rapi (bukan popup bawaan)',
      'Tombol Tandai Lunas, Bagikan, & Reminder WA lebih responsif + ada umpan balik',
      'Salin nominal di halaman transfer; perbaikan logo bank',
    ],
    en: [
      'Clearer payment method labels (GoPay Number, BCA Account No., etc.)',
      'Cleaner in-app confirm & notification dialogs (no native popups)',
      'Mark as Paid, Share, & WA Reminder more responsive + with feedback',
      'Copy amount on transfer page; bank logo fix',
    ],
  },
  {
    version: '1.6.1',
    date: '2026-06-09',
    id: [
      'Perbaikan bayar: tombol bayar kini selalu membuka halaman, pesan lebih rapi',
      'Pembayaran via gateway (QRIS/GoPay/VA/Kartu)',
      'Setelah bayar, otomatis kembali ke aplikasi',
      'Pembaruan via unduh APK terbaru — lebih andal & stabil',
    ],
    en: [
      'Payment fix: pay button always opens the page, cleaner messages',
      'Gateway payments (QRIS/GoPay/VA/Card)',
      'Auto return to the app after payment',
      'Updates via downloading the latest APK — more reliable',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-06-08',
    id: [
      'Tema aqua/tirta baru — tampilan lebih segar',
      'Foto bukti meteran tersimpan permanen di server',
      'Riwayat pembayaran (siapa & kapan) di detail tagihan',
      'Filter worklist: sudah / belum dicatat',
      'Titik posisi petugas di peta',
      'Pembaruan otomatis (OTA) — update tanpa pasang ulang',
    ],
    en: [
      'New aqua/water theme — fresher look',
      'Meter proof photos stored permanently on the server',
      'Payment history (who & when) on invoice detail',
      'Worklist filter: recorded / pending',
      'Officer position marker on the map',
      'Automatic updates (OTA) — update without reinstalling',
    ],
  },
];

// Penanda rilis terakhir — dipakai mendeteksi tampilan "Yang Baru".
export const CHANGELOG_MARKER = `${CHANGELOG[0].version}|${CHANGELOG[0].date}`;

export function changelogLines(entry: ChangelogEntry, lang: string): string[] {
  return lang === 'en' ? entry.en : entry.id;
}
