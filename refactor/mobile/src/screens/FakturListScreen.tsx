import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiListFaktur } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { FakturListItem } from '../types';
import { fonts, formatRupiah, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'FakturList'>;
const LIMIT = 20;
type Filter = 'all' | 'thisMonth' | 'unpaid';

export default function FakturListScreen({ route, navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
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
      const params: Parameters<typeof apiListFaktur>[0] = { page: pageToLoad, limit: LIMIT, customerId };
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
        setItems((prev) => (pageToLoad === 1 ? res.data : [...prev, ...res.data]));
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

  const Chip = ({ label, value }: { label: string; value: Filter }) => {
    const active = filter === value;
    return (
      <TouchableOpacity style={[s.chip, active && s.chipActive]} onPress={() => setFilter(value)} activeOpacity={0.85}>
        <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.filters}>
        <Chip label="Semua" value="all" />
        <Chip label="Bulan ini" value="thisMonth" />
        <Chip label="Belum lunas" value="unpaid" />
      </View>

      {loading && items.length === 0 ? (
        <Loading />
      ) : error && items.length === 0 ? (
        <ErrorState message={error} onRetry={() => load(1, filter)} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, i) => `${it.noFaktur}-${i}`}
          contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 14, gap: 10 }}
          ListEmptyComponent={<EmptyState label="Tidak ada tagihan" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.row}
              activeOpacity={0.85}
              onPress={() => item.noFaktur && navigation.navigate('FakturDetail', { noFaktur: item.noFaktur })}
            >
              <View style={[s.accent, { backgroundColor: item.isLunas ? t.success : t.danger }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.faktur}>{item.noFaktur}</Text>
                <Text style={s.meta}>{item.namaPelanggan ?? `ID ${item.customerId}`}</Text>
                <Text style={s.date}>{item.tanggal ? item.tanggal.slice(0, 10) : '-'}</Text>
              </View>
              <View style={s.right}>
                <Text style={s.total}>{formatRupiah(item.total)}</Text>
                <View style={[s.badge, { backgroundColor: item.isLunas ? t.success + '22' : t.danger + '22' }]}>
                  <Text style={[s.badgeText, { color: item.isLunas ? t.success : t.danger }]}>
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
          ListFooterComponent={loading && items.length > 0 ? <Text style={s.footer}>Memuat…</Text> : null}
        />
      )}
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 2 },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
    },
    chipActive: { backgroundColor: t.primary, borderColor: t.primary },
    chipText: { color: t.muted, fontFamily: fonts.semibold, fontSize: 13 },
    chipTextActive: { color: '#fff' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      paddingVertical: 13,
      paddingRight: 14,
      paddingLeft: 0,
      overflow: 'hidden',
      ...shadow.soft,
    },
    accent: { width: 5, alignSelf: 'stretch', borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg, marginRight: 12 },
    faktur: { fontFamily: fonts.bold, color: t.text, fontSize: 14 },
    meta: { color: t.muted, marginTop: 2, fontFamily: fonts.regular, fontSize: 12.5 },
    date: { color: t.muted, fontSize: 11.5, marginTop: 2, fontFamily: fonts.regular },
    right: { alignItems: 'flex-end', justifyContent: 'center' },
    total: { fontFamily: fonts.displayBold, color: t.text, fontSize: 15.5, letterSpacing: tracking.tight },
    badge: { marginTop: 6, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
    badgeText: { fontSize: 10.5, fontFamily: fonts.extrabold, letterSpacing: 0.4 },
    footer: { textAlign: 'center', padding: 14, color: t.muted, fontFamily: fonts.regular },
  });
