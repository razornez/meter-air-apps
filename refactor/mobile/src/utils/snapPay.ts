import { Platform } from 'react-native';

// Midtrans Snap.js — popup pembayaran in-app untuk WEB (window.snap.pay).
// Di native pakai WebView; helper ini khusus web.

const SNAP_SCRIPT_ID = 'midtrans-snap-js';

export interface SnapCallbacks {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
}

function loadSnapScript(clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = globalThis as any;
    if (w.snap && typeof w.snap.pay === 'function') return resolve();
    const doc = w.document;
    if (!doc) return reject(new Error('document tidak tersedia'));

    // Sandbox vs production dideteksi dari prefix clientKey (SB-Mid-... = sandbox).
    const src = clientKey.startsWith('SB-')
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js';

    const existing = doc.getElementById(SNAP_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (w.snap) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gagal memuat Snap.js')));
      return;
    }

    const s = doc.createElement('script');
    s.id = SNAP_SCRIPT_ID;
    s.src = src;
    s.setAttribute('data-client-key', clientKey);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gagal memuat Snap.js'));
    doc.head.appendChild(s);
  });
}

/** Buka popup Snap in-app (web). Throw bila bukan web / Snap.js gagal. */
export async function snapPayWeb(token: string, clientKey: string, cb: SnapCallbacks): Promise<void> {
  if (Platform.OS !== 'web') throw new Error('snapPayWeb hanya untuk web');
  if (!token || !clientKey) throw new Error('token/clientKey kosong');
  await loadSnapScript(clientKey);
  const w = globalThis as any;
  if (!w.snap || typeof w.snap.pay !== 'function') throw new Error('Snap.js tidak tersedia');
  w.snap.pay(token, {
    onSuccess: cb.onSuccess,
    onPending: cb.onPending,
    onError: cb.onError,
    onClose: cb.onClose,
  });
}
