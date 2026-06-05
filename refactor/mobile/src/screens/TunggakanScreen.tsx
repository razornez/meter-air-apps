import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiTunggakan } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { TunggakanItem, TunggakanResponse } from '../types';
import { buildWAMessage, formatPhoneWA, openWA } from '../utils/whatsapp';
import { fonts, formatRupiah, gradients, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Tunggakan'>;
const LIMIT = 50;

export default function TunggakanScreen({ navigation }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const s = useMemo(() => createStyles(t), [t]);
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

  if (loading && !res) return <Loading label={tr('tunggakan_loading')} />;
  if (error && !res) return <ErrorState message={error} onRetry={() => load(1)} />;
  if (!res) return null;

  const canLoadMore = items.length < res.total;

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

      <FlatList keyboardShouldPersistTaps="handled"
        data={items}
        keyExtractor={(it) => String(it.customerId)}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 14, gap: 10 }}
        ListEmptyComponent={<EmptyState label={tr('tunggakan_empty')} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FakturList', { customerId: item.customerId })}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.nama} numberOfLines={1}>{item.nama ?? `ID ${item.customerId}`}</Text>
              <Text style={s.meta}>{tr('tunggakan_item_meta', { count: item.jumlahFaktur, days: item.hariTelatMax })}</Text>
              {!!item.alamat && <Text style={s.alamat} numberOfLines={1}>{item.alamat}</Text>}
            </View>
            <View style={s.right}>
              <Text style={s.grand}>{formatRupiah(item.grandTotal)}</Text>
              {item.totalDenda > 0 && <Text style={s.denda}>denda {formatRupiah(item.totalDenda)}</Text>}
              {/* Tombol WA — hanya tampil bila ada nomor HP valid */}
              {!!formatPhoneWA(item.telp) && (
                <TouchableOpacity
                  style={s.waSmall}
                  onPress={async (e) => {
                    e.stopPropagation?.();
                    const msg = buildWAMessage({
                      namaCustomer: item.nama,
                      noFaktur: `${item.jumlahFaktur} faktur`,
                      total: item.grandTotal,
                      tglJatuhTempo: null,
                    });
                    await openWA(item.telp, msg);
                  }}
                >
                  <Text style={s.waSmallText}>{tr('tunggakan_wa_button')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && canLoadMore) load(page + 1);
        }}
        ListFooterComponent={loading && items.length > 0 ? <Text style={s.footer}>{tr('tunggakan_loading_more')}</Text> : null}
      />
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    hero: { margin: 14, padding: 20, borderRadius: radius.xl },
    heroLabel: { color: 'rgba(255,255,255,0.9)', fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: tracking.overline },
    heroTotal: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 32, marginTop: 6, letterSpacing: tracking.display },
    heroPills: { flexDirection: 'row', gap: 8, marginTop: 16 },
    heroPill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
    heroPillValue: { color: '#fff', fontFamily: fonts.bold, fontSize: 13 },
    heroPillLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.medium, fontSize: 10.5, marginTop: 2 },
    row: {
      flexDirection: 'row',
      backgroundColor: t.surface,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    nama: { fontFamily: fonts.bold, color: t.text, fontSize: 15 },
    meta: { color: t.muted, fontSize: 12, marginTop: 2, fontFamily: fonts.regular },
    alamat: { color: t.muted, fontSize: 11, marginTop: 1, fontFamily: fonts.regular },
    right: { alignItems: 'flex-end', justifyContent: 'center', marginLeft: 8 },
    grand: { color: t.danger, fontFamily: fonts.displayBold, fontSize: 15 },
    denda: { color: t.warning, fontSize: 11, marginTop: 2, fontFamily: fonts.medium },
    waSmall: {
      marginTop: 6,
      backgroundColor: '#25D366',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      alignItems: 'center',
    },
    waSmallText: { color: '#fff', fontFamily: fonts.bold, fontSize: 12 },
    footer: { textAlign: 'center', padding: 14, color: t.muted, fontFamily: fonts.regular },
  });
