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
import { buildWAMessage, openWA } from '../utils/whatsapp';

type Props = NativeStackScreenProps<RootStackParamList, 'FakturDetail'>;

export default function FakturDetailScreen({ route, navigation }: Props) {
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

  // Reload data setiap kali layar kembali ke-focus (mis. balik dari layar bayar)
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

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

  function openPayment() {
    if (!data?.noFaktur) return;
    navigation.navigate('PaymentSelect', {
      noFaktur: data.noFaktur,
      amount: data.total ?? 0,
      customerName: data.pelanggan?.nama ?? null,
    });
  }

  async function onSendWA() {
    if (!data) return;
    const phone = data.pelanggan?.telp;
    const msg = buildWAMessage({
      namaCustomer: data.pelanggan?.nama ?? null,
      noFaktur: data.noFaktur,
      total: data.total ?? 0,
      tglJatuhTempo: data.tglJatuhTempo,
      namaPerusahaan: config?.perusahaan,
    });
    const ok = await openWA(phone, msg);
    if (!ok) {
      Alert.alert(
        'WhatsApp tidak bisa dibuka',
        phone
          ? `Nomor "${phone}" tidak dapat diproses. Pastikan WhatsApp terpasang.`
          : 'Pelanggan ini tidak punya nomor HP yang terdaftar.',
      );
    }
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
    <ScrollView keyboardShouldPersistTaps="handled" style={s.container} contentContainerStyle={{ padding: 16 }}>
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadow.glow]}>
        <Text style={s.heroLabel}>TOTAL TAGIHAN</Text>
        <Text style={s.heroTotal}>{formatRupiah(data.total ?? 0)}</Text>
        <View style={s.heroRow}>
          <Text style={s.heroFaktur} numberOfLines={1}>{data.noFaktur}</Text>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>{data.isLunas ? '✓ LUNAS' : 'BELUM LUNAS'}</Text>
          </View>
        </View>
      </LinearGradient>

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
      {/* Tombol Pilih Metode Bayar — hanya bila belum lunas */}
      {!data.isLunas && (
        <TouchableOpacity
          style={[s.payBtn, acting && { opacity: 0.5 }]}
          onPress={openPayment}
          disabled={acting}
        >
          <Text style={s.payBtnText}>💳 Bayar Sekarang</Text>
        </TouchableOpacity>
      )}

      {/* Tombol WA — hanya tampil bila belum lunas (reminder tagihan) */}
      {!data.isLunas && (
        <TouchableOpacity
          style={[s.waBtn, acting && { opacity: 0.5 }]}
          onPress={onSendWA}
          disabled={acting}
        >
          <Text style={s.waBtnText}>📲 Kirim Reminder via WhatsApp</Text>
        </TouchableOpacity>
      )}
      {acting && (
        <View style={s.actingRow}>
          <ActivityIndicator color={t.primary} />
          <Text style={s.muted}> Memproses…</Text>
        </View>
      )}

      {/* Receipt / struk card */}
      <View style={s.receipt}>
        <View style={[s.rNotch, s.rNotchL]} />
        <View style={[s.rNotch, s.rNotchR]} />

        {data.pelanggan && (
          <>
            <Text style={s.rTitle}>PELANGGAN</Text>
            <Text style={s.custName}>{data.pelanggan.nama}</Text>
            <Text style={s.muted}>ID {data.pelanggan.id} · Tipe {data.pelanggan.tipe ?? '-'}</Text>
            {!!data.pelanggan.alamat && <Text style={s.muted}>{data.pelanggan.alamat}</Text>}
            <DashedLine color={t.border} />
          </>
        )}

        <Text style={s.rTitle}>RINCIAN</Text>
        {data.items.map((it, i) => (
          <Row s={s} key={i} label={`${it.produk ?? 'Item'} (${it.quantity ?? 0} m³)`} value={formatRupiah(it.total ?? 0)} />
        ))}
        <View style={{ height: 4 }} />
        <Row s={s} label="Subtotal" value={formatRupiah(data.subtotal ?? 0)} />
        <Row s={s} label="Beban" value={formatRupiah(data.beban ?? 0)} />
        {!!data.denda && <Row s={s} label="Denda" value={formatRupiah(data.denda)} />}
        <DashedLine color={t.border} />
        <Row s={s} label="TOTAL" value={formatRupiah(data.total ?? 0)} bold />
        <DashedLine color={t.border} />

        <Text style={s.rTitle}>INFORMASI</Text>
        <Row s={s} label="Tanggal" value={data.tanggal ? data.tanggal.slice(0, 10) : '-'} />
        <Row s={s} label="Jatuh tempo" value={data.tglJatuhTempo ?? '-'} />
        {data.meter.map((m, i) => (
          <Row s={s} key={i} label="Angka meter" value={String(m.meter)} />
        ))}
        {!!data.catatan && <Row s={s} label="Catatan" value={data.catatan} />}

        <View style={s.barcode}>
          {Array.from({ length: 38 }).map((_, i) => (
            <View key={i} style={[s.bar, { width: i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2 }]} />
          ))}
        </View>
        <Text style={s.barcodeText}>{data.noFaktur}</Text>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function DashedLine({ color }: { color: string }) {
  return (
    <View style={dlStyles.wrap}>
      {Array.from({ length: 44 }).map((_, i) => (
        <View key={i} style={[dlStyles.dash, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const dlStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', overflow: 'hidden', height: 2, marginVertical: 12 },
  dash: { width: 6, height: 2, marginRight: 4, borderRadius: 1 },
});

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
    receipt: { backgroundColor: t.surface, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: t.border, marginTop: 2, ...shadow.soft },
    rNotch: { position: 'absolute', top: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: t.bg },
    rNotchL: { left: -9 },
    rNotchR: { right: -9 },
    rTitle: { fontFamily: fonts.extrabold, color: t.muted, fontSize: 11, letterSpacing: tracking.overline, marginBottom: 8, marginTop: 4 },
    barcode: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, marginTop: 18 },
    bar: { height: '100%', backgroundColor: t.text, marginRight: 2, opacity: 0.82 },
    barcodeText: { textAlign: 'center', color: t.muted, fontFamily: fonts.medium, fontSize: 11, marginTop: 6, letterSpacing: 2 },
    hero: { borderRadius: radius.xl, padding: 20, marginBottom: 14 },
    heroLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: tracking.overline },
    heroTotal: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 34, marginTop: 4, letterSpacing: tracking.display },
    heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
    heroFaktur: { color: 'rgba(255,255,255,0.92)', fontFamily: fonts.semibold, fontSize: 13, flex: 1 },
    heroBadge: { backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill, marginLeft: 8 },
    heroBadgeText: { color: '#fff', fontFamily: fonts.extrabold, fontSize: 11, letterSpacing: 0.4 },
    actions: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    actionBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
    actionText: { color: '#fff', fontFamily: fonts.bold, fontSize: 13 },
    actionGhost: { borderWidth: 1.5, borderColor: t.primary, backgroundColor: 'transparent' },
    actionGhostText: { color: t.primary, fontFamily: fonts.bold, fontSize: 13 },
    actingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    payBtn: {
      backgroundColor: t.primary,
      borderRadius: radius.sm,
      paddingVertical: 15,
      alignItems: 'center',
      marginBottom: 10,
    },
    payBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 16 },
    waBtn: {
      backgroundColor: '#25D366', // warna hijau WhatsApp
      borderRadius: radius.sm,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 12,
    },
    waBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
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
