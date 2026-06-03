import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiWorklist } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { Worklist, WorklistItem } from '../types';
import { fonts, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';
import { ChevronIcon } from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Worklist'>;

export default function WorklistScreen({ navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const [data, setData] = useState<Worklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiWorklist());
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  function openCatat(item: WorklistItem) {
    navigation.navigate('Reading', {
      meterInfo: {
        customer: { id: item.id, nama: item.nama, alamat: item.alamat, tipe: item.tipe, barcode: item.barcode },
        lastMeter: item.lastMeter,
        alreadyRecordedThisMonth: false,
      },
    });
  }

  if (loading && !data) return <Loading label="Memuat worklist…" />;
  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.periode}>Pencatatan {data.periode}</Text>
        <Text style={s.progressLabel}>{data.done} / {data.total} selesai · {pct}%</Text>
        <View style={s.barBg}>
          <View style={[s.barFill, { width: `${pct}%` }]} />
        </View>
        <Text style={s.pendingLabel}>{data.pending} pelanggan belum dicatat</Text>
      </View>

      <FlatList
        data={data.customers}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={data.customers.length === 0 ? { flex: 1 } : { padding: 14, gap: 10 }}
        ListEmptyComponent={<EmptyState label="Semua pelanggan sudah dicatat bulan ini 🎉" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.row} activeOpacity={0.85} onPress={() => openCatat(item)}>
            <View style={{ flex: 1 }}>
              <Text style={s.nama} numberOfLines={1}>{item.nama ?? `ID ${item.id}`}</Text>
              <Text style={s.meta} numberOfLines={1}>{item.alamat ?? '-'} · meter {item.lastMeter}</Text>
            </View>
            <View style={s.catatPill}>
              <Text style={s.catatText}>Catat</Text>
              <ChevronIcon size={15} color={t.primary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    header: {
      backgroundColor: t.surface,
      margin: 14,
      padding: 18,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    periode: { fontFamily: fonts.displayBold, color: t.text, fontSize: 18, letterSpacing: tracking.tight },
    progressLabel: { color: t.primary, fontFamily: fonts.bold, marginTop: 6, fontSize: 13 },
    barBg: { height: 12, borderRadius: 6, backgroundColor: t.surfaceAlt, marginTop: 10, overflow: 'hidden' },
    barFill: { height: 12, borderRadius: 6, backgroundColor: t.success },
    pendingLabel: { color: t.muted, fontSize: 12, marginTop: 10, fontFamily: fonts.medium },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    nama: { fontFamily: fonts.bold, color: t.text, fontSize: 15 },
    meta: { color: t.muted, fontSize: 12, marginTop: 2, fontFamily: fonts.regular },
    catatPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: t.badgeBg,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.pill,
      marginLeft: 8,
    },
    catatText: { color: t.primary, fontFamily: fonts.bold, fontSize: 12.5 },
  });
