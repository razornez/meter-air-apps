import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
const LIMIT = 200; // ambil banyak agar search client-side bekerja

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

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiTunggakan(1, LIMIT);
      setRes(data);
      setItems(data.data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
    <View style={s.container}>
      <LinearGradient colors={gradients.coral} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadow.glow]}>
        <Text style={s.heroLabel}>{tr('tunggakan_hero_label')}</Text>
        <Text style={s.heroTotal}>{formatRupiah(res.grandTotal)}</Text>
        <View style={s.heroPills}>
          <View style={s.heroPill}>
            <Text style={s.heroPillValue}>{res.total}</Text>
            <Text style={s.heroPillLabel}>{tr('tunggakan_pill_arrears')}</Text>
          </View>
          <View style={s.heroPill}>
            <Text style={s.heroPillValue}>{formatRupiah(res.totalTagihan)}</Text>
            <Text style={s.heroPillLabel}>{tr('tunggakan_pill_billing')}</Text>
          </View>
          <View style={s.heroPill}>
            <Text style={s.heroPillValue}>{formatRupiah(res.totalDenda)}</Text>
            <Text style={s.heroPillLabel}>{tr('tunggakan_pill_fine')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search bar */}
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
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={t.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
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

      <FlatList
        keyboardShouldPersistTaps="handled"
        data={filtered}
        keyExtractor={(it) => String(it.customerId)}
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingHorizontal: 14, paddingBottom: 20, gap: 10 }}
        ListEmptyComponent={<EmptyState label={search ? tr('tunggakan_search_empty') : tr('tunggakan_empty')} illustration="arrears" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FakturList', { customerId: item.customerId })}
          >
            {/* Left: severity bar */}
            <View style={[s.severityBar, { backgroundColor: item.hariTelatMax > 90 ? t.danger : item.hariTelatMax > 30 ? t.warning : t.accent }]} />

            <View style={{ flex: 1, paddingLeft: 2 }}>
              <Text style={s.nama} numberOfLines={1}>{item.nama ?? `ID ${item.customerId}`}</Text>
              <Text style={s.meta}>{tr('tunggakan_item_meta', { count: item.jumlahFaktur, days: item.hariTelatMax })}</Text>
              {!!item.alamat && <Text style={s.alamat} numberOfLines={1}>{item.alamat}</Text>}
            </View>

            <View style={s.right}>
              <Text style={s.grand}>{formatRupiah(item.grandTotal)}</Text>
              {item.totalDenda > 0 && (
                <View style={s.dendaBadge}>
                  <Text style={s.denda}>{tr('tunggakan_fine_label')} {formatRupiah(item.totalDenda)}</Text>
                </View>
              )}
              {!!formatPhoneWA(item.telp) && (
                <TouchableOpacity
                  style={s.waSmall}
                  activeOpacity={0.85}
                  onPress={async (e) => {
                    e.stopPropagation?.();
                    const msg = buildWAMessage({ namaCustomer: item.nama, noFaktur: `${item.jumlahFaktur} faktur`, total: item.grandTotal, tglJatuhTempo: null });
                    await openWA(item.telp, msg);
                  }}
                >
                  <MaterialCommunityIcons name="whatsapp" size={14} color="#16A34A" />
                  <Text style={s.waSmallText}>{tr('tunggakan_wa_button')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    hero: { margin: 14, marginBottom: 0, padding: 18, borderRadius: radius.xl },
    heroLabel: { color: 'rgba(255,255,255,0.9)', fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: tracking.overline },
    heroTotal: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 30, marginTop: 4, letterSpacing: tracking.display },
    heroPills: { flexDirection: 'row', gap: 8, marginTop: 14 },
    heroPill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 8, alignItems: 'center' },
    heroPillValue: { color: '#fff', fontFamily: fonts.bold, fontSize: 12 },
    heroPillLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.medium, fontSize: 10, marginTop: 2 },

    searchWrap: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      margin: 14, marginBottom: 8,
      backgroundColor: t.surface, borderRadius: radius.md,
      paddingHorizontal: 12, paddingVertical: 10,
      borderWidth: 1, borderColor: t.border, ...shadow.soft,
    },
    searchInput: { flex: 1, color: t.text, fontFamily: fonts.regular, fontSize: 14 },

    filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, marginBottom: 10 },
    filterChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: radius.pill, backgroundColor: t.surface,
      borderWidth: 1.5, borderColor: t.border,
    },
    filterChipActive: { backgroundColor: t.primary, borderColor: t.primary },
    filterText: { fontFamily: fonts.bold, fontSize: 12, color: t.muted },
    filterTextActive: { color: '#fff' },
    filterCount: { flex: 1, textAlign: 'right', color: t.muted, fontFamily: fonts.medium, fontSize: 12 },

    row: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.surface, borderRadius: radius.lg,
      borderWidth: 1, borderColor: t.border,
      overflow: 'hidden', paddingVertical: 12, paddingRight: 12,
      ...shadow.soft,
    },
    severityBar: { width: 4, alignSelf: 'stretch', marginRight: 10 },
    nama: { fontFamily: fonts.bold, color: t.text, fontSize: 15 },
    meta: { color: t.muted, fontSize: 12, marginTop: 2, fontFamily: fonts.regular },
    alamat: { color: t.muted, fontSize: 11, marginTop: 1, fontFamily: fonts.regular },
    right: { alignItems: 'flex-end', justifyContent: 'center', marginLeft: 8, gap: 4 },
    grand: { color: t.danger, fontFamily: fonts.displayBold, fontSize: 15 },
    dendaBadge: { backgroundColor: pastels.peach.bg, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 2 },
    denda: { color: pastels.peach.fg, fontSize: 10, fontFamily: fonts.bold },
    waSmall: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#86EFAC',
      borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
    },
    waSmallText: { color: '#16A34A', fontFamily: fonts.bold, fontSize: 11 },
  });
