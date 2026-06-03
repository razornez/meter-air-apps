import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { apiReportMonthly, apiReportSummary } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { MonthlyReport, ReportSummary } from '../types';
import { fonts, formatRupiah, palette, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

export default function ReportsScreen({ navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, m] = await Promise.all([apiReportSummary(), apiReportMonthly(6)]);
      setSummary(sum);
      setMonthly(m);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading />;
  if (error || !summary) return <ErrorState message={error ?? 'Data tidak tersedia'} onRetry={load} />;

  const b = summary.bulanIni;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      {/* headline revenue */}
      <LinearGradient
        colors={t.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.headline, shadow.glow]}
      >
        <Text style={s.headlineLabel}>Total Tagihan · {b.periode}</Text>
        <Text style={s.headlineValue}>{formatRupiah(b.totalTagihan)}</Text>
        <View style={s.headlineRow}>
          <View style={s.hPill}>
            <Text style={s.hPillLabel}>Terbayar</Text>
            <Text style={s.hPillValue}>{formatRupiah(b.totalTerbayar)}</Text>
          </View>
          <View style={s.hPill}>
            <Text style={s.hPillLabel}>Belum</Text>
            <Text style={s.hPillValue}>{formatRupiah(b.totalBelum)}</Text>
          </View>
        </View>
      </LinearGradient>

      <Text style={s.section}>Ringkasan Bulan Ini</Text>
      <View style={s.kpiGrid}>
        <Kpi t={t} s={s} label="Pelanggan" value={String(summary.totalPelanggan)} />
        <Kpi t={t} s={s} label="Faktur" value={String(b.jumlahFaktur)} />
        <Kpi t={t} s={s} label="Pemakaian" value={`${b.pemakaianM3} m³`} />
        <Kpi t={t} s={s} label="Rata/Faktur" value={b.jumlahFaktur ? formatRupiah(Math.round(b.totalTagihan / b.jumlahFaktur)) : '-'} />
      </View>

      <TouchableOpacity
        style={s.kinerjaCard}
        onPress={() => navigation.navigate('Kinerja')}
        activeOpacity={0.85}
      >
        <Text style={s.kinerjaIcon}>👷</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.kinerjaTitle}>Rekap Kinerja Petugas</Text>
          <Text style={s.kinerjaSubtitle}>Jumlah catatan per petugas per periode</Text>
        </View>
        <Text style={s.kinerjaChevron}>›</Text>
      </TouchableOpacity>

      <Text style={s.section}>Rekap 6 Bulan</Text>
      {monthly.length === 0 ? (
        <Text style={s.muted}>Belum ada data.</Text>
      ) : (
        monthly.map((m) => (
          <View key={m.periode} style={s.monthCard}>
            <View style={s.monthHead}>
              <Text style={s.periode}>{m.periode}</Text>
              <Text style={s.muted}>{m.jumlahFaktur} faktur</Text>
            </View>
            <Bar t={t} s={s} paid={m.totalTerbayar} total={m.totalTagihan} />
            <View style={s.monthRow}>
              <Text style={s.muted}>Tagihan</Text>
              <Text style={s.val}>{formatRupiah(m.totalTagihan)}</Text>
            </View>
            <View style={s.monthRow}>
              <Text style={s.muted}>Terbayar</Text>
              <Text style={[s.val, { color: t.success }]}>{formatRupiah(m.totalTerbayar)}</Text>
            </View>
            <View style={s.monthRow}>
              <Text style={s.muted}>Belum</Text>
              <Text style={[s.val, { color: t.danger }]}>{formatRupiah(m.totalBelum)}</Text>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Kpi({ t, s, label, value }: { t: Theme; s: ReturnType<typeof createStyles>; label: string; value: string }) {
  return (
    <View style={s.kpi}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={s.kpiValue}>{value}</Text>
    </View>
  );
}

function Bar({ t, s, paid, total }: { t: Theme; s: ReturnType<typeof createStyles>; paid: number; total: number }) {
  const pct = total > 0 ? Math.max(0, Math.min(1, paid / total)) : 0;
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: t.success }]} />
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    headline: { borderRadius: radius.xl, padding: 20, marginBottom: 8 },
    headlineLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: tracking.overline, textTransform: 'uppercase' },
    headlineValue: { color: palette.white, fontFamily: fonts.displayBlack, fontSize: 34, marginTop: 6, letterSpacing: tracking.display },
    headlineRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    hPill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: radius.md, padding: 12 },
    hPillLabel: { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.medium, fontSize: 11 },
    hPillValue: { color: palette.white, fontFamily: fonts.bold, fontSize: 14, marginTop: 3 },
    section: { fontSize: 19, fontFamily: fonts.display, color: t.text, marginTop: 22, marginBottom: 13, letterSpacing: tracking.tight },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpi: {
      width: '47.5%',
      flexGrow: 1,
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 15,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    kpiLabel: { color: t.muted, fontSize: 12, fontFamily: fonts.medium },
    kpiValue: { color: t.text, fontSize: 21, fontFamily: fonts.displayBold, marginTop: 6, letterSpacing: tracking.tight },
    monthCard: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 15,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    monthHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
    periode: { fontFamily: fonts.displayBold, color: t.text, fontSize: 17, letterSpacing: tracking.tight },
    barTrack: { height: 8, borderRadius: 4, backgroundColor: t.surfaceAlt, overflow: 'hidden', marginBottom: 12 },
    barFill: { height: '100%', borderRadius: 4 },
    monthRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
    val: { fontFamily: fonts.semibold, color: t.text },
    muted: { color: t.muted, fontFamily: fonts.regular },
    kinerjaCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: t.border,
      gap: 10,
      ...shadow.soft,
    },
    kinerjaIcon: { fontSize: 26 },
    kinerjaTitle: { fontFamily: fonts.bold, color: t.text, fontSize: 15 },
    kinerjaSubtitle: { color: t.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
    kinerjaChevron: { fontSize: 22, color: t.muted },
  });
