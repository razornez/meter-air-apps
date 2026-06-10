import React, { memo, useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiListFaktur } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { FakturListItem } from '../types';
import { fonts, formatRupiah, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';
import { InvoiceIcon } from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'FakturList'>;
const LIMIT = 20;
type Filter = 'all' | 'thisMonth' | 'unpaid';

export default function FakturListScreen({ route, navigation }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const s = useMemo(() => createStyles(t), [t]);
  const customerId = route.params?.customerId;
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<FakturListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Re-fetch tiap layar kembali fokus (mis. balik dari bayar) → status terbaru.
  useFocusEffect(useCallback(() => { load(1, filter); }, [filter, load]));

  async function onRefresh() {
    setRefreshing(true);
    await load(1, filter);
    setRefreshing(false);
  }

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
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.sumStrip, shadow.glow]}>
        <View style={s.sumIcon}><InvoiceIcon size={22} color="#fff" strokeWidth={2} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.sumSub}>{tr('faktur_list_total_registered')}</Text>
          <Text style={s.sumTitle}>{total} {tr('faktur_list_total_suffix')}</Text>
        </View>
      </LinearGradient>
      <View style={s.filters}>
        <Chip label={tr('faktur_list_filter_all')} value="all" />
        <Chip label={tr('faktur_list_filter_this_month')} value="thisMonth" />
        <Chip label={tr('faktur_list_filter_unpaid')} value="unpaid" />
      </View>

      {loading && items.length === 0 ? (
        <Loading />
      ) : error && items.length === 0 ? (
        <ErrorState message={error} onRetry={() => load(1, filter)} />
      ) : (
        <FlatList keyboardShouldPersistTaps="handled"
          data={items}
          keyExtractor={(it, i) => `${it.noFaktur}-${i}`}
          contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 14, gap: 10 }}
          ListEmptyComponent={<EmptyState label={tr('faktur_list_empty')} illustration='invoices' />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} colors={[t.primary]} />}
          // FlatList performance
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          renderItem={({ item }) => (
            <FakturCard
              item={item}
              s={s}
              successColor={t.success}
              dangerColor={t.danger}
              badgePaid={tr('faktur_list_badge_paid')}
              badgeUnpaid={tr('faktur_list_badge_unpaid')}
              onPress={() => item.noFaktur && navigation.navigate('FakturDetail', { noFaktur: item.noFaktur })}
            />
          )}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!loading && canLoadMore) load(page + 1, filter);
          }}
          ListFooterComponent={loading && items.length > 0 ? <Text style={s.footer}>{tr('faktur_list_loading_more')}</Text> : null}
        />
      )}
    </View>
  );
}

// Memoized card — mencegah re-render saat parent update (filter/pagination)
const FakturCard = memo(function FakturCard({ item, s, successColor, dangerColor, badgePaid, badgeUnpaid, onPress }: {
  item: FakturListItem;
  s: ReturnType<typeof createStyles>;
  successColor: string; dangerColor: string;
  badgePaid: string; badgeUnpaid: string;
  onPress: () => void;
}) {
  const color = item.isLunas ? successColor : dangerColor;
  return (
    <TouchableOpacity style={s.ticket} activeOpacity={0.85} onPress={onPress}>
      <View style={s.body}>
        <View style={[s.iconChip, { backgroundColor: color + '1A' }]}>
          <InvoiceIcon size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.faktur} numberOfLines={1}>{item.noFaktur}</Text>
          <Text style={s.meta} numberOfLines={1}>{item.namaPelanggan ?? `ID ${item.customerId}`}</Text>
          <View style={s.dateChip}>
            <Text style={s.dateText}>{item.tanggal ? item.tanggal.slice(0, 10) : '-'}</Text>
          </View>
        </View>
      </View>
      <View style={s.perf}>
        <View style={[s.notch, s.notchTop]} />
        {Array.from({ length: 6 }).map((_, i) => <View key={i} style={s.perfDot} />)}
        <View style={[s.notch, s.notchBottom]} />
      </View>
      <View style={s.stub}>
        <Text style={s.total}>{formatRupiah(item.total)}</Text>
        <View style={[s.badge, { backgroundColor: color + '22' }]}>
          <Text style={[s.badgeText, { color }]}>{item.isLunas ? badgePaid : badgeUnpaid}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    sumStrip: { flexDirection: 'row', alignItems: 'center', gap: 14, margin: 14, marginBottom: 4, padding: 16, borderRadius: radius.xl },
    sumIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)', alignItems: 'center', justifyContent: 'center' },
    sumSub: { color: 'rgba(255,255,255,0.88)', fontFamily: fonts.medium, fontSize: 12 },
    sumTitle: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 22, letterSpacing: tracking.tight },
    filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 2 },
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
    ticket: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    body: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    iconChip: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    faktur: { fontFamily: fonts.bold, color: t.text, fontSize: 14 },
    meta: { color: t.muted, marginTop: 2, fontFamily: fonts.regular, fontSize: 12.5 },
    dateChip: { alignSelf: 'flex-start', marginTop: 7, backgroundColor: t.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
    dateText: { color: t.muted, fontSize: 11, fontFamily: fonts.medium },
    perf: { width: 16, alignItems: 'center', justifyContent: 'space-around', paddingVertical: 12 },
    perfDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: t.border },
    notch: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: t.bg },
    notchTop: { top: -9 },
    notchBottom: { bottom: -9 },
    stub: { width: 106, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 14 },
    total: { fontFamily: fonts.displayBold, color: t.text, fontSize: 15, letterSpacing: tracking.tight, textAlign: 'center' },
    badge: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
    badgeText: { fontSize: 10.5, fontFamily: fonts.extrabold, letterSpacing: 0.4 },
    footer: { textAlign: 'center', padding: 14, color: t.muted, fontFamily: fonts.regular },
  });

