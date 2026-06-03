import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiListCustomers } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { CustomerListItem } from '../types';
import { fonts, gradients, palette, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';
import { ChevronIcon, SearchIcon } from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomersList'>;
const LIMIT = 20;

export default function CustomersListScreen({ navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
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
      const res = await apiListCustomers({ search: q || undefined, page: pageToLoad, limit: LIMIT });
      setTotal(res.total);
      setPage(res.page);
      setItems((prev) => (pageToLoad === 1 ? res.data : [...prev, ...res.data]));
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(1, search), 350);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [search, load]);

  const canLoadMore = items.length < total;

  if (loading && items.length === 0) return <Loading />;
  if (error && items.length === 0) return <ErrorState message={error} onRetry={() => load(1, search)} />;

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <SearchIcon size={18} color={t.muted} />
          <TextInput
            style={s.search}
            placeholder="Cari nama / id / alamat"
            placeholderTextColor={t.muted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
        {total > 0 && <Text style={s.count}>{total} pelanggan terdaftar</Text>}
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 14, gap: 10 }}
        ListEmptyComponent={<EmptyState label="Pelanggan tidak ditemukan" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CustomerDetail', { id: item.id })}
          >
            <LinearGradient colors={gradients.aqua as readonly [string, string, ...string[]]} style={s.avatar}>
              <Text style={s.avatarText}>{item.tipe ?? '?'}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={1}>{item.nama ?? 'Tanpa nama'}</Text>
              <Text style={s.meta} numberOfLines={1}>
                ID {item.id}{item.alamat ? ` · ${item.alamat}` : ''}
              </Text>
            </View>
            <ChevronIcon size={20} color={t.muted} />
          </TouchableOpacity>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && canLoadMore) load(page + 1, search);
        }}
        ListFooterComponent={loading && items.length > 0 ? <Text style={s.footer}>Memuat…</Text> : null}
      />
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    searchWrap: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 14,
      ...shadow.soft,
    },
    search: { flex: 1, paddingVertical: 12, color: t.text, fontFamily: fonts.regular, fontSize: 14 },
    count: { color: t.muted, fontFamily: fonts.medium, fontSize: 12, marginTop: 10, marginLeft: 4 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 14,
      paddingVertical: 13,
      ...shadow.soft,
    },
    avatar: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: palette.white, fontFamily: fonts.extrabold, fontSize: 15 },
    name: { fontSize: 15, fontFamily: fonts.bold, color: t.text },
    meta: { fontSize: 12, color: t.muted, marginTop: 2, fontFamily: fonts.regular },
    footer: { textAlign: 'center', padding: 14, color: t.muted, fontFamily: fonts.regular },
  });
