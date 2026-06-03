export const colors = {
  primary: '#0277BD', // biru air
  primaryDark: '#01579B',
  accent: '#00ACC1',
  bg: '#F4F7FA',
  card: '#FFFFFF',
  text: '#1A2530',
  muted: '#6B7A8D',
  border: '#E1E8EF',
  danger: '#C62828',
  success: '#2E7D32',
  warning: '#EF6C00',
};

export function formatRupiah(n: number): string {
  return 'Rp ' + (n ?? 0).toLocaleString('id-ID');
}
