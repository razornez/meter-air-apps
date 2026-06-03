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
import { apiListFaktur } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { FakturListItem } from '../types';
import { colors, formatRupiah } from '../theme';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'FakturList'>;
const LIMIT = 20;

type Filter = 'all' | 'thisMonth' | 'unpaid';

export default function FakturListScreen({ route, navigation }: Props) {
  const customerId = route.params?.customerId;
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<FakturListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (pageToLoad: number, f: Filter) => {
      setLoading(true);
      setError(null);
      const now = new Date();
      const params: Parameters<typeof apiListFaktur>[0] = {
        page: pageToLoad,
        limit: LIMIT,
        customerId,
      };
      if (f === 'thisMonth') {
        params.month = now.getMonth() + 1;
        params.year = now.getFullYear();
      } else if (f === 'unpaid') {
        params.isLunas = 0;
      }
      try {
        const res = await apiListFaktur(params);
        setTotal(res.total);
        setPage(res.page);
        setItems((prev) =>
          pageToLoad === 1 ? res.data : [...prev, ...res.data],
        );
      } catch (e) {
        setError(apiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [customerId],
  );

  useEffect(() => {
    load(1, filter);
  }, [filter, load]);

  const canLoadMore = items.length < total;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Chip label="Semua" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip
          label="Bulan ini"
          active={filter === 'thisMonth'}
          onPress={() => setFilter('thisMonth')}
        />
        <Chip
          label="Belum lunas"
          active={filter === 'unpaid'}
          onPress={() => setFilter('unpaid')}
        />
      </View>

      {loading && items.length === 0 ? (
        <Loading />
      ) : error && items.length === 0 ? (
        <ErrorState message={error} onRetry={() => load(1, filter)} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, i) => `${it.noFaktur}-${i}`}
          contentContainerStyle={items.length === 0 && { flex: 1 }}
          ListEmptyComponent={<EmptyState label="Tidak ada tagihan" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                item.noFaktur &&
                navigation.navigate('FakturDetail', { noFaktur: item.noFaktur })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.faktur}>{item.noFaktur}</Text>
                <Text style={styles.meta}>
                  {item.namaPelanggan ?? `ID ${item.customerId}`}
                </Text>
                <Text style={styles.date}>
                  {item.tanggal ? item.tanggal.slice(0, 10) : '-'}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.total}>{formatRupiah(item.total)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.isLunas ? styles.lunas : styles.belum,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.isLunas ? colors.success : colors.danger },
                    ]}
                  >
                    {item.isLunas ? 'LUNAS' : 'BELUM'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!loading && canLoadMore) load(page + 1, filter);
          }}
          ListFooterComponent={
            loading && items.length > 0 ? (
              <Text style={styles.footer}>Memuat…</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  filters: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: colors.card,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EEF2F6',
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faktur: { fontWeight: '700', color: colors.text },
  meta: { color: colors.muted, marginTop: 2 },
  date: { color: colors.muted, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', justifyContent: 'center' },
  total: { fontWeight: '700', color: colors.text },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lunas: { backgroundColor: '#E8F5E9' },
  belum: { backgroundColor: '#FDECEA' },
  statusText: { fontSize: 11, fontWeight: '800' },
  footer: { textAlign: 'center', padding: 12, color: colors.muted },
});
