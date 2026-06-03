import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiReportMonthly, apiReportSummary } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { MonthlyReport, ReportSummary } from '../types';
import { colors, formatRupiah } from '../theme';
import { ErrorState, Loading } from '../components/ScreenStates';

export default function ReportsScreen() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m] = await Promise.all([
        apiReportSummary(),
        apiReportMonthly(6),
      ]);
      setSummary(s);
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
  if (error || !summary)
    return <ErrorState message={error ?? 'Data tidak tersedia'} onRetry={load} />;

  const b = summary.bulanIni;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.section}>Bulan Ini ({b.periode})</Text>
      <View style={styles.kpiGrid}>
        <Kpi label="Pelanggan" value={String(summary.totalPelanggan)} wide />
        <Kpi label="Faktur" value={String(b.jumlahFaktur)} />
        <Kpi label="Pemakaian" value={`${b.pemakaianM3} m³`} />
        <Kpi label="Total Tagihan" value={formatRupiah(b.totalTagihan)} wide />
        <Kpi
          label="Terbayar"
          value={formatRupiah(b.totalTerbayar)}
          color={colors.success}
        />
        <Kpi
          label="Belum"
          value={formatRupiah(b.totalBelum)}
          color={colors.danger}
        />
      </View>

      <Text style={styles.section}>Rekap 6 Bulan</Text>
      {monthly.length === 0 ? (
        <Text style={styles.muted}>Belum ada data.</Text>
      ) : (
        monthly.map((m) => (
          <View key={m.periode} style={styles.monthCard}>
            <View style={styles.monthHead}>
              <Text style={styles.periode}>{m.periode}</Text>
              <Text style={styles.muted}>{m.jumlahFaktur} faktur</Text>
            </View>
            <View style={styles.monthRow}>
              <Text style={styles.muted}>Tagihan</Text>
              <Text style={styles.val}>{formatRupiah(m.totalTagihan)}</Text>
            </View>
            <View style={styles.monthRow}>
              <Text style={styles.muted}>Terbayar</Text>
              <Text style={[styles.val, { color: colors.success }]}>
                {formatRupiah(m.totalTerbayar)}
              </Text>
            </View>
            <View style={styles.monthRow}>
              <Text style={styles.muted}>Belum</Text>
              <Text style={[styles.val, { color: colors.danger }]}>
                {formatRupiah(m.totalBelum)}
              </Text>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Kpi({
  label,
  value,
  color,
  wide,
}: {
  label: string;
  value: string;
  color?: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.kpi, wide && styles.kpiWide]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  section: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 10,
  },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiWide: { width: '100%' },
  kpiLabel: { color: colors.muted, fontSize: 12 },
  kpiValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  monthCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  periode: { fontWeight: '800', color: colors.primaryDark, fontSize: 16 },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  val: { fontWeight: '600', color: colors.text },
  muted: { color: colors.muted },
});
