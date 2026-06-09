import { Alert, Platform } from 'react-native';

// Alert.alert dengan tombol TIDAK berfungsi di react-native-web. Helper ini
// memakai window.confirm/alert di web, Alert.alert di native — agar konfirmasi
// & feedback bekerja di kedua platform.

export function confirmDialog(
  title: string,
  message: string,
  confirmText = 'OK',
  cancelText = 'Batal',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && typeof window.confirm === 'function'
      ? window.confirm(`${title}\n\n${message}`)
      : false;
    return Promise.resolve(ok);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, onPress: () => resolve(true) },
    ]);
  });
}

export function alertDialog(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    return;
  }
  Alert.alert(title, message);
}
