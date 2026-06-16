/** Changelog aplikasi. Tambah entri BARU di paling atas tiap rilis. */
export const CHANGELOG_DATA = [
  {
    version: '1.6.5',
    date: '2026-06-16',
    id: [
      'Riwayat pembaruan diambil langsung dari server — tidak perlu update APK hanya untuk lihat changelog',
    ],
    en: [
      'Update history now fetched from server — no APK update needed just to view changelog',
    ],
  },
  {
    version: '1.6.4',
    date: '2026-06-15',
    id: [
      'Riwayat pembayaran tidak lagi tampil "Pending · KASUGAI" setelah berhasil bayar',
      'Halaman bayar tidak membuat order baru tiap kali dibuka (tidak dobel)',
      'Input alasan batal lunas wajib diisi — tombol nonaktif bila kosong',
      'Perbaikan 3 bug dari laporan QA regresi pembayaran',
    ],
    en: [
      'Payment history no longer shows "Pending · KASUGAI" after successful payment',
      'Checkout page reuses existing order instead of creating duplicates',
      'Cancel-paid reason field is now mandatory — button disabled when empty',
      '3 bug fixes from payment QA regression report',
    ],
  },
  {
    version: '1.6.3',
    date: '2026-06-13',
    id: [
      'Bayar via Kasugai — semua metode: QRIS, kartu, VA, e-wallet dari satu halaman',
      'Animasi overlay saat tandai lunas & batal lunas',
      'Ikon dialog lebih tajam (vektor Ionicons, tidak blur)',
      'Alasan batal lunas tersimpan & tampil di Riwayat Pembayaran',
      'Status lunas diperbarui otomatis ~1–3 dtk setelah bayar',
    ],
    en: [
      'Pay via Kasugai — all methods: QRIS, card, VA, e-wallet in one page',
      'Overlay animation when marking paid & cancelling payment',
      'Crisp vector dialog icons (Ionicons, no blur)',
      'Cancel-paid reason saved and shown in Payment History',
      'Paid status auto-updates ~1–3s after payment',
    ],
  },
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
    ],
    en: [
      'New aqua/water theme — fresher look',
      'Meter proof photos stored permanently on the server',
      'Payment history (who & when) on invoice detail',
      'Worklist filter: recorded / pending',
      'Officer position marker on the map',
    ],
  },
];
