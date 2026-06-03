import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiTunggakan } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { TunggakanItem, TunggakanResponse } from '../types';
import { fonts, formatRupiah, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Tunggakan'>;
const LIMIT = 50;

export default function TunggakanScreen({ navigation }: Props) {
  const t = useTheme();
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

  if (loading && !res) return <Loading label="Memuat tunggakan…" />;
  if (error && !res) return <ErrorState message={error} onRetry={() => load(1)} />;
  if (!res) return null;

  const canLoadMore = items.length < res.total;

  return (
    <View style={s.container}>
      <View style={s.summary}>
        <Text style={s.summaryTitle}>Ringkasan Tunggakan</Text>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Pelanggan menunggak</Text>
          <Text style={s.summaryValue}>{res.total} orang</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Total tagihan</Text>
          <Text style={s.summaryValue}>{formatRupiah(res.totalTagihan)}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Total denda</Text>
          <Text style={[s.summaryValue, { color: t.danger }]}>{formatRupiah(res.totalDenda)}</Text>
        </View>
        <View style={[s.summaryRow, s.grandRow]}>
          <Text style={s.grandLabel}>Grand total</Text>
          <Text style={s.grandValue}>{formatRupiah(res.grandTotal)}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.customerId)}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 14, gap: 10 }}
        ListEmptyComponent={<EmptyState label="Tidak ada tunggakan 🎉" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FakturList', { customerId: item.customerId })}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.nama} numberOfLines={1}>{item.nama ?? `ID ${item.customerId}`}</Text>
              <Text style={s.meta}>{item.jumlahFaktur} faktur · telat {item.hariTelatMax} hari</Text>
              {!!item.alamat && <Text style={s.alamat} numberOfLines={1}>{item.alamat}</Text>}
            </View>
            <View style={s.right}>
              <Text style={s.grand}>{formatRupiah(item.grandTotal)}</Text>
              {item.totalDenda > 0 && <Text style={s.denda}>denda {formatRupiah(item.totalDenda)}</Text>}
            </View>
          </TouchableOpacity>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && canLoadMore) load(page + 1);
        }}
        ListFooterComponent={loading && items.length > 0 ? <Text style={s.footer}>Memuat…</Text> : null}
      />
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    summary: {
      backgroundColor: t.surface,
      margin: 14,
      padding: 18,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    summaryTitle: { fontFamily: fonts.displayBold, color: t.text, fontSize: 17, marginBottom: 8, letterSpacing: tracking.tight },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    summaryLabel: { color: t.muted, fontSize: 13, fontFamily: fonts.regular },
    summaryValue: { color: t.text, fontFamily: fonts.bold, fontSize: 13 },
    grandRow: { borderTopWidth: 1, borderTopColor: t.border, marginTop: 8, paddingTop: 10 },
    grandLabel: { color: t.text, fontFamily: fonts.bold, fontSize: 15 },
    grandValue: { color: t.danger, fontFamily: fonts.displayBold, fontSize: 17 },
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
    footer: { textAlign: 'center', padding: 14, color: t.muted, fontFamily: fonts.regular },
  });
