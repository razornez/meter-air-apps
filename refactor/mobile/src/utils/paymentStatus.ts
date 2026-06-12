import { apiConfirmPayment } from '../api/services';

/**
 * Poll status faktur lewat konfirmasi aktif ke gateway (backend verifikasi + tandai lunas).
 * Dipakai layar checkout (web+native) & alur pembayaran lama. Mengembalikan true bila lunas.
 */
export async function pollLunas(noFaktur: string, tries = 12, intervalMs = 2000): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await apiConfirmPayment(noFaktur);
      if (r?.lunas) return true;
    } catch {
      /* abaikan, coba lagi */
    }
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  return false;
}
