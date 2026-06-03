import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiFakturDetail, apiGetConfig, apiSetFakturLunas } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { AppConfig, FakturDetail } from '../types';
import { fonts, formatRupiah, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ErrorState, Loading } from '../components/ScreenStates';
import { buildFakturHtml } from '../utils/fakturHtml';

type Props = NativeStackScreenProps<RootStackParamList, 'FakturDetail'>;

export default function FakturDetailScreen({ route }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { noFaktur } = route.params;
  const [data, setData] = useState<FakturDetail | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, c] = await Promise.all([apiFakturDetail(noFaktur), apiGetConfig()]);
      setData(d);
      setConfig(c);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [noFaktur]);

  useEffect(() => {
    load();
  }, [load]);

  function onToggleLunas() {
    if (!data) return;
    const toLunas = !data.isLunas;
    Alert.alert(toLunas ? 'Tandai Lunas' : 'Batal Lunas', `Ubah status faktur ${data.noFaktur}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya',
        onPress: async () => {
          setActing(true);
          try {
            await apiSetFakturLunas(noFaktur, toLunas);
            await load();
          } catch (e) {
            Alert.alert('Gagal', apiErrorMessage(e));
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  }

  async function onPrintOrShare(share: boolean) {
    if (!data || !config) return;
    setActing(true);
    try {
      const html = buildFakturHtml(data, config);
      if (share) {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
        } else {
          Alert.alert('Berbagi tidak tersedia di perangkat ini');
        }
      } else {
        await Print.printAsync({ html });
      }
    } catch (e) {
      Alert.alert('Gagal membuat PDF', apiErrorMessage(e));
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Data tidak tersedia'} onRetry={load} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <View style={s.headerCard}>
        <Text style={s.faktur}>{data.noFaktur}</Text>
        <View style={[s.statusBadge, { backgroundColor: (data.isLunas ? t.success : t.danger) + '22' }]}>
          <Text style={{ color: data.isLunas ? t.success : t.danger, fontFamily: fonts.extrabold, fontSize: 12 }}>
            {data.isLunas ? 'LUNAS' : 'BELUM LUNAS'}
          </Text>
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.9} onPress={onToggleLunas} disabled={acting}>
          <LinearGradient
            colors={(data.isLunas ? [t.warning, t.warning] : [t.success, t.success]) as readonly [string, string]}
            style={s.actionBtn}
          >
            <Text style={s.actionText}>{data.isLunas ? 'Batal Lunas' : '✓ Tandai Lunas'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.actionGhost]} onPress={() => onPrintOrShare(false)} disabled={acting}>
          <Text style={s.actionGhostText}>🖨 Cetak</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.actionGhost]} onPress={() => onPrintOrShare(true)} disabled={acting}>
          <Text style={s.actionGhostText}>📤 Bagikan</Text>
        </TouchableOpacity>
      </View>
      {acting && (
        <View style={s.actingRow}>
          <ActivityIndicator color={t.primary} />
          <Text style={s.muted}> Memproses…</Text>
        </View>
      )}

      {data.pelanggan && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Pelanggan</Text>
          <Text style={s.custName}>{data.pelanggan.nama}</Text>
          <Text style={s.muted}>ID {data.pelanggan.id} · Tipe {data.pelanggan.tipe ?? '-'}</Text>
          {!!data.pelanggan.alamat && <Text style={s.muted}>{data.pelanggan.alamat}</Text>}
        </View>
      )}

      <View style={s.card}>
        <Text style={s.cardTitle}>Rincian</Text>
        {data.items.map((it, i) => (
          <Row s={s} key={i} label={`${it.produk ?? 'Item'} (${it.quantity ?? 0} m³)`} value={formatRupiah(it.total ?? 0)} />
        ))}
        <View style={s.sep} />
        <Row s={s} label="Subtotal" value={formatRupiah(data.subtotal ?? 0)} />
        <Row s={s} label="Beban" value={formatRupiah(data.beban ?? 0)} />
        {!!data.denda && <Row s={s} label="Denda" value={formatRupiah(data.denda)} />}
        <Row s={s} label="Total" value={formatRupiah(data.total ?? 0)} bold />
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Informasi</Text>
        <Row s={s} label="Tanggal" value={data.tanggal ? data.tanggal.slice(0, 10) : '-'} />
        <Row s={s} label="Jatuh tempo" value={data.tglJatuhTempo ?? '-'} />
        {data.meter.map((m, i) => (
          <Row s={s} key={i} label="Angka meter" value={String(m.meter)} />
        ))}
        {!!data.catatan && <Row s={s} label="Catatan" value={data.catatan} />}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function Row({ s, label, value, bold }: { s: ReturnType<typeof createStyles>; label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, bold && s.bold]}>{label}</Text>
      <Text style={[s.rowValue, bold && s.bold]}>{value}</Text>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    headerCard: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    faktur: { fontSize: 17, fontFamily: fonts.displayBold, color: t.text, letterSpacing: tracking.tight },
    statusBadge: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill },
    actions: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    actionBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
    actionText: { color: '#fff', fontFamily: fonts.bold, fontSize: 13 },
    actionGhost: { borderWidth: 1.5, borderColor: t.primary, backgroundColor: 'transparent' },
    actionGhostText: { color: t.primary, fontFamily: fonts.bold, fontSize: 13 },
    actingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    card: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    cardTitle: { fontFamily: fonts.bold, color: t.text, marginBottom: 8, fontSize: 15 },
    custName: { fontSize: 16, fontFamily: fonts.bold, color: t.text },
    muted: { color: t.muted, marginTop: 2, fontFamily: fonts.regular },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    rowLabel: { color: t.muted, flex: 1, fontSize: 13, fontFamily: fonts.regular },
    rowValue: { color: t.text, fontFamily: fonts.semibold, fontSize: 13 },
    bold: { color: t.text, fontFamily: fonts.extrabold, fontSize: 15 },
    sep: { height: 1, backgroundColor: t.border, marginVertical: 8 },
  });
