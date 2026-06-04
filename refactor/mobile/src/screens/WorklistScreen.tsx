import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiWorklist } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { Worklist, WorklistItem } from '../types';
import { fonts, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';
import { DonutChart } from '../components/ui/Charts';
import { ChevronIcon, MapPinIcon } from '../components/ui/Icons';

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

  const ratio = data.total > 0 ? data.done / data.total : 0;

  return (
    <FlatList keyboardShouldPersistTaps="handled"
      style={s.container}
      data={data.customers}
      keyExtractor={(it) => String(it.id)}
      contentContainerStyle={data.customers.length === 0 ? { flexGrow: 1 } : { padding: 14, gap: 10, paddingBottom: 30 }}
      ListHeaderComponent={
        <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadow.glow]}>
          <DonutChart value={ratio} size={112} stroke={12} color="#fff" track="rgba(255,255,255,0.25)">
            <Text style={s.donutPct}>{Math.round(ratio * 100)}%</Text>
            <Text style={s.donutSub}>tercatat</Text>
          </DonutChart>
          <View style={s.heroRight}>
            <Text style={s.heroLabel}>PENCATATAN · {data.periode}</Text>
            <Text style={s.heroBig}>{data.done}<Text style={s.heroSlash}> / {data.total}</Text></Text>
            <Text style={s.heroNote}>pelanggan selesai dicatat</Text>
            <View style={s.pendingPill}>
              <Text style={s.pendingText}>{data.pending} belum dicatat</Text>
            </View>
          </View>
        </LinearGradient>
      }
      ListEmptyComponent={<EmptyState label="Semua pelanggan sudah dicatat bulan ini 🎉" />}
      renderItem={({ item, index }) => (
        <TouchableOpacity style={s.row} activeOpacity={0.85} onPress={() => openCatat(item)}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(item.nama ?? '?').charAt(0).toUpperCase()}</Text>
            <View style={s.numBadge}><Text style={s.numText}>{index + 1}</Text></View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.nama} numberOfLines={1}>{item.nama ?? `ID ${item.id}`}</Text>
            <View style={s.metaRow}>
              <MapPinIcon size={13} color={t.muted} />
              <Text style={s.meta} numberOfLines={1}>{item.alamat ?? '-'} · meter {item.lastMeter}</Text>
            </View>
          </View>
          <LinearGradient colors={t.scan} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.catatPill}>
            <Text style={s.catatText}>Catat</Text>
            <ChevronIcon size={15} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    />
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    hero: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: radius.xl, marginBottom: 4 },
    donutPct: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 24, letterSpacing: -0.5 },
    donutSub: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.medium, fontSize: 10.5, marginTop: -2 },
    heroRight: { flex: 1 },
    heroLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: tracking.overline },
    heroBig: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 30, marginTop: 4 },
    heroSlash: { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.bold, fontSize: 18 },
    heroNote: { color: 'rgba(255,255,255,0.88)', fontFamily: fonts.regular, fontSize: 12 },
    pendingPill: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
    pendingText: { color: '#fff', fontFamily: fonts.bold, fontSize: 12 },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: t.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    avatar: { width: 46, height: 46, borderRadius: 15, backgroundColor: t.badgeBg, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: t.primary, fontFamily: fonts.displayBold, fontSize: 19 },
    numBadge: { position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: t.surface },
    numText: { color: '#fff', fontFamily: fonts.bold, fontSize: 9.5 },
    nama: { fontFamily: fonts.bold, color: t.text, fontSize: 15 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    meta: { color: t.muted, fontSize: 12, fontFamily: fonts.regular, flex: 1 },
    catatPill: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill },
    catatText: { color: '#fff', fontFamily: fonts.bold, fontSize: 12.5 },
  });
