import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiCustomerDetail, apiCustomerHistory } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { CustomerDetail, MeterHistoryItem, MeterInfo } from '../types';
import { fonts, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ErrorState, Loading } from '../components/ScreenStates';
import { MiniBars } from '../components/ui/Charts';
import { CheckIcon, MapPinIcon } from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerDetail'>;

export default function CustomerDetailScreen({ route, navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
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

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading />;
  if (error || !detail) return <ErrorState message={error ?? 'Data tidak tersedia'} onRetry={load} />;

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

  return (
    <ScrollView keyboardShouldPersistTaps="handled" style={s.container} contentContainerStyle={{ padding: 14 }}>
      {/* gradient identity hero with stat strip */}
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadow.glow]}>
        <View style={s.heroTop}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(detail.nama ?? '?').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name} numberOfLines={1}>{detail.nama ?? 'Tanpa nama'}</Text>
            <Text style={s.meta} numberOfLines={1}>ID {detail.id} · Tipe {detail.tipe ?? '-'}</Text>
            {!!detail.alamat && <Text style={s.meta} numberOfLines={1}>{detail.alamat}</Text>}
          </View>
        </View>
        <View style={s.statStrip}>
          <Stat s={s} label="Meter" value={String(detail.lastMeter)} />
          <View style={s.statDiv} />
          <Stat s={s} label="Rata-rata" value={`${avgUsage} m³`} />
          <View style={s.statDiv} />
          <Stat s={s} label="Catatan" value={String(history.length)} />
        </View>
      </LinearGradient>

      <TouchableOpacity activeOpacity={0.9} onPress={goCatat} disabled={detail.alreadyRecordedThisMonth} style={{ marginTop: 14 }}>
        <LinearGradient
          colors={(detail.alreadyRecordedThisMonth ? [t.muted, t.muted] : t.scan) as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.catatBtn, !detail.alreadyRecordedThisMonth && shadow.glow]}
        >
          {detail.alreadyRecordedThisMonth && <CheckIcon size={18} color="#fff" strokeWidth={2.4} />}
          <Text style={s.catatText}>{detail.alreadyRecordedThisMonth ? 'Sudah dicatat bulan ini' : '+ Catat Meter'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.lokasiBtn}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('SetLocation', { id: detail.id, nama: detail.nama, lat: detail.latitude, lng: detail.longitude })}
      >
        <MapPinIcon size={17} color={t.primary} />
        <Text style={s.lokasiText}>{detail.latitude != null ? 'Ubah Lokasi' : 'Atur Lokasi'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.cardBtn}
        onPress={() => navigation.navigate('CustomerCard', { id: detail.id })}
      >
        <Text style={s.cardBtnText}>🪪 Kartu Pelanggan (Cetak / Bagikan)</Text>
      </TouchableOpacity>

      {usageData.length > 1 && (
        <>
          <Text style={s.sectionTitle}>Tren Pemakaian</Text>
          <View style={s.chartCard}>
            <View style={s.chartHead}>
              <Text style={s.chartHint}>m³ per periode</Text>
              <Text style={s.chartPeak}>puncak {maxUsage} m³</Text>
            </View>
            <MiniBars data={usageData} labels={usageLabels} color={t.accent} height={100} highlightLast highlightColor={t.primary} />
          </View>
        </>
      )}

      <Text style={s.sectionTitle}>Riwayat Pemakaian</Text>
      {history.length === 0 ? (
        <Text style={s.empty}>Belum ada riwayat catatan meter.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {history.map((h) => (
            <View key={h.id} style={s.histRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.histDate}>{h.tanggal}</Text>
                <Text style={s.histFaktur}>{h.noFaktur}</Text>
              </View>
              <View style={s.histRight}>
                <Text style={s.histMeter}>{h.meter}</Text>
                <Text style={s.histUsage}>{h.pemakaian == null ? '—' : `${h.pemakaian} m³`}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function Stat({ s, label, value }: { s: ReturnType<typeof createStyles>; label: string; value: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    hero: { borderRadius: radius.xl, padding: 18 },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatar: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 24 },
    name: { fontSize: 22, fontFamily: fonts.displayBold, color: '#fff', letterSpacing: tracking.tight },
    meta: { color: 'rgba(255,255,255,0.9)', marginTop: 2, fontFamily: fonts.regular, fontSize: 12.5 },
    statStrip: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: radius.md, paddingVertical: 12 },
    stat: { flex: 1, alignItems: 'center' },
    statValue: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 17 },
    statLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.medium, fontSize: 11, marginTop: 1 },
    statDiv: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.25)' },

    catatBtn: { flexDirection: 'row', gap: 8, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
    catatText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
    lokasiBtn: { flexDirection: 'row', gap: 8, marginTop: 10, borderWidth: 1.5, borderColor: t.primary, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    lokasiText: { color: t.primary, fontFamily: fonts.bold },
    cardBtn: { marginTop: 8, borderWidth: 1.5, borderColor: '#7C3AED', borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
    cardBtnText: { color: '#7C3AED', fontFamily: fonts.bold },

    sectionTitle: { fontSize: 18, fontFamily: fonts.displayBold, color: t.text, marginTop: 22, marginBottom: 12, letterSpacing: tracking.tight },
    chartCard: { backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: t.border, ...shadow.soft },
    chartHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    chartHint: { color: t.muted, fontFamily: fonts.medium, fontSize: 12 },
    chartPeak: { color: t.primary, fontFamily: fonts.bold, fontSize: 12 },

    empty: { color: t.muted, fontFamily: fonts.regular },
    histRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.surface, paddingHorizontal: 16, paddingVertical: 13, borderRadius: radius.lg, borderWidth: 1, borderColor: t.border, ...shadow.soft },
    histDate: { color: t.text, fontFamily: fonts.bold },
    histFaktur: { color: t.muted, fontSize: 12, marginTop: 2, fontFamily: fonts.regular },
    histRight: { alignItems: 'flex-end' },
    histMeter: { color: t.text, fontFamily: fonts.displayBold, fontSize: 17 },
    histUsage: { color: t.primary, fontSize: 12, fontFamily: fonts.semibold },
  });
