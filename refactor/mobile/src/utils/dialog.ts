import { Platform } from 'react-native';

// Dialog lintas-platform via modal in-app (DialogHost) — TIDAK pakai window.confirm/alert
// (jelek di web) maupun Alert.alert (no-op di web). DialogHost mendaftarkan handler.

export interface DialogRequest {
  type: 'alert' | 'confirm';
  title: string;
  message?: string;
  confirmText: string;
  cancelText: string;
  resolve: (ok: boolean) => void;
}

let handler: ((req: DialogRequest) => void) | null = null;

/** Dipanggil DialogHost saat mount. */
export function _setDialogHandler(fn: ((req: DialogRequest) => void) | null) {
  handler = fn;
}

export function confirmDialog(
  title: string,
  message: string,
  confirmText = 'OK',
  cancelText = 'Batal',
): Promise<boolean> {
  return new Promise((resolve) => {
    if (handler) {
      handler({ type: 'confirm', title, message, confirmText, cancelText, resolve });
      return;
    }
    // Fallback (host belum mount) — sangat jarang.
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.confirm === 'function') {
      resolve(window.confirm(`${title}\n\n${message}`));
    } else {
      resolve(false);
    }
  });
}

export function alertDialog(title: string, message?: string): Promise<void> {
  return new Promise((resolve) => {
    if (handler) {
      handler({ type: 'alert', title, message, confirmText: 'OK', cancelText: '', resolve: () => resolve() });
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    resolve();
  });
}
