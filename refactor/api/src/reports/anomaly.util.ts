// Deteksi anomali pemakaian air (rule-based, murni → mudah diuji).

export type AnomalyType = 'lonjakan' | 'nol' | 'turun';

export interface AnomalyResult {
  type: AnomalyType;
  severity: 'tinggi' | 'sedang';
  latest: number; // pemakaian terakhir (m³)
  rata: number; // rata-rata periode sebelumnya
  rasio: number; // latest / rata (0 bila rata 0)
  alasan: string;
}

const PRIOR_WINDOW = 6; // periode pembanding maksimum

/**
 * Klasifikasi pemakaian TERAKHIR terhadap rata-rata beberapa periode sebelumnya.
 * @param usages deret pemakaian (m³) urut lama→baru.
 * @returns anomali atau null bila wajar/kurang data.
 */
export function detectUsageAnomaly(usages: number[]): AnomalyResult | null {
  if (usages.length < 2) return null; // pelanggan baru / data kurang

  const latest = usages[usages.length - 1];
  const priors = usages.slice(0, -1).slice(-PRIOR_WINDOW);
  const rata = priors.reduce((a, b) => a + b, 0) / priors.length;
  const rasio = rata > 0 ? latest / rata : 0;

  // Nol padahal historis ada pemakaian → meter rusak/segel/kosong.
  if (rata > 0 && latest === 0) {
    return {
      type: 'nol',
      severity: 'tinggi',
      latest,
      rata,
      rasio: 0,
      alasan: 'Pemakaian 0 padahal biasanya ada — cek meter/segel.',
    };
  }

  // Lonjakan tajam → kemungkinan bocor.
  if (rata > 0 && latest >= rata * 3 && latest - rata >= 10) {
    return {
      type: 'lonjakan',
      severity: 'tinggi',
      latest,
      rata,
      rasio,
      alasan: `Pemakaian melonjak ${rasio.toFixed(1)}× rata-rata — kemungkinan bocor.`,
    };
  }

  // Turun drastis → cek meter/penghuni.
  if (rata >= 10 && latest > 0 && latest <= rata * 0.3) {
    return {
      type: 'turun',
      severity: 'sedang',
      latest,
      rata,
      rasio,
      alasan: 'Pemakaian turun drastis — cek meter/penghuni.',
    };
  }

  return null;
}
