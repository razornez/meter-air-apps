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
