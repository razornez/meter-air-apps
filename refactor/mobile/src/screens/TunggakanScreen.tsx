import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiTunggakan } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { TunggakanItem, TunggakanResponse } from '../types';
import { buildWAMessage, formatPhoneWA, openWA } from '../utils/whatsapp';
import { fonts, formatRupiah, gradients, pastels, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Tunggakan'>;
type Filter = 'semua' | 'besar' | 'lama';
const LIMIT = 200;

function severityConfig(days: number) {
  if (days > 90) return { bg: '#FEE2E2', fg: '#DC2626', icon: 'flame' as const,        label: `${days}h` };
  if (days > 30) return { bg: '#FEF3C7', fg: '#D97706', icon: 'warning' as const,      label: `${days}h` };
  return          { bg: '#DBEAFE', fg: '#2563EB', icon: 'time-outline' as const, label: `${days}h` };
}

export default function TunggakanScreen({ navigation }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const s = useMemo(() => createStyles(t), [t]);
  const [res, setRes]         = useState<TunggakanResponse | null>(null);
  const [items, setItems]     = useState<TunggakanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<Filter>('semua');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiTunggakan(1, LIMIT);
      setRes(data); setItems(data.data);
    } catch (e) { setError(apiErrorMessage(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    setItems([]);
    setRes(null);
    await load();
    setRefreshing(false);
  }

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(i => (i.nama ?? '').toLowerCase().includes(q) || String(i.customerId).includes(q));
    }
    if (filter === 'besar') list = [...list].sort((a, b) => b.grandTotal - a.grandTotal);
    if (filter === 'lama')  list = [...list].sort((a, b) => b.hariTelatMax - a.hariTelatMax);
    return list;
  }, [items, search, filter]);

  if (loading && !res) return <Loading label={tr('tunggakan_loading')} />;
  if (error && !res)   return <ErrorState message={error} onRetry={load} />;
  if (!res) return null;

  const FILTERS: { key: Filter; label: string; icon: string }[] = [
    { key: 'semua', label: tr('tunggakan_filter_all'),     icon: 'list-outline' },
    { key: 'besar', label: tr('tunggakan_filter_largest'), icon: 'trending-up' },
    { key: 'lama',  label: tr('tunggakan_filter_oldest'),  icon: 'time-outline' },
  ];

  return (
    <FlatList
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1 }}
      data={filtered}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} colors={[t.primary]} />}
      keyExtractor={(it) => String(it.customerId)}
      contentContainerStyle={filtered.length === 0
        ? { flexGrow: 1 }
        : { paddingHorizontal: 14, paddingBottom: 24, gap: 10 }}
      ListEmptyComponent={
        <EmptyState label={search ? tr('tunggakan_search_empty') : tr('tunggakan_empty')} illustration="arrears" />
      }

      ListHeaderComponent={
        <View>
          {/* ── Hero ── */}
          <LinearGradient colors={gradients.coral} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.hero, shadow.glow]}>
            <View style={s.heroLeft}>
              <Text style={s.heroLabel}>{tr('tunggakan_hero_label')}</Text>
              <Text style={s.heroTotal}>{formatRupiah(res.grandTotal)}</Text>
              <View style={s.heroTagRow}>
                <View style={s.heroTag}>
                  <Ionicons name="people" size={12} color="rgba(255,255,255,0.9)" />
                  <Text style={s.heroTagText}>{res.total} {tr('tunggakan_pill_arrears')}</Text>
                </View>
                {res.totalDenda > 0 && (
                  <View style={[s.heroTag, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                    <Ionicons name="alert-circle" size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={s.heroTagText}>{tr('tunggakan_pill_fine')} {formatRupiah(res.totalDenda)}</Text>
                  </View>
                )}
              </View>
            </View>
            {/* Dekoratif icon kanan */}
            <View style={s.heroIconWrap}>
              <Ionicons name="card" size={48} color="rgba(255,255,255,0.18)" />
            </View>
          </LinearGradient>

          {/* ── Search ── */}
          <View style={s.searchWrap}>
            <Ionicons name="search-outline" size={18} color={t.muted} />
            <TextInput
              style={s.searchInput}
              placeholder={tr('tunggakan_search_placeholder')}
              placeholderTextColor={t.muted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={t.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Filters ── */}
          <View style={s.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.key}
                style={[s.filterChip, filter === f.key && s.filterChipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={f.icon as any} size={13} color={filter === f.key ? '#fff' : t.muted} />
                <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={s.filterCount}>{filtered.length} {tr('tunggakan_count_suffix')}</Text>
          </View>
        </View>
      }

      renderItem={({ item, index }) => {
        const sev      = severityConfig(item.hariTelatMax);
        const initials = (item.nama ?? '?').trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        const hasWA    = !!formatPhoneWA(item.telp);

        return (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('FakturList', { customerId: item.customerId })}
          >
            {/* ── Baris 1: avatar + nama + amount ── */}
            <View style={s.cardTop}>
              {/* Avatar */}
              <View style={[s.avatar, { backgroundColor: sev.bg }]}>
                <Text style={[s.avatarText, { color: sev.fg }]}>{initials}</Text>
                <View style={[s.rankBadge, { backgroundColor: sev.fg }]}>
                  <Text style={s.rankText}>{index + 1}</Text>
                </View>
              </View>

              {/* Nama + meta */}
              <View style={{ flex: 1 }}>
                <Text style={s.nama} numberOfLines={1}>{item.nama ?? `ID ${item.customerId}`}</Text>
                {!!item.alamat && (
                  <View style={s.metaRow}>
                    <Ionicons name="location-outline" size={11} color={t.muted} />
                    <Text style={s.alamat} numberOfLines={1}>{item.alamat}</Text>
                  </View>
                )}
              </View>

              {/* Grand total */}
              <View style={s.amountWrap}>
                <Text style={[s.grand, { color: sev.fg }]}>{formatRupiah(item.grandTotal)}</Text>
                <Ionicons name="chevron-forward" size={14} color={t.muted} />
              </View>
            </View>

            {/* ── Baris 2: chips info ── */}
            <View style={s.cardBottom}>
              {/* Faktur count */}
              <View style={s.infoChip}>
                <Ionicons name="document-text-outline" size={12} color={t.muted} />
                <Text style={s.infoChipText}>{tr('tunggakan_item_meta', { count: item.jumlahFaktur, days: item.hariTelatMax })}</Text>
              </View>

              {/* Days overdue badge */}
              <View style={[s.daysBadge, { backgroundColor: sev.bg }]}>
                <Ionicons name={sev.icon} size={11} color={sev.fg} />
                <Text style={[s.daysText, { color: sev.fg }]}>{sev.label} telat</Text>
              </View>

              {/* Denda badge */}
              {item.totalDenda > 0 && (
                <View style={[s.daysBadge, { backgroundColor: pastels.peach.bg }]}>
                  <Ionicons name="alert-circle-outline" size={11} color={pastels.peach.fg} />
                  <Text style={[s.daysText, { color: pastels.peach.fg }]}>+{formatRupiah(item.totalDenda)}</Text>
                </View>
              )}

              {/* Spacer */}
              <View style={{ flex: 1 }} />

              {/* WA button */}
              {hasWA && (
                <TouchableOpacity
                  style={s.waBtn}
                  activeOpacity={0.85}
                  onPress={async (e) => {
                    e.stopPropagation?.();
                    const msg = buildWAMessage({ namaCustomer: item.nama, noFaktur: `${item.jumlahFaktur} faktur`, total: item.grandTotal, tglJatuhTempo: null });
                    await openWA(item.telp, msg);
                  }}
                >
                  <MaterialCommunityIcons name="whatsapp" size={15} color="#16A34A" />
                  <Text style={s.waBtnText}>{tr('tunggakan_wa_button')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    // Hero
    hero: {
      flexDirection: 'row', alignItems: 'center',
      margin: 14, marginBottom: 0,
      borderRadius: radius.xl, padding: 20,
      overflow: 'hidden',
    },
    heroLeft: { flex: 1 },
    heroLabel: { color: 'rgba(255,255,255,0.88)', fontFamily: fonts.semibold, fontSize: 11, letterSpacing: tracking.overline },
    heroTotal: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 28, marginTop: 4, letterSpacing: tracking.display },
    heroTagRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
    heroTag: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill,
      paddingHorizontal: 10, paddingVertical: 5,
    },
    heroTagText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 11 },
    heroIconWrap: { width: 70, alignItems: 'flex-end' },

    // Search
    searchWrap: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      marginHorizontal: 14, marginTop: 12, marginBottom: 8,
      backgroundColor: t.surface, borderRadius: radius.lg,
      paddingHorizontal: 14, paddingVertical: 11,
      borderWidth: 1, borderColor: t.border, ...shadow.soft,
    },
    searchInput: { flex: 1, color: t.text, fontFamily: fonts.regular, fontSize: 14 },

    // Filters
    filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, marginBottom: 12 },
    filterChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: radius.pill, backgroundColor: t.surface,
      borderWidth: 1.5, borderColor: t.border,
    },
    filterChipActive: { backgroundColor: t.primary, borderColor: t.primary },
    filterText: { fontFamily: fonts.bold, fontSize: 12, color: t.muted },
    filterTextActive: { color: '#fff' },
    filterCount: { flex: 1, textAlign: 'right', color: t.muted, fontFamily: fonts.medium, fontSize: 12 },

    // Card
    card: {
      backgroundColor: t.surface,
      borderRadius: radius.xl,
      borderWidth: 1, borderColor: t.border,
      paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12,
      ...shadow.soft,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },

    // Avatar
    avatar: {
      width: 50, height: 50, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    },
    avatarText: { fontFamily: fonts.displayBold, fontSize: 18 },
    rankBadge: {
      position: 'absolute', top: -4, right: -4,
      minWidth: 18, height: 18, borderRadius: 9,
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 4, borderWidth: 2, borderColor: t.surface,
    },
    rankText: { color: '#fff', fontFamily: fonts.bold, fontSize: 9 },

    // Name + meta
    nama: { fontFamily: fonts.bold, color: t.text, fontSize: 15 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
    alamat: { color: t.muted, fontSize: 11.5, fontFamily: fonts.regular, flex: 1 },

    // Amount
    amountWrap: { alignItems: 'flex-end', gap: 2 },
    grand: { fontFamily: fonts.displayBold, fontSize: 16 },

    // Bottom chips
    infoChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    infoChipText: { color: t.muted, fontSize: 11, fontFamily: fonts.regular },
    daysBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 3,
      paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill,
    },
    daysText: { fontFamily: fonts.extrabold, fontSize: 10 },

    // WA
    waBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#86EFAC',
      borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    },
    waBtnText: { color: '#16A34A', fontFamily: fonts.bold, fontSize: 11 },
  });
