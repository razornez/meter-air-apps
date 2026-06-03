import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiCustomerDetail, apiCustomerHistory } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { CustomerDetail, MeterHistoryItem, MeterInfo } from '../types';
import { colors } from '../theme';
import { ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerDetail'>;

export default function CustomerDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [history, setHistory] = useState<MeterHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, h] = await Promise.all([
        apiCustomerDetail(id),
        apiCustomerHistory(id),
      ]);
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
  if (error || !detail)
    return <ErrorState message={error ?? 'Data tidak tersedia'} onRetry={load} />;

  function goCatat() {
    if (!detail) return;
    const info: MeterInfo = {
      customer: {
        id: detail.id,
        nama: detail.nama,
        alamat: detail.alamat,
        tipe: detail.tipe,
        barcode: detail.barcode,
      },
      lastMeter: detail.lastMeter,
      alreadyRecordedThisMonth: detail.alreadyRecordedThisMonth,
    };
    navigation.navigate('Reading', { meterInfo: info });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{detail.nama ?? 'Tanpa nama'}</Text>
        <Text style={styles.meta}>ID {detail.id}</Text>
        {!!detail.alamat && <Text style={styles.meta}>{detail.alamat}</Text>}
        <View style={styles.badges}>
          <Badge text={`Tipe ${detail.tipe ?? '-'}`} />
          <Badge text={`Meter: ${detail.lastMeter}`} alt />
          {!!detail.telp && detail.telp !== '0' && (
            <Badge text={`☎ ${detail.telp}`} alt />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.catatBtn,
          detail.alreadyRecordedThisMonth && styles.catatDisabled,
        ]}
        onPress={goCatat}
        disabled={detail.alreadyRecordedThisMonth}
      >
        <Text style={styles.catatText}>
          {detail.alreadyRecordedThisMonth
            ? 'Sudah dicatat bulan ini'
            : '+ Catat Meter'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Riwayat Pemakaian</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>Belum ada riwayat catatan meter.</Text>
      ) : (
        history.map((h) => (
          <View key={h.id} style={styles.histRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.histDate}>{h.tanggal}</Text>
              <Text style={styles.histFaktur}>{h.noFaktur}</Text>
            </View>
            <View style={styles.histRight}>
              <Text style={styles.histMeter}>{h.meter}</Text>
              <Text style={styles.histUsage}>
                {h.pemakaian == null ? '—' : `${h.pemakaian} m³`}
              </Text>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function Badge({ text, alt }: { text: string; alt?: boolean }) {
  return (
    <View style={[styles.badge, alt && styles.badgeAlt]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.card, padding: 18 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  meta: { color: colors.muted, marginTop: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeAlt: { backgroundColor: '#E0F7FA' },
  badgeText: { color: colors.primaryDark, fontSize: 12, fontWeight: '600' },
  catatBtn: {
    backgroundColor: colors.primary,
    margin: 14,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  catatDisabled: { backgroundColor: colors.muted },
  catatText: { color: '#fff', fontWeight: '700' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  empty: { color: colors.muted, marginHorizontal: 16 },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  histDate: { color: colors.text, fontWeight: '600' },
  histFaktur: { color: colors.muted, fontSize: 12, marginTop: 2 },
  histRight: { alignItems: 'flex-end' },
  histMeter: { color: colors.text, fontWeight: '700', fontSize: 16 },
  histUsage: { color: colors.accent, fontSize: 12, fontWeight: '600' },
});
