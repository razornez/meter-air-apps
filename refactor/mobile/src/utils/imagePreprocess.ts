import { Platform } from 'react-native';

// Preprocess foto meter sebelum OCR: resize agar tidak terlalu besar,
// kurangi ukuran payload → Tesseract lebih cepat & akurat.
// Murni: hanya dipanggil bila expo-image-manipulator tersedia (native).
// Web: kembalikan URI asli (tidak perlu preprocess).

const MAX_WIDTH = 800; // px — cukup untuk Tesseract membaca angka meter

export async function preprocessForOcr(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Web: tidak perlu manipulasi, browser OCR cepat.
    return uri;
  }

  try {
    // Import dinamis agar tidak merusak bundle web.
    const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      { compress: 0.7, format: SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    // Bila preprocess gagal → gunakan foto asli (jangan blok OCR).
    return uri;
  }
}
