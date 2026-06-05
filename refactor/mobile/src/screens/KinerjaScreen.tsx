import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiKinerja } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { KinerjaResponse } from '../types';
import { fonts, palette, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ErrorState, Loading } from '../components/ScreenStates';

export default function KinerjaScreen() {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { t: tr } = useTranslation();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<KinerjaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (m: number, y: number) => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiKinerja(m, y));
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(month, year);
  }, [month, year, load]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    const nowM = now.getMonth() + 1;
    const nowY = now.getFullYear();
    if (year > nowY || (year === nowY && month >= nowM)) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  if (loading && !data) return <Loading label={tr('kinerja_loading')} />;
  if (error && !data) return <ErrorState message={error} onRetry={() => load(month, year)} />;
  if (!data) return null;

  const pct = data.totalPelanggan > 0 ? Math.round((data.total / data.totalPelanggan) * 100) : 0;

  return (
    <ScrollView keyboardShouldPersistTaps="handled" style={s.container} contentContainerStyle={{ padding: 16 }}>
      {/* Navigator periode */}
      <View style={s.nav}>
        <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
          <Text style={s.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.navLabel}>{data.periode}</Text>
        <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
          <Text style={s.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={s.summary}>
        <Text style={s.summaryTitle}>{tr('kinerja_summary_title')}</Text>
        <Text style={s.summaryBig}>{data.total}</Text>
        <Text style={s.summaryMeta}>
          {tr('kinerja_summary_meta', { total: data.totalPelanggan, pct })}
        </Text>
        {/* Progress bar */}
        <View style={s.barBg}>
          <View style={[s.barFill, { width: `${Math.min(pct, 100)}%` }]} />
        </View>
      </View>

      {/* Per petugas */}
      <Text style={s.sectionTitle}>{tr('kinerja_section_per_officer')}</Text>
      {data.data.length === 0 ? (
        <Text style={s.empty}>{tr('kinerja_empty')}</Text>
      ) : (
        data.data.map((item, i) => (
          <View key={item.kasirId} style={s.row}>
            <View style={[s.rank, { backgroundColor: i === 0 ? palette.sea : t.surface }]}>
              <Text style={[s.rankText, { color: i === 0 ? '#fff' : t.muted }]}>
                {i + 1}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.nama}>{item.nama}</Text>
              <View style={s.barRowBg}>
                <View style={[s.barRowFill, { width: `${item.pct}%` }]} />
              </View>
            </View>
            <View style={s.right}>
              <Text style={s.jumlah}>{item.jumlah}</Text>
              <Text style={s.pct}>{item.pct}%</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 16 },
    navBtn: { backgroundColor: t.surface, borderRadius: 24, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
    navBtnText: { fontSize: 22, color: t.primary, fontFamily: fonts.bold },
    navLabel: { fontSize: 18, fontFamily: fonts.bold, color: t.text, minWidth: 100, textAlign: 'center' },
    summary: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 20,
      alignItems: 'center',
      marginBottom: 20,
      ...shadow.soft,
    },
    summaryTitle: { color: t.muted, fontFamily: fonts.semibold, marginBottom: 4 },
    summaryBig: { fontSize: 48, fontFamily: fonts.displayBold, color: t.primary, letterSpacing: -1 },
    summaryMeta: { color: t.muted, fontFamily: fonts.regular, marginTop: 4 },
    barBg: { width: '100%', height: 8, borderRadius: 4, backgroundColor: t.border, marginTop: 12, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: 4, backgroundColor: t.primary },
    sectionTitle: { fontFamily: fonts.bold, color: t.text, fontSize: 15, marginBottom: 10 },
    empty: { color: t.muted, fontFamily: fonts.regular, textAlign: 'center', marginTop: 20 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: radius.md,
      padding: 14,
      marginBottom: 10,
      ...shadow.soft,
    },
    rank: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    rankText: { fontFamily: fonts.bold, fontSize: 15 },
    nama: { fontFamily: fonts.semibold, color: t.text, marginBottom: 6 },
    barRowBg: { height: 6, borderRadius: 3, backgroundColor: t.border, overflow: 'hidden' },
    barRowFill: { height: 6, borderRadius: 3, backgroundColor: palette.sea },
    right: { alignItems: 'flex-end', marginLeft: 12 },
    jumlah: { fontFamily: fonts.displayBold, color: t.text, fontSize: 22 },
    pct: { color: t.muted, fontFamily: fonts.regular, fontSize: 12 },
  });
