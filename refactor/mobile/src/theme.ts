// ============================================================================
// TIRTA Soft — calm, soft, rounded, friendly water design system (mobile)
// Rounded type (Quicksand + Nunito), airy pastels, gentle shadows, big radii.
// `colors` / `formatRupiah` stay exported (light values) for un-migrated screens.
// ============================================================================

export const palette = {
  deep: '#0A2A33',
  sea: '#1E8FA6',
  teal: '#2BAFC2',
  aqua: '#5BD0DE',
  aquaLight: '#8DE6EE',
  mint: '#9CEFD8',
  foam: '#E6F8FB',
  ink: '#2B3A47',
  white: '#FFFFFF',
};

// Soft aqua / tirta gradients.
export const gradients = {
  ocean: ['#3BC2D2', '#2AA7C0', '#1E8FA6'] as const,
  hero:  ['#4DD8E8', '#2BAFC2', '#1A91A8'] as const,
  heroDark: ['#0C3A44', '#0A2A33', '#071E27'] as const,
  canvas: ['#F3F8FD', '#EBF7FA', '#E6F4F7'] as const,
  canvasDark: ['#0B2731', '#0A2230', '#0C2533'] as const,
  aqua: ['#5BD0DE', '#2BAFC2'] as const,
  tile: ['#3BC2D2', '#2399AE'] as const,
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
  bg: '#EEF8FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EAF5F8',
  inputBg: '#F3FAFB',
  text: '#2B3A47',
  textInv: '#FFFFFF',
  muted: '#7A9EAA',
  border: '#D6EEF3',
  primary: '#2BAFC2',
  primaryDark: '#1E8FA6',
  accent: '#5BD0DE',
  success: '#23B58A',
  danger: '#F2698A',
  warning: '#F2B04E',
  chip: '#DDF3F7',
  badgeBg: '#D0EEF4',
  hero: gradients.hero,
  scan: gradients.aqua,
  glassTint: 'light',
  glassOverlay: ['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.12)'],
  barOverlay: ['rgba(255,255,255,0.78)', 'rgba(230,247,249,0.65)'],
};

export const darkTheme: Theme = {
  mode: 'dark',
  isDark: true,
  bg: '#0B2630',
  surface: '#0F3340',
  surfaceAlt: '#143A46',
  inputBg: '#143A46',
  text: '#E6F7FA',
  textInv: '#0A2A33',
  muted: '#6B9BA8',
  border: '#1C434E',
  primary: '#34BACB',
  primaryDark: '#1E8FA6',
  accent: '#5BD0DE',
  success: '#34C79A',
  danger: '#FF8099',
  warning: '#F2B860',
  chip: '#163A45',
  badgeBg: '#123640',
  hero: gradients.heroDark,
  scan: gradients.aqua,
  glassTint: 'dark',
  glassOverlay: ['rgba(91,208,222,0.10)', 'rgba(10,42,51,0.10)'],
  barOverlay: ['rgba(15,51,64,0.82)', 'rgba(11,38,48,0.70)'],
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
