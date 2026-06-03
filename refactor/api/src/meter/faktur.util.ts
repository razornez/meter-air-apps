// Fungsi murni terkait faktur — dipisah agar mudah diuji (SRP) tanpa
// bergantung pada DB/waktu sistem.

const FAKTUR_PREFIX = 'FA/BD';

/**
 * Nomor faktur berikutnya berdasarkan faktur terakhir (counter global + 1).
 * Format: FA/BD/<yy>/<mm>/<counter>. Port dari Transaksi::generateNoFaktur.
 */
export function nextFakturNumber(
  lastNoFaktur: string | null,
  date: Date,
): string {
  let counter = 1;
  if (lastNoFaktur) {
    const tail = lastNoFaktur.split('/').pop() ?? '0';
    const n = parseInt(tail, 10);
    counter = (Number.isNaN(n) ? 0 : n) + 1;
  }
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${FAKTUR_PREFIX}/${yy}/${mm}/${counter}`;
}

// Tanggal jatuh tempo = tanggal 20 bulan berikutnya (format YYYY-MM-20).
export function dueDate20th(date: Date): string {
  const due = new Date(date.getFullYear(), date.getMonth() + 1, 20);
  const y = due.getFullYear();
  const m = String(due.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-20`;
}

// Nama berkas foto meter untuk sebuah faktur & pelanggan.
export function fotoMeterName(noFaktur: string, customerId: number): string {
  return `pic_${noFaktur.replace(/\//g, '-')}_${customerId}.jpeg`;
}

// Total faktur = subtotal pemakaian + beban (diskon/ppn/ongkir = 0 saat ini).
export function fakturTotal(subtotal: number, beban: number): number {
  return subtotal + beban;
}
