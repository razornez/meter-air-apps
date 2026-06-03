import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts, radius } from '../theme';
import { useTheme } from '../ThemeContext';
import { AlertIcon, DropletIcon } from './ui/Icons';

// Shared loading/error/empty states — theme-aware (DRY).

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

export function EmptyState({ label = 'Tidak ada data' }: { label?: string }) {
  const t = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: 'transparent' }]}>
      <View style={{ opacity: 0.35, marginBottom: 6 }}>
        <DropletIcon size={46} color={t.muted} />
      </View>
      <Text style={[styles.muted, { color: t.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { marginTop: 10, fontFamily: fonts.regular },
  errorText: { textAlign: 'center', marginTop: 10, fontFamily: fonts.medium },
  retry: { marginTop: 16, borderWidth: 1.5, borderRadius: radius.sm, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { fontFamily: fonts.bold },
});
