import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme';

// Komponen status bersama agar penanganan loading/error/empty konsisten (DRY).

export function Loading({ label = 'Memuat…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retry} onPress={onRetry}>
          <Text style={styles.retryText}>Coba lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EmptyState({ label = 'Tidak ada data' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  muted: { color: colors.muted, marginTop: 10 },
  errorIcon: { fontSize: 40 },
  errorText: { color: colors.danger, textAlign: 'center', marginTop: 8 },
  emptyIcon: { fontSize: 40 },
  retry: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  retryText: { color: colors.primary, fontWeight: '600' },
});
