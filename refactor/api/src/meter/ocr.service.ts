import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import { bestMeterCandidate, extractMeterCandidates } from './ocr.util';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * Kenali angka meter dari buffer gambar via Tesseract.js (gratis, self-hosted).
   * Mengembalikan kandidat angka beserta teks mentah agar klien bisa verifikasi.
   */
  async recognizeMeter(imageBuffer: Buffer): Promise<{
    candidates: { value: number; raw: string; confidence: 'high' | 'medium' }[];
    best: number | null;
    rawText: string;
  }> {
    // Tesseract diinisialisasi per-request (stateless; worker dihentikan setelah pakai).
    const worker = await createWorker('eng', undefined, {
      logger: () => {/* abaikan progress log */},
    });
    try {
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789OoIlSsBb|',
      });

      const { data } = await worker.recognize(imageBuffer);
      const rawText = data.text ?? '';

      this.logger.log(
        `OCR selesai — teks mentah (50 char): "${rawText.slice(0, 50).replace(/\n/g, ' ')}"`,
      );

      const candidates = extractMeterCandidates(rawText);
      const best = bestMeterCandidate(rawText);

      return { candidates, best: best?.value ?? null, rawText };
    } finally {
      await worker.terminate();
    }
  }
}
