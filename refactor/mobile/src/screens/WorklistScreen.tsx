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
import { apiWorklist } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { Worklist, WorklistItem } from '../types';
import { colors } from '../theme';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Worklist'>;

export default function WorklistScreen({ navigation }: Props) {
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

  // Muat ulang setiap layar difokuskan (mis. balik dari mencatat).
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  function openCatat(item: WorklistItem) {
    navigation.navigate('Reading', {
      meterInfo: {
        customer: {
          id: item.id,
          nama: item.nama,
          alamat: item.alamat,
          tipe: item.tipe,
          barcode: item.barcode,
        },
        lastMeter: item.lastMeter,
        alreadyRecordedThisMonth: false,
      },
    });
  }

  if (loading && !data) return <Loading label="Memuat worklist…" />;
  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.periode}>Pencatatan {data.periode}</Text>
        <Text style={styles.progressLabel}>
          {data.done} / {data.total} selesai ({pct}%)
        </Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.pendingLabel}>
          {data.pending} pelanggan belum dicatat
        </Text>
      </View>

      <FlatList
        data={data.customers}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={data.customers.length === 0 && { flex: 1 }}
        ListEmptyComponent={
          <EmptyState label="Semua pelanggan sudah dicatat bulan ini 🎉" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openCatat(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nama} numberOfLines={1}>
                {item.nama ?? `ID ${item.id}`}
              </Text>
              <Text style={styles.meta}>
                {item.alamat ?? '-'} · meter {item.lastMeter}
              </Text>
            </View>
            <Text style={styles.catat}>Catat ›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.card, padding: 16 },
  periode: { fontWeight: '700', color: colors.text, fontSize: 16 },
  progressLabel: { color: colors.primaryDark, fontWeight: '700', marginTop: 6 },
  barBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E1E8EF',
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: { height: 10, borderRadius: 5, backgroundColor: colors.success },
  pendingLabel: { color: colors.muted, fontSize: 12, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nama: { fontWeight: '600', color: colors.text, fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  catat: { color: colors.primary, fontWeight: '700', marginLeft: 8 },
});
