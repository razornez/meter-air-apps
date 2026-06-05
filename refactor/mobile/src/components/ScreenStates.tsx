import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts, pastels, radius } from '../theme';
import { useTheme } from '../ThemeContext';
import {
  AlertIcon, ChartIcon, GridIcon, InvoiceIcon, ListCheckIcon, MapPinIcon, UsersIcon,
} from './ui/Icons';

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
      <View style={[styles.iconWrap, { backgroundColor: pastels.peach.bg }]}>
        <AlertIcon size={36} color={pastels.peach.fg} strokeWidth={1.8} />
      </View>
      <Text style={[styles.errorText, { color: t.danger }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.retry, { borderColor: t.primary }]} onPress={onRetry}>
          <Text style={[styles.retryText, { color: t.primary }]}>Coba lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export type EmptyIllustration = 'customers' | 'invoices' | 'anomaly' | 'arrears' | 'worklist' | 'default';

const EMPTY_CONFIG: Record<EmptyIllustration, { Icon: React.ComponentType<any>; pastel: keyof typeof pastels; label: string }> = {
  customers: { Icon: UsersIcon,     pastel: 'sky',      label: 'Belum ada pelanggan' },
  invoices:  { Icon: InvoiceIcon,   pastel: 'lavender', label: 'Belum ada tagihan' },
  anomaly:   { Icon: AlertIcon,     pastel: 'peach',    label: 'Tidak ada anomali' },
  arrears:   { Icon: ChartIcon,     pastel: 'mint',     label: 'Tidak ada tunggakan' },
  worklist:  { Icon: ListCheckIcon, pastel: 'mint',     label: 'Semua selesai!' },
  default:   { Icon: MapPinIcon,    pastel: 'sky',      label: 'Tidak ada data' },
};

export function EmptyState({
  label,
  illustration = 'default',
}: {
  label?: string;
  illustration?: EmptyIllustration;
}) {
  const t = useTheme();
  const cfg = EMPTY_CONFIG[illustration];
  const p = pastels[cfg.pastel];
  return (
    <View style={[styles.center, { backgroundColor: 'transparent' }]}>
      <View style={[styles.emptyIconWrap, { backgroundColor: p.bg }]}>
        <cfg.Icon size={48} color={p.fg} strokeWidth={1.6} />
      </View>
      <Text style={[styles.muted, { color: t.muted, marginTop: 14 }]}>{label ?? cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { fontFamily: fonts.regular, textAlign: 'center', fontSize: 13 },
  errorText: { textAlign: 'center', marginTop: 10, fontFamily: fonts.medium },
  retry: { marginTop: 16, borderWidth: 1.5, borderRadius: radius.sm, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { fontFamily: fonts.bold },
  iconWrap: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emptyIconWrap: { width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
