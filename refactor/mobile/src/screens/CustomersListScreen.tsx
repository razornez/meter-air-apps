import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiListCustomers } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { CustomerListItem } from '../types';
import { colors } from '../theme';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomersList'>;
const LIMIT = 20;

export default function CustomersListScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async (pageToLoad: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiListCustomers({
        search: q || undefined,
        page: pageToLoad,
        limit: LIMIT,
      });
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
  }, []);

  // Muat awal + saat search berubah (debounce).
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(1, search), 350);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [search, load]);

  const canLoadMore = items.length < total;

  if (loading && items.length === 0) return <Loading />;
  if (error && items.length === 0)
    return <ErrorState message={error} onRetry={() => load(1, search)} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Cari nama / id / alamat"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={items.length === 0 && { flex: 1 }}
        ListEmptyComponent={<EmptyState label="Pelanggan tidak ditemukan" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('CustomerDetail', { id: item.id })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.tipe ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.nama ?? 'Tanpa nama'}</Text>
              <Text style={styles.meta}>
                ID {item.id}
                {item.alamat ? ` • ${item.alamat}` : ''}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && canLoadMore) load(page + 1, search);
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
  searchWrap: { padding: 12, backgroundColor: colors.card },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.primaryDark, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.muted, marginLeft: 8 },
  footer: { textAlign: 'center', padding: 12, color: colors.muted },
});
