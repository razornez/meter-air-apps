import { detectUsageAnomaly } from './anomaly.util';

describe('detectUsageAnomaly', () => {
  it('data < 2 periode → null (pelanggan baru)', () => {
    expect(detectUsageAnomaly([])).toBeNull();
    expect(detectUsageAnomaly([20])).toBeNull();
  });

  it('pemakaian stabil → null (wajar)', () => {
    expect(detectUsageAnomaly([20, 22, 19, 21])).toBeNull();
  });

  it('lonjakan ≥3× → tinggi', () => {
    const r = detectUsageAnomaly([20, 18, 22, 90]);
    expect(r?.type).toBe('lonjakan');
    expect(r?.severity).toBe('tinggi');
  });

  it('lonjakan kecil tak berarti tidak ditandai', () => {
    // rata 2, terakhir 7 → 3.5× tapi selisih < 10 → null
    expect(detectUsageAnomaly([2, 2, 2, 7])).toBeNull();
  });

  it('nol padahal biasanya ada → tinggi', () => {
    const r = detectUsageAnomaly([25, 23, 24, 0]);
    expect(r?.type).toBe('nol');
    expect(r?.rasio).toBe(0);
  });

  it('turun drastis → sedang', () => {
    const r = detectUsageAnomaly([30, 28, 32, 5]);
    expect(r?.type).toBe('turun');
    expect(r?.severity).toBe('sedang');
  });

  it('tanpa riwayat pemakaian (semua 0) lalu naik → tidak dianggap lonjakan', () => {
    // rata 0 → tidak ditandai lonjakan (pelanggan baru pakai)
    expect(detectUsageAnomaly([0, 0, 50])).toBeNull();
  });
});
