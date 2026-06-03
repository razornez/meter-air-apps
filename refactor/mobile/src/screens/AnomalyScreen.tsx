import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiAnomalies } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { Anomaly } from '../types';
import { colors } from '../theme';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Anomaly'>;

const TYPE_LABEL: Record<Anomaly['type'], string> = {
  lonjakan: '⤴ Lonjakan',
  nol: '⛔ Nol',
  turun: '⤵ Turun',
};

function sevColor(s: Anomaly['severity']) {
  return s === 'tinggi' ? colors.danger : colors.warning;
}

export default function AnomalyScreen({ navigation }: Props) {
  const [items, setItems] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await apiAnomalies(100));
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading label="Memeriksa anomali…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (items.length === 0)
    return <EmptyState label="Tidak ada anomali konsumsi terdeteksi 👍" />;

  return (
    <View style={styles.container}>
      <Text style={styles.summary}>
        {items.length} pelanggan perlu diverifikasi
      </Text>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.customerId)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('CustomerDetail', { id: item.customerId })
            }
          >
            <View style={[styles.sevBar, { backgroundColor: sevColor(item.severity) }]} />
            <View style={{ flex: 1 }}>
              <View style={styles.head}>
                <Text style={styles.nama} numberOfLines={1}>
                  {item.nama ?? `ID ${item.customerId}`}
                </Text>
                <View
                  style={[styles.badge, { backgroundColor: sevColor(item.severity) }]}
                >
                  <Text style={styles.badgeText}>{TYPE_LABEL[item.type]}</Text>
                </View>
              </View>
              <Text style={styles.alasan}>{item.alasan}</Text>
              <Text style={styles.meta}>
                Terakhir <Text style={styles.bold}>{item.latest} m³</Text> · rata-rata{' '}
                {item.rata} m³
                {item.rasio > 0 ? ` · ${item.rasio}×` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  summary: {
    padding: 12,
    color: colors.muted,
    fontSize: 13,
    backgroundColor: colors.card,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sevBar: { width: 5 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 14,
  },
  nama: { fontWeight: '700', color: colors.text, fontSize: 15, flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  alasan: { color: colors.text, fontSize: 13, paddingHorizontal: 14, marginTop: 4 },
  meta: {
    color: colors.muted,
    fontSize: 12,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 12,
  },
  bold: { fontWeight: '700', color: colors.text },
});
