import React from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts, radius } from '../theme';
import { useTheme } from '../ThemeContext';
import { AlertIcon } from './ui/Icons';

// Crop helper — tampilkan bagian tertentu dari sprite sheet
export function CroppedImage({
  source, srcW, srcH, cropX, cropY, cropW, cropH, size,
}: {
  source: ImageSourcePropType; srcW: number; srcH: number;
  cropX: number; cropY: number; cropW: number; cropH: number; size: number;
}) {
  const scale = size / cropW;
  return (
    <View style={{ width: size, height: size * (cropH / cropW), overflow: 'hidden' }}>
      <Image
        source={source}
        style={{
          width: srcW * scale, height: srcH * scale,
          position: 'absolute', left: -cropX * scale, top: -cropY * scale,
        }}
        resizeMode="cover"
      />
    </View>
  );
}

export function Loading({ label = 'Memuat…' }: { label?: string }) {
  const t = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: 'transparent' }]}>
      <ActivityIndicator size="large" color={t.primary} />
      <Text style={[styles.muted, { color: t.muted }]}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const t = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: 'transparent' }]}>
      <AlertIcon size={40} color={t.danger} />
      <Text style={[styles.errorText, { color: t.danger }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.retry, { borderColor: t.primary }]} onPress={onRetry}>
          <Text style={[styles.retryText, { color: t.primary }]}>Coba lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Sprite: illustration-empty-states.png 1024x1536 — 2 kolom, 3 baris
// Row 1: No Customers (0,0) | No Invoices (512,0)
// Row 2: No Anomalies (0,512) | No Arrears (512,512)
// Row 3: Worklist Complete center (256,1024)
const EMPTY_SPRITE = require('../../assets/illustration-empty-states.png');
const SPRITE_W = 1024, SPRITE_H = 1536, CELL = 512;

export type EmptyIllustration = 'customers' | 'invoices' | 'anomaly' | 'arrears' | 'worklist' | 'default';

const CROPS: Record<EmptyIllustration, [number, number]> = {
  customers:  [0,    0],
  invoices:   [512,  0],
  anomaly:    [0,    512],
  arrears:    [512,  512],
  worklist:   [256,  1024],
  default:    [0,    0],
};

export function EmptyState({
  label = 'Tidak ada data',
  illustration = 'default',
}: {
  label?: string;
  illustration?: EmptyIllustration;
}) {
  const t = useTheme();
  const [cx, cy] = CROPS[illustration];
  return (
    <View style={[styles.center, { backgroundColor: 'transparent' }]}>
      <CroppedImage
        source={EMPTY_SPRITE}
        srcW={SPRITE_W} srcH={SPRITE_H}
        cropX={cx} cropY={cy} cropW={CELL} cropH={CELL}
        size={140}
      />
      <Text style={[styles.muted, { color: t.muted, marginTop: 12 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { fontFamily: fonts.regular, textAlign: 'center', fontSize: 13 },
  errorText: { textAlign: 'center', marginTop: 10, fontFamily: fonts.medium },
  retry: { marginTop: 16, borderWidth: 1.5, borderRadius: radius.sm, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { fontFamily: fonts.bold },
});
