import { Platform } from 'react-native';

// Dialog lintas-platform via modal in-app (DialogHost) — TIDAK pakai window.confirm/alert
// (jelek di web) maupun Alert.alert (no-op di web). DialogHost mendaftarkan handler.

export interface DialogRequest {
  type: 'alert' | 'confirm' | 'prompt';
  title: string;
  message?: string;
  placeholder?: string;
  required?: boolean; // prompt: input wajib diisi (tombol nonaktif bila kosong)
  confirmText: string;
  cancelText: string;
  resolve: (result: boolean | string | null) => void;
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
      handler({ type: 'confirm', title, message, confirmText, cancelText, resolve: (r) => resolve(r === true) });
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

/** Dialog input teks (mis. alasan). Resolve string yang diisi, atau null bila dibatalkan. */
export function promptDialog(
  title: string,
  message: string,
  opts?: { placeholder?: string; confirmText?: string; cancelText?: string; required?: boolean },
): Promise<string | null> {
  return new Promise((resolve) => {
    if (handler) {
      handler({
        type: 'prompt', title, message, placeholder: opts?.placeholder, required: opts?.required,
        confirmText: opts?.confirmText ?? 'Simpan', cancelText: opts?.cancelText ?? 'Batal',
        resolve: (r) => resolve(typeof r === 'string' ? r : null),
      });
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.prompt === 'function') {
      resolve(window.prompt(`${title}\n\n${message}`));
    } else {
      resolve(null);
    }
  });
}
