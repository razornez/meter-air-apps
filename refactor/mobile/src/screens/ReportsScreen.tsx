import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { apiReportMonthly, apiReportSummary } from '../api/services';
import { MonthlyReport, ReportSummary } from '../types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fonts, formatRupiah, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ErrorState, Loading } from '../components/ScreenStates';
import { DonutChart, MiniBars } from '../components/ui/Charts';
import { ChartIcon, ChevronIcon, ListCheckIcon, UsersIcon } from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

export default function ReportsScreen({ navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { t: i18n } = useTranslation();
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [summary, monthly] = await Promise.all([apiReportSummary(), apiReportMonthly(6)]);
    return { summary, monthly };
  });
  const summary: ReportSummary | null = data?.summary ?? null;
  const monthly: MonthlyReport[] = data?.monthly ?? [];

  if (loading) return <Loading />;
  if (error || !summary) return <ErrorState message={error ?? 'Data tidak tersedia'} onRetry={() => reload()} />;

  const b = summary.bulanIni;
  const paidRatio = b.totalTagihan > 0 ? b.totalTerbayar / b.totalTagihan : 0;
  const chrono = [...monthly].reverse(); // oldest → newest (newest on the right)
  const barData = chrono.map((m) => m.totalTagihan);
  const barLabels = chrono.map((m) => m.periode.slice(5));

  return (
    <ScrollView keyboardShouldPersistTaps="handled" style={s.container} contentContainerStyle={{ padding: 16 }}>
      {/* Hero: donut paid-ratio + totals */}
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadow.glow]}>
        <Text style={s.heroLabel}>{i18n('reports_hero_label', { period: b.periode })}</Text>
        <View style={s.heroRow}>
          <DonutChart value={paidRatio} size={116} stroke={13} color="#fff" track="rgba(255,255,255,0.25)">
            <Text style={s.donutPct}>{Math.round(paidRatio * 100)}%</Text>
            <Text style={s.donutSub}>{i18n('reports_donut_paid')}</Text>
          </DonutChart>
          <View style={s.heroRight}>
            <Text style={s.heroTotalLabel}>{i18n('reports_total_billing_label')}</Text>
            <Text style={s.heroTotal}>{formatRupiah(b.totalTagihan)}</Text>
            <View style={s.legendRow}>
              <View style={[s.dot, { backgroundColor: '#BFF5E2' }]} />
              <Text style={s.legendText}>{i18n('reports_legend_paid', { amount: formatRupiah(b.totalTerbayar) })}</Text>
            </View>
            <View style={s.legendRow}>
              <View style={[s.dot, { backgroundColor: '#FFC2CF' }]} />
              <Text style={s.legendText}>{i18n('reports_legend_unpaid', { amount: formatRupiah(b.totalBelum) })}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* KPI grid with icon chips */}
      <View style={s.kpiGrid}>
        <Kpi s={s} t={t} Icon={UsersIcon} tint="#3DA0E3" bg="#DEEFFF" label={i18n('reports_kpi_customers')} value={String(summary.totalPelanggan)} />
        <Kpi s={s} t={t} Icon={ListCheckIcon} tint="#23B58A" bg="#DCF5EA" label={i18n('reports_kpi_invoices')} value={String(b.jumlahFaktur)} />
        <Kpi s={s} t={t} Icon={ChartIcon} tint="#7A6CF0" bg="#ECE9FF" label={i18n('reports_kpi_usage')} value={`${b.pemakaianM3} m³`} />
        <Kpi s={s} t={t} Icon={ChartIcon} tint="#FF8E63" bg="#FFE7DC" label={i18n('reports_kpi_avg_invoice')} value={b.jumlahFaktur ? formatRupiah(Math.round(b.totalTagihan / b.jumlahFaktur)) : '-'} />
      </View>

      <TouchableOpacity style={s.kinerjaCard} onPress={() => navigation.navigate('Kinerja')} activeOpacity={0.85}>
        <View style={s.kinerjaIcon}><UsersIcon size={22} color={t.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.kinerjaTitle}>{i18n('reports_kinerja_title')}</Text>
          <Text style={s.kinerjaSubtitle}>{i18n('reports_kinerja_subtitle')}</Text>
        </View>
        <ChevronIcon size={20} color={t.muted} />
      </TouchableOpacity>

      {/* 6-month trend bar chart */}
      <Text style={s.section}>{i18n('reports_section_trend')}</Text>
      {chrono.length === 0 ? (
        <Text style={s.muted}>{i18n('reports_no_data')}</Text>
      ) : (
        <>
          <View style={s.chartCard}>
            <MiniBars data={barData} labels={barLabels} color={t.accent} height={104} highlightLast highlightColor={t.primary} />
          </View>
          {chrono
            .slice()
            .reverse()
            .map((m) => {
              const pct = m.totalTagihan > 0 ? Math.max(0, Math.min(1, m.totalTerbayar / m.totalTagihan)) : 0;
              return (
                <View key={m.periode} style={s.monthCard}>
                  <View style={s.monthHead}>
                    <Text style={s.periode}>{m.periode}</Text>
                    <Text style={s.monthTotal}>{formatRupiah(m.totalTagihan)}</Text>
                  </View>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: t.success }]} />
                  </View>
                  <View style={s.monthMetaRow}>
                    <Text style={s.muted}>{i18n('reports_month_invoices', { count: m.jumlahFaktur })}</Text>
                    <Text style={s.muted}>{i18n('reports_month_paid_pct', { pct: Math.round(pct * 100) })}</Text>
                  </View>
                </View>
              );
            })}
        </>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Kpi({
  s,
  t,
  Icon,
  tint,
  bg,
  label,
  value,
}: {
  s: ReturnType<typeof createStyles>;
  t: Theme;
  Icon: (p: { size?: number; color?: string; strokeWidth?: number }) => React.JSX.Element;
  tint: string;
  bg: string;
  label: string;
  value: string;
}) {
  return (
    <View style={s.kpi}>
      <View style={[s.kpiIcon, { backgroundColor: t.isDark ? tint + '26' : bg }]}>
        <Icon size={18} color={tint} strokeWidth={2.1} />
      </View>
      <Text style={s.kpiValue}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    hero: { borderRadius: radius.xl, padding: 20, marginBottom: 16 },
    heroLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: tracking.overline },
    heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 16 },
    donutPct: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 26, letterSpacing: -0.5 },
    donutSub: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.medium, fontSize: 11, marginTop: -2 },
    heroRight: { flex: 1 },
    heroTotalLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.medium, fontSize: 12 },
    heroTotal: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 24, marginTop: 2, marginBottom: 10, letterSpacing: tracking.tight },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
    dot: { width: 9, height: 9, borderRadius: 5 },
    legendText: { color: '#fff', fontFamily: fonts.medium, fontSize: 11.5 },

    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpi: { width: '47.5%', flexGrow: 1, backgroundColor: t.surface, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: t.border, ...shadow.soft },
    kpiIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    kpiValue: { color: t.text, fontSize: 20, fontFamily: fonts.displayBold, letterSpacing: tracking.tight },
    kpiLabel: { color: t.muted, fontSize: 12, fontFamily: fonts.medium, marginTop: 2 },

    section: { fontSize: 19, fontFamily: fonts.display, color: t.text, marginTop: 22, marginBottom: 13, letterSpacing: tracking.tight },
    chartCard: { backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: t.border, marginBottom: 12, ...shadow.soft },

    monthCard: { backgroundColor: t.surface, borderRadius: radius.lg, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: t.border, ...shadow.soft },
    monthHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
    periode: { fontFamily: fonts.displayBold, color: t.text, fontSize: 16, letterSpacing: tracking.tight },
    monthTotal: { fontFamily: fonts.displayBold, color: t.text, fontSize: 15 },
    barTrack: { height: 8, borderRadius: 4, backgroundColor: t.surfaceAlt, overflow: 'hidden', marginBottom: 8 },
    barFill: { height: '100%', borderRadius: 4 },
    monthMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
    muted: { color: t.muted, fontFamily: fonts.regular, fontSize: 12 },

    kinerjaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.surface, borderRadius: radius.lg, padding: 14, marginTop: 14, borderWidth: 1, borderColor: t.border, gap: 12, ...shadow.soft },
    kinerjaIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: t.badgeBg, alignItems: 'center', justifyContent: 'center' },
    kinerjaTitle: { fontFamily: fonts.bold, color: t.text, fontSize: 15 },
    kinerjaSubtitle: { color: t.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  });
