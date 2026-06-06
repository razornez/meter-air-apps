import { Platform } from 'react-native';

// Preprocess foto meter sebelum OCR: resize agar tidak terlalu besar,
// kurangi ukuran payload → Tesseract lebih cepat & akurat.
// Murni: hanya dipanggil bila expo-image-manipulator tersedia (native).
// Web: kembalikan URI asli (tidak perlu preprocess).

const MAX_WIDTH = 800; // px untuk OCR

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

const TARGET_BYTES = 100 * 1024; // 100 KB

// Preset turun bertahap: lebar & kualitas makin kecil sampai ukuran ≤ target.
const PRESETS: { width: number; quality: number }[] = [
  { width: 1000, quality: 0.6 },
  { width: 900,  quality: 0.5 },
  { width: 800,  quality: 0.4 },
  { width: 700,  quality: 0.35 },
];

async function fileSize(uri: string): Promise<number> {
  try {
    const FileSystem = await import('expo-file-system/legacy');
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists && typeof info.size === 'number' ? info.size : Number.MAX_SAFE_INTEGER;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

/**
 * Kompres foto sebelum upload — target ≤ 100 KB, format WebP (fallback JPEG).
 * Mencoba beberapa preset menurun; berhenti saat ukuran sudah di bawah target.
 * Web: kembalikan URI asli.
 */
export async function compressForUpload(uri: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  try {
    const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
    // WebP jauh lebih kecil; bila platform tak mendukung, jatuh ke JPEG.
    let format = SaveFormat.WEBP;

    let best = uri;
    let bestSize = await fileSize(uri);

    for (const p of PRESETS) {
      try {
        const out = await manipulateAsync(
          uri,
          [{ resize: { width: p.width } }],
          { compress: p.quality, format },
        );
        const size = await fileSize(out.uri);
        if (size < bestSize) { best = out.uri; bestSize = size; }
        if (size <= TARGET_BYTES) return out.uri; // sudah cukup kecil
      } catch {
        // WebP gagal (mis. iOS lama) → ganti ke JPEG dan ulangi preset ini.
        if (format === SaveFormat.WEBP) {
          format = SaveFormat.JPEG;
          try {
            const out = await manipulateAsync(
              uri,
              [{ resize: { width: p.width } }],
              { compress: p.quality, format },
            );
            const size = await fileSize(out.uri);
            if (size < bestSize) { best = out.uri; bestSize = size; }
            if (size <= TARGET_BYTES) return out.uri;
          } catch { /* lanjut preset berikutnya */ }
        }
      }
    }
    // Tak tercapai target — kirim hasil terkecil yang berhasil.
    return best;
  } catch {
    return uri;
  }
}
