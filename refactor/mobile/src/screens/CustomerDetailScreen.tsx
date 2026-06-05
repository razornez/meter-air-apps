import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiCustomerDetail, apiCustomerHistory } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { CustomerDetail, MeterHistoryItem, MeterInfo } from '../types';
import { fonts, pastels, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ErrorState, Loading } from '../components/ScreenStates';
import { MiniBars } from '../components/ui/Charts';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerDetail'>;

export default function CustomerDetailScreen({ route, navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { t: tr } = useTranslation();
  const { id } = route.params;
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [history, setHistory] = useState<MeterHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, h] = await Promise.all([apiCustomerDetail(id), apiCustomerHistory(id)]);
      setDetail(d);
      setHistory(h);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;
  if (error || !detail) return <ErrorState message={error ?? tr('customer_detail_error_no_data')} onRetry={load} />;

  function goCatat() {
    if (!detail) return;
    const info: MeterInfo = {
      customer: { id: detail.id, nama: detail.nama, alamat: detail.alamat, tipe: detail.tipe, barcode: detail.barcode },
      lastMeter: detail.lastMeter,
      alreadyRecordedThisMonth: detail.alreadyRecordedThisMonth,
      latitude: detail.latitude,
      longitude: detail.longitude,
    };
    navigation.navigate('Reading', { meterInfo: info });
  }

  const chrono = [...history].reverse().slice(-8);
  const usageData = chrono.map((h) => h.pemakaian ?? 0);
  const usageLabels = chrono.map((h) => (h.tanggal ?? '').slice(5, 7));
  const usageVals = history.map((h) => h.pemakaian).filter((v): v is number => v != null);
  const avgUsage = usageVals.length ? Math.round(usageVals.reduce((a, v) => a + v, 0) / usageVals.length) : 0;
  const maxUsage = usageVals.length ? Math.max(...usageVals) : 0;

  const recorded = detail.alreadyRecordedThisMonth;
  const avatarLetter = (detail.nama ?? '?').charAt(0).toUpperCase();

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={s.container}
      contentContainerStyle={{ padding: 14, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero identity card ── */}
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadow.glow]}>
        <View style={s.heroTop}>
          {/* Avatar circle */}
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={[s.typeBadge]}>
              <Text style={s.typeText}>{detail.tipe ?? '?'}</Text>
            </View>
          </View>

          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[s.name, { flex: 1 }]} numberOfLines={1}>{detail.nama ?? 'Tanpa nama'}</Text>
              <View style={[s.statusBadge, recorded ? s.badgeDone : s.badgePending]}>
                <Ionicons name={recorded ? 'checkmark-circle' : 'time-outline'} size={14} color={recorded ? '#15803D' : '#B45309'} />
                <Text style={[s.badgeText, { color: recorded ? '#15803D' : '#B45309' }]}>
                  {recorded ? tr('customer_detail_status_recorded') : tr('customer_detail_status_pending')}
                </Text>
              </View>
            </View>
            <View style={s.metaRow}>
              <Ionicons name="barcode-outline" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={s.meta}>ID {detail.id}</Text>
            </View>
            {!!detail.alamat && (
              <View style={s.metaRow}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.75)" />
                <Text style={s.meta} numberOfLines={1}>{detail.alamat}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats strip */}
        <View style={s.statStrip}>
          <StatChip icon="speedometer-outline" label={tr('customer_detail_stat_meter')} value={String(detail.lastMeter)} />
          <View style={s.statDiv} />
          <StatChip icon="trending-up-outline" label={tr('customer_detail_stat_average')} value={`${avgUsage} m³`} />
          <View style={s.statDiv} />
          <StatChip icon="document-text-outline" label={tr('customer_detail_stat_records')} value={String(history.length)} />
        </View>
      </LinearGradient>

      {/* ── Catat Meter CTA ── */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={goCatat}
        disabled={recorded}
        style={[{ marginTop: 12 }, recorded && s.dimmed]}
      >
        <LinearGradient
          colors={recorded ? [t.muted, t.muted] : t.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.catatCard, !recorded && shadow.glow]}
        >
          <View style={s.catatIconWrap}>
            <MaterialCommunityIcons
              name={recorded ? 'check-decagram' : 'gauge'}
              size={24}
              color="#fff"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.catatTitle}>
              {recorded ? tr('customer_detail_button_already_recorded') : tr('customer_detail_button_record')}
            </Text>
            <Text style={s.catatSub}>
              {recorded
                ? tr('customer_detail_catat_sub_recorded', { meter: detail.lastMeter })
                : tr('customer_detail_catat_sub_pending')}
            </Text>
          </View>
          {!recorded && (
            <View style={s.catatChevron}>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.9)" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* ── 2 secondary action chips ── */}
      <View style={s.secondaryRow}>
        {/* Set / Ubah Lokasi */}
        <TouchableOpacity
          style={[s.secCard, { backgroundColor: pastels.sky.bg, borderColor: pastels.sky.fg + '44' }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SetLocation', { id: detail.id, nama: detail.nama, lat: detail.latitude, lng: detail.longitude })}
        >
          <View style={[s.secIconWrap, { backgroundColor: pastels.sky.bg }]}>
            <Ionicons name="navigate-circle-outline" size={26} color={pastels.sky.fg} />
          </View>
          <Text style={[s.secTitle, { color: pastels.sky.fg }]}>
            {detail.latitude != null ? tr('customer_detail_button_change_location') : tr('customer_detail_button_set_location')}
          </Text>
          {detail.latitude != null && (
            <View style={s.locDot}><View style={s.locDotInner} /></View>
          )}
        </TouchableOpacity>

        {/* Kartu Pelanggan */}
        <TouchableOpacity
          style={[s.secCard, { backgroundColor: pastels.lavender.bg, borderColor: pastels.lavender.fg + '44' }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CustomerCard', { id: detail.id })}
        >
          <View style={[s.secIconWrap, { backgroundColor: pastels.lavender.bg }]}>
            <Ionicons name="id-card-outline" size={26} color={pastels.lavender.fg} />
          </View>
          <Text style={[s.secTitle, { color: pastels.lavender.fg }]}>
            {tr('customer_detail_button_customer_card')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Usage trend chart ── */}
      {usageData.length > 1 && (
        <>
          <Text style={s.sectionTitle}>{tr('customer_detail_section_usage_trend')}</Text>
          <View style={s.chartCard}>
            <View style={s.chartHead}>
              <Text style={s.chartHint}>{tr('customer_detail_chart_unit')}</Text>
              <View style={s.peakBadge}>
                <Ionicons name="flame-outline" size={13} color={t.primary} />
                <Text style={s.chartPeak}>{tr('customer_detail_chart_peak', { max: maxUsage })}</Text>
              </View>
            </View>
            <MiniBars data={usageData} labels={usageLabels} color={t.accent} height={100} highlightLast highlightColor={t.primary} />
          </View>
        </>
      )}

      {/* ── History timeline ── */}
      <Text style={s.sectionTitle}>{tr('customer_detail_section_history')}</Text>
      {history.length === 0 ? (
        <Text style={s.empty}>{tr('customer_detail_history_empty')}</Text>
      ) : (
        <View style={s.timeline}>
          {history.map((h, idx) => {
            const delta = idx < history.length - 1
              ? (h.pemakaian ?? 0) - (history[idx + 1].pemakaian ?? 0)
              : null;
            const isUp = delta != null && delta > 0;
            const isDown = delta != null && delta < 0;
            const month = (h.tanggal ?? '').slice(0, 7);
            return (
              <View key={h.id} style={s.timelineItem}>
                {/* Left timeline rail */}
                <View style={s.rail}>
                  <View style={[s.railDot, { backgroundColor: h.pemakaian != null ? t.primary : t.muted }]} />
                  {idx < history.length - 1 && <View style={s.railLine} />}
                </View>

                {/* Content card */}
                <View style={s.histCard}>
                  {/* Foto meteran (bila ada) */}
                  {!!h.fotoUrl && (
                    <Image source={{ uri: h.fotoUrl }} style={s.histPhoto} resizeMode="cover" />
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={s.histTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.histDate}>{month}</Text>
                        <Text style={s.histFaktur} numberOfLines={1}>{h.noFaktur ?? '—'}</Text>
                      </View>
                      {/* Status bayar */}
                      {h.isLunas != null && (
                        <View style={[s.histPayBadge, h.isLunas ? s.histBadgePaid : s.histBadgeUnpaid]}>
                          <Ionicons name={h.isLunas ? 'checkmark-circle' : 'time-outline'} size={11} color={h.isLunas ? '#15803D' : '#B45309'} />
                          <Text style={[s.histPayText, { color: h.isLunas ? '#15803D' : '#B45309' }]}>
                            {h.isLunas ? tr('customer_detail_history_paid') : tr('customer_detail_history_unpaid')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={s.histRight}>
                    <Text style={s.histMeter}>{h.meter} <Text style={s.histUnit}>m³</Text></Text>
                    {delta != null && (
                      <View style={[s.deltaBadge, isUp ? s.deltaUp : isDown ? s.deltaDown : s.deltaFlat]}>
                        <Ionicons name={isUp ? 'arrow-up' : isDown ? 'arrow-down' : 'remove'} size={10} color={isUp ? '#16A34A' : isDown ? '#2563EB' : t.muted} />
                        <Text style={[s.deltaText, { color: isUp ? '#16A34A' : isDown ? '#2563EB' : t.muted }]}>{Math.abs(delta)} m³</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Ionicons name={icon as any} size={16} color="rgba(255,255,255,0.7)" />
      <Text style={{ color: '#fff', fontFamily: fonts.displayBold, fontSize: 16 }}>{value}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontFamily: fonts.medium, fontSize: 10 }}>{label}</Text>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    dimmed: { opacity: 0.45 },

    // Hero
    hero: { borderRadius: radius.xl, padding: 18 },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatarWrap: { position: 'relative' },
    avatar: {
      width: 68, height: 68, borderRadius: 26,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)',
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 28 },
    typeBadge: {
      position: 'absolute', bottom: -4, right: -4,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
    },
    typeText: { color: t.primary, fontFamily: fonts.extrabold, fontSize: 10 },
    name: { fontSize: 21, fontFamily: fonts.displayBold, color: '#fff', letterSpacing: tracking.tight },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    meta: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.regular, fontSize: 12, flex: 1 },
    statStrip: {
      flexDirection: 'row', alignItems: 'center', marginTop: 16,
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderRadius: radius.md, paddingVertical: 14,
    },
    statDiv: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
    statusBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 8, paddingVertical: 4,
      borderRadius: radius.pill, borderWidth: 1,
    },
    badgeDone:    { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
    badgePending: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
    badgeText: { fontFamily: fonts.extrabold, fontSize: 11 },

    // Catat Meter CTA
    catatCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderRadius: radius.lg, paddingVertical: 13, paddingHorizontal: 16,
    },
    catatIconWrap: {
      width: 44, height: 44, borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    catatTitle: { color: '#fff', fontFamily: fonts.extrabold, fontSize: 15 },
    catatSub: { color: 'rgba(255,255,255,0.75)', fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
    catatChevron: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center', justifyContent: 'center',
    },

    // Secondary action chips (2 cards side-by-side)
    secondaryRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    secCard: {
      flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingVertical: 12, borderRadius: radius.md,
      borderWidth: 1.5, position: 'relative',
    },
    secIconWrap: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    secTitle: { fontFamily: fonts.bold, fontSize: 12, textAlign: 'center' },
    locDot: { position: 'absolute', top: 8, right: 8 },
    locDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },

    // Chart
    sectionTitle: { fontSize: 17, fontFamily: fonts.displayBold, color: t.text, marginTop: 22, marginBottom: 12, letterSpacing: tracking.tight },
    chartCard: { backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: t.border, ...shadow.soft },
    chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    chartHint: { color: t.muted, fontFamily: fonts.medium, fontSize: 12 },
    peakBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    chartPeak: { color: t.primary, fontFamily: fonts.bold, fontSize: 12 },
    empty: { color: t.muted, fontFamily: fonts.regular, marginTop: 4 },

    // Timeline history
    timeline: { gap: 0 },
    timelineItem: { flexDirection: 'row', gap: 12 },
    rail: { alignItems: 'center', width: 20, paddingTop: 16 },
    railDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
    railLine: { flex: 1, width: 2, backgroundColor: t.border, marginTop: 4 },
    histCard: {
      flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: t.surface, borderRadius: radius.lg,
      paddingHorizontal: 12, paddingVertical: 10,
      marginBottom: 8, borderWidth: 1, borderColor: t.border,
      ...shadow.soft,
    },
    histPhoto: { width: 48, height: 48, borderRadius: 10, backgroundColor: t.surfaceAlt },
    histTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    histDate: { color: t.text, fontFamily: fonts.bold, fontSize: 13 },
    histFaktur: { color: t.muted, fontSize: 11.5, marginTop: 2, fontFamily: fonts.regular },
    histPayBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: radius.pill },
    histBadgePaid:   { backgroundColor: '#DCFCE7' },
    histBadgeUnpaid: { backgroundColor: '#FEF3C7' },
    histPayText: { fontFamily: fonts.extrabold, fontSize: 10 },
    histRight: { alignItems: 'flex-end', gap: 4 },
    histMeter: { color: t.text, fontFamily: fonts.displayBold, fontSize: 18 },
    histUnit: { color: t.muted, fontSize: 12, fontFamily: fonts.regular },
    deltaBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 2,
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill,
    },
    deltaUp:   { backgroundColor: '#DCFCE7' },
    deltaDown: { backgroundColor: '#DBEAFE' },
    deltaFlat: { backgroundColor: t.chip },
    deltaText: { fontFamily: fonts.bold, fontSize: 10 },
  });
