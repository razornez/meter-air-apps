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
import { apiTunggakan } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { TunggakanItem, TunggakanResponse } from '../types';
import { colors, formatRupiah } from '../theme';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Tunggakan'>;
const LIMIT = 50;

export default function TunggakanScreen({ navigation }: Props) {
  const [res, setRes] = useState<TunggakanResponse | null>(null);
  const [items, setItems] = useState<TunggakanItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiTunggakan(p, LIMIT);
      setRes(data);
      setItems((prev) => (p === 1 ? data.data : [...prev, ...data.data]));
      setPage(p);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  if (loading && !res) return <Loading label="Memuat tunggakan…" />;
  if (error && !res) return <ErrorState message={error} onRetry={() => load(1)} />;
  if (!res) return null;

  const canLoadMore = items.length < res.total;

  return (
    <View style={styles.container}>
      {/* Header ringkasan */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pelanggan menunggak</Text>
          <Text style={styles.summaryValue}>{res.total} orang</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total tagihan</Text>
          <Text style={styles.summaryValue}>{formatRupiah(res.totalTagihan)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total denda</Text>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            {formatRupiah(res.totalDenda)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.grandRow]}>
          <Text style={styles.grandLabel}>Grand total</Text>
          <Text style={styles.grandValue}>{formatRupiah(res.grandTotal)}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.customerId)}
        contentContainerStyle={items.length === 0 && { flex: 1 }}
        ListEmptyComponent={<EmptyState label="Tidak ada tunggakan 🎉" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('FakturList', { customerId: item.customerId })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.nama} numberOfLines={1}>
                {item.nama ?? `ID ${item.customerId}`}
              </Text>
              <Text style={styles.meta}>
                {item.jumlahFaktur} faktur · telat {item.hariTelatMax} hari
              </Text>
              {!!item.alamat && (
                <Text style={styles.alamat} numberOfLines={1}>{item.alamat}</Text>
              )}
            </View>
            <View style={styles.right}>
              <Text style={styles.grand}>{formatRupiah(item.grandTotal)}</Text>
              {item.totalDenda > 0 && (
                <Text style={styles.denda}>denda {formatRupiah(item.totalDenda)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && canLoadMore) load(page + 1);
        }}
        ListFooterComponent={
          loading && items.length > 0 ? (
            <Text style={styles.footer}>Memuat…</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  summary: {
    backgroundColor: colors.card,
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.danger,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: { color: colors.muted, fontSize: 13 },
  summaryValue: { color: colors.text, fontWeight: '600', fontSize: 13 },
  grandRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 6,
    paddingTop: 6,
  },
  grandLabel: { color: colors.text, fontWeight: '700', fontSize: 15 },
  grandValue: { color: colors.danger, fontWeight: '800', fontSize: 15 },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nama: { fontWeight: '700', color: colors.text, fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  alamat: { color: colors.muted, fontSize: 11, marginTop: 1 },
  right: { alignItems: 'flex-end', justifyContent: 'center', marginLeft: 8 },
  grand: { color: colors.danger, fontWeight: '800', fontSize: 14 },
  denda: { color: colors.warning, fontSize: 11, marginTop: 2 },
  footer: { textAlign: 'center', padding: 12, color: colors.muted },
});
