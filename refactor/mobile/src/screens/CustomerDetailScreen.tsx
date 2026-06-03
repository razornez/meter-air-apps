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
import { MapPinIcon } from '../components/ui/Icons';

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

  const Badge = ({ text }: { text: string }) => (
    <View style={s.badge}>
      <Text style={s.badgeText}>{text}</Text>
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 14 }}>
      <View style={s.header}>
        <Text style={s.name}>{detail.nama ?? 'Tanpa nama'}</Text>
        <Text style={s.meta}>ID {detail.id}</Text>
        {!!detail.alamat && <Text style={s.meta}>{detail.alamat}</Text>}
        <View style={s.badges}>
          <Badge text={`Tipe ${detail.tipe ?? '-'}`} />
          <Badge text={`Meter: ${detail.lastMeter}`} />
          {!!detail.telp && detail.telp !== '0' && <Badge text={`☎ ${detail.telp}`} />}
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={goCatat} disabled={detail.alreadyRecordedThisMonth} style={{ marginTop: 14 }}>
        <LinearGradient
          colors={(detail.alreadyRecordedThisMonth ? [t.muted, t.muted] : t.scan) as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.catatBtn, !detail.alreadyRecordedThisMonth && shadow.glow]}
        >
          <Text style={s.catatText}>
            {detail.alreadyRecordedThisMonth ? 'Sudah dicatat bulan ini' : '+ Catat Meter'}
          </Text>
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

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    header: { backgroundColor: t.surface, padding: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: t.border, ...shadow.soft },
    name: { fontSize: 22, fontFamily: fonts.displayBold, color: t.text, letterSpacing: tracking.tight },
    meta: { color: t.muted, marginTop: 2, fontFamily: fonts.regular },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    badge: { backgroundColor: t.badgeBg, paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill },
    badgeText: { color: t.primary, fontSize: 12, fontFamily: fonts.semibold },
    catatBtn: { borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
    catatText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
    lokasiBtn: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
      borderWidth: 1.5,
      borderColor: t.primary,
      borderRadius: radius.md,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lokasiText: { color: t.primary, fontFamily: fonts.bold },
    sectionTitle: { fontSize: 18, fontFamily: fonts.displayBold, color: t.text, marginTop: 22, marginBottom: 12, letterSpacing: tracking.tight },
    empty: { color: t.muted, fontFamily: fonts.regular },
    histRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    histDate: { color: t.text, fontFamily: fonts.bold },
    histFaktur: { color: t.muted, fontSize: 12, marginTop: 2, fontFamily: fonts.regular },
    histRight: { alignItems: 'flex-end' },
    histMeter: { color: t.text, fontFamily: fonts.displayBold, fontSize: 17 },
    histUsage: { color: t.primary, fontSize: 12, fontFamily: fonts.semibold },
  });
