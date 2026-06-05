// ============================================================================
// TIRTA Soft — calm, soft, rounded, friendly water design system (mobile)
// Rounded type (Quicksand + Nunito), airy pastels, gentle shadows, big radii.
// `colors` / `formatRupiah` stay exported (light values) for un-migrated screens.
// ============================================================================

export const palette = {
  deep: '#2D1B69',
  sea: '#5B4FCF',
  teal: '#7C6FEF',
  aqua: '#A78BFA',
  aquaLight: '#C4B5FD',
  mint: '#9CEFD8',
  foam: '#EDE9FE',
  ink: '#2B2547',
  white: '#FFFFFF',
};

// Soft pastel violet/lavender gradients.
export const gradients = {
  ocean: ['#8B7FEF', '#6D5CE6', '#5B4FCF'] as const,
  hero: ['#B5A9FF', '#8B7FEF', '#6D5CE6'] as const,
  heroDark: ['#2D1B69', '#1E1050', '#140B3D'] as const,
  canvas: ['#F9F8FF', '#F5F2FF', '#F0EDFF'] as const,
  canvasDark: ['#16103A', '#110D30', '#0D0A25'] as const,
  aqua: ['#A78BFA', '#7C6FEF'] as const,
  tile: ['#8B7FEF', '#6D5CE6'] as const,
  mint: ['#9CEFD8', '#34C79A'] as const,
  amber: ['#FFD79E', '#F2B04E'] as const,
  coral: ['#FFB3C2', '#F2698A'] as const,
  violet: ['#CFC7FF', '#7A6CF0'] as const,
};

// Soft pastel accent pairs (cute but harmonious) — used for tiles/chips.
export type Pastel = { bg: string; fg: string };
export const pastels: Record<string, Pastel> = {
  lavender: { bg: '#ECE9FF', fg: '#7A6CF0' },
  peach: { bg: '#FFE7DC', fg: '#FF8E63' },
  mint: { bg: '#DCF5EA', fg: '#23B58A' },
  sky: { bg: '#DEEFFF', fg: '#3DA0E3' },
  aqua: { bg: '#D9F3F7', fg: '#2399AE' },
};

export const radius = { sm: 14, md: 20, lg: 26, xl: 34, pill: 999 };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30 };

// Gentle, diffuse shadows (soft premium — low opacity, large blur).
export const shadow = {
  soft: { shadowColor: '#2BAFC2', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  glow: { shadowColor: '#2BAFC2', shadowOpacity: 0.28, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  float: { shadowColor: '#1E5F6B', shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 16 }, elevation: 12 },
};

export const fonts = {
  // Body / UI — Nunito (soft, warm, rounded)
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  // Display — Quicksand (rounded, elegant-friendly)
  display: 'Quicksand_600SemiBold',
  displayBold: 'Quicksand_700Bold',
  displayBlack: 'Quicksand_700Bold',
};

// Relaxed letter-spacing — rounded fonts want air, not tightness.
export const tracking = { display: -0.2, tight: 0, normal: 0, overline: 1.2 };

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  inputBg: string;
  text: string;
  textInv: string;
  muted: string;
  border: string;
  primary: string;
  primaryDark: string;
  accent: string;
  success: string;
  danger: string;
  warning: string;
  chip: string;
  badgeBg: string;
  hero: readonly [string, string, ...string[]];
  scan: readonly [string, string, ...string[]];
  glassTint: 'light' | 'dark';
  glassOverlay: readonly [string, string];
  barOverlay: readonly [string, string];
}

export const lightTheme: Theme = {
  mode: 'light',
  isDark: false,
  bg: '#F5F3FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F0FF',
  inputBg: '#F8F6FF',
  text: '#2B2547',
  textInv: '#FFFFFF',
  muted: '#9D8EC4',
  border: '#E8E3FA',
  primary: '#7C6FEF',
  primaryDark: '#5B4FCF',
  accent: '#A78BFA',
  success: '#23B58A',
  danger: '#F2698A',
  warning: '#F2B04E',
  chip: '#EDE9FE',
  badgeBg: '#E8E3FA',
  hero: gradients.hero,
  scan: gradients.aqua,
  glassTint: 'light',
  glassOverlay: ['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.12)'],
  barOverlay: ['rgba(255,255,255,0.78)', 'rgba(240,236,255,0.62)'],
};

export const darkTheme: Theme = {
  mode: 'dark',
  isDark: true,
  bg: '#16103A',
  surface: '#1E1654',
  surfaceAlt: '#231B60',
  inputBg: '#231B60',
  text: '#EDE9FE',
  textInv: '#2D1B69',
  muted: '#9D8EC4',
  border: '#2D2470',
  primary: '#A78BFA',
  primaryDark: '#7C6FEF',
  accent: '#C4B5FD',
  success: '#34C79A',
  danger: '#FF8099',
  warning: '#F2B860',
  chip: '#231B60',
  badgeBg: '#1E1654',
  hero: gradients.heroDark,
  scan: gradients.aqua,
  glassTint: 'dark',
  glassOverlay: ['rgba(167,139,250,0.12)', 'rgba(22,16,58,0.10)'],
  barOverlay: ['rgba(30,22,84,0.82)', 'rgba(22,16,58,0.70)'],
};

export const themes: Record<ThemeMode, Theme> = { light: lightTheme, dark: darkTheme };

// ---- Backward-compatible static light palette (un-migrated screens) ----
export const colors = {
  primary: lightTheme.primary,
  primaryDark: lightTheme.primaryDark,
  accent: lightTheme.accent,
  bg: lightTheme.bg,
  card: lightTheme.surface,
  text: lightTheme.text,
  muted: lightTheme.muted,
  border: lightTheme.border,
  danger: lightTheme.danger,
  success: lightTheme.success,
  warning: lightTheme.warning,
};

export function formatRupiah(n: number): string {
  return 'Rp ' + (n ?? 0).toLocaleString('id-ID');
}
