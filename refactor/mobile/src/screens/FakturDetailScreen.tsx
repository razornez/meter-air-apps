import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiFakturDetail, apiGetConfig, apiSetFakturLunas } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { AppConfig, FakturDetail } from '../types';
import { fonts, formatRupiah, pastels, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ErrorState, Loading } from '../components/ScreenStates';
import { buildFakturHtml } from '../utils/fakturHtml';
import { buildWAMessage, openWA } from '../utils/whatsapp';

type Props = NativeStackScreenProps<RootStackParamList, 'FakturDetail'>;

export default function FakturDetailScreen({ route, navigation }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
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
    Alert.alert(
      toLunas ? tr('faktur_detail_alert_mark_paid_title') : tr('faktur_detail_alert_cancel_paid_title'),
      tr('faktur_detail_alert_status_message', { noFaktur: data.noFaktur }),
      [
        { text: tr('faktur_detail_alert_cancel'), style: 'cancel' },
        {
          text: tr('faktur_detail_alert_confirm'),
          onPress: async () => {
            setActing(true);
            try {
              await apiSetFakturLunas(noFaktur, toLunas);
              await load();
            } catch (e) {
              Alert.alert(tr('faktur_detail_alert_failed'), apiErrorMessage(e));
            } finally {
              setActing(false);
            }
          },
        },
      ],
    );
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
        tr('faktur_detail_alert_wa_failed_title'),
        phone
          ? `Nomor "${phone}" tidak dapat diproses. Pastikan WhatsApp terpasang.`
          : tr('faktur_detail_alert_wa_no_phone'),
      );
    }
  }

  async function onPrintOrShare(share: boolean) {
    if (!data) return;
    setActing(true);
    try {
      const cfg = config ?? ({ perusahaan: 'Meter Air', alamat: '', telp: '' } as AppConfig);
      const html = buildFakturHtml(data, cfg);

      // Step 1: Generate PDF ke temp file
      const { uri: tmpUri } = await Print.printToFileAsync({ html });

      // Step 2: Copy ke cache dir dengan nama yang jelas
      const safeName = (data.noFaktur ?? 'faktur').replace(/\//g, '-');
      const destUri = `${FileSystem.cacheDirectory}Faktur-${safeName}.pdf`;
      await FileSystem.copyAsync({ from: tmpUri, to: destUri });

      if (share) {
        // Bagikan — native share sheet (WhatsApp, email, Drive, dll)
        await Sharing.shareAsync(destUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Faktur ${data.noFaktur}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        // Cetak — iOS: print dialog langsung | Android: share sheet (pilih Print / PDF viewer)
        if (Platform.OS === 'ios') {
          await Print.printAsync({ uri: destUri });
        } else {
          // Android: Print.printAsync sering gagal tanpa printer service,
          // pakai share sheet agar user bisa buka di PDF viewer / print dari sana
          await Sharing.shareAsync(destUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Cetak Faktur ${data.noFaktur}`,
            UTI: 'com.adobe.pdf',
          });
        }
      }
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      Alert.alert('Gagal', `Tidak dapat memproses PDF.\n\n${msg}`);
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? tr('faktur_detail_error_no_data')} onRetry={load} />;

  return (
    <ScrollView keyboardShouldPersistTaps="handled" style={s.container} contentContainerStyle={{ padding: 16 }}>
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadow.glow]}>
        <Text style={s.heroLabel}>{tr('faktur_detail_hero_label')}</Text>
        <Text style={s.heroTotal}>{formatRupiah(data.total ?? 0)}</Text>
        <View style={s.heroRow}>
          <Text style={s.heroFaktur} numberOfLines={1}>{data.noFaktur}</Text>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>{data.isLunas ? tr('faktur_detail_badge_paid') : tr('faktur_detail_badge_unpaid')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Circular quick-action chips ── */}
      <View style={s.chipRow}>
        {/* Tandai / Batal Lunas */}
        <TouchableOpacity style={s.chip} activeOpacity={0.8} onPress={onToggleLunas} disabled={acting}>
          <View style={[s.chipCircle, { backgroundColor: data.isLunas ? pastels.peach.bg : pastels.mint.bg }]}>
            <Ionicons
              name={data.isLunas ? 'close-circle-outline' : 'checkmark-done-circle-outline'}
              size={28}
              color={data.isLunas ? pastels.peach.fg : pastels.mint.fg}
            />
          </View>
          <Text style={s.chipLabel} numberOfLines={2}>
            {data.isLunas ? tr('faktur_detail_button_cancel_paid') : tr('faktur_detail_button_mark_paid')}
          </Text>
        </TouchableOpacity>

        {/* Cetak */}
        <TouchableOpacity style={s.chip} activeOpacity={0.8} onPress={() => onPrintOrShare(false)} disabled={acting}>
          <View style={[s.chipCircle, { backgroundColor: pastels.lavender.bg }]}>
            <Ionicons name="print-outline" size={26} color={pastels.lavender.fg} />
          </View>
          <Text style={s.chipLabel}>{tr('faktur_detail_button_print')}</Text>
        </TouchableOpacity>

        {/* Bagikan */}
        <TouchableOpacity style={s.chip} activeOpacity={0.8} onPress={() => onPrintOrShare(true)} disabled={acting}>
          <View style={[s.chipCircle, { backgroundColor: pastels.sky.bg }]}>
            <Ionicons name="share-social-outline" size={26} color={pastels.sky.fg} />
          </View>
          <Text style={s.chipLabel}>{tr('faktur_detail_button_share')}</Text>
        </TouchableOpacity>

        {/* Spacer chip (optional 4th slot — kosong agar grid rapi) */}
        <View style={s.chip} />
      </View>

      {/* ── Bayar Sekarang — hanya bila belum lunas ── */}
      {!data.isLunas && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={openPayment}
          disabled={acting}
          style={[acting && s.dimmed, { marginBottom: 10 }]}
        >
          <LinearGradient
            colors={t.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[s.payBtn, shadow.glow]}
          >
            <View style={s.payIconWrap}>
              <Ionicons name="wallet-outline" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.payBtnLabel}>Bayar Sekarang</Text>
              <Text style={s.payBtnAmount}>{formatRupiah(data.total ?? 0)}</Text>
            </View>
            <View style={s.payChevron}>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* ── WA Reminder — hanya bila belum lunas ── */}
      {!data.isLunas && (
        <TouchableOpacity
          style={[s.waBtn, acting && s.dimmed]}
          activeOpacity={0.88}
          onPress={onSendWA}
          disabled={acting}
        >
          <View style={s.waIconWrap}>
            <MaterialCommunityIcons name="whatsapp" size={26} color="#22C55E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.waBtnTitle}>Reminder Tagihan</Text>
            <Text style={s.waBtnSub}>Kirim via WhatsApp</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#86EFAC" />
        </TouchableOpacity>
      )}

      {acting && (
        <View style={s.actingRow}>
          <ActivityIndicator color={t.primary} size="small" />
          <Text style={s.muted}>{tr('faktur_detail_processing')}</Text>
        </View>
      )}

      {/* Receipt / struk card */}
      <View style={s.receipt}>
        <View style={[s.rNotch, s.rNotchL]} />
        <View style={[s.rNotch, s.rNotchR]} />

        {data.pelanggan && (
          <>
            <Text style={s.rTitle}>{tr('faktur_detail_receipt_section_customer')}</Text>
            <Text style={s.custName}>{data.pelanggan.nama}</Text>
            <Text style={s.muted}>ID {data.pelanggan.id} · Tipe {data.pelanggan.tipe ?? '-'}</Text>
            {!!data.pelanggan.alamat && <Text style={s.muted}>{data.pelanggan.alamat}</Text>}
            <DashedLine color={t.border} />
          </>
        )}

        <Text style={s.rTitle}>{tr('faktur_detail_receipt_section_detail')}</Text>
        {data.items.map((it, i) => (
          <Row s={s} key={i} label={`${it.produk ?? 'Item'} (${it.quantity ?? 0} m³)`} value={formatRupiah(it.total ?? 0)} />
        ))}
        <View style={{ height: 4 }} />
        <Row s={s} label={tr('faktur_detail_row_subtotal')} value={formatRupiah(data.subtotal ?? 0)} />
        <Row s={s} label={tr('faktur_detail_row_charge')} value={formatRupiah(data.beban ?? 0)} />
        {!!data.denda && <Row s={s} label={tr('faktur_detail_row_fine')} value={formatRupiah(data.denda)} />}
        <DashedLine color={t.border} />
        <Row s={s} label={tr('faktur_detail_row_total')} value={formatRupiah(data.total ?? 0)} bold />
        <DashedLine color={t.border} />

        <Text style={s.rTitle}>{tr('faktur_detail_receipt_section_info')}</Text>
        <Row s={s} label={tr('faktur_detail_row_date')} value={data.tanggal ? data.tanggal.slice(0, 10) : '-'} />
        <Row s={s} label={tr('faktur_detail_row_due_date')} value={data.tglJatuhTempo ?? '-'} />
        {data.meter.map((m, i) => (
          <Row s={s} key={i} label={tr('faktur_detail_row_meter')} value={String(m.meter)} />
        ))}
        {!!data.catatan && <Row s={s} label={tr('faktur_detail_row_note')} value={data.catatan} />}

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
    dimmed: { opacity: 0.45 },
    actingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },

    // Circular quick-action chips (share-sheet style)
    chipRow: {
      flexDirection: 'row', justifyContent: 'space-around',
      backgroundColor: t.surface, borderRadius: radius.lg,
      paddingVertical: 18, paddingHorizontal: 8,
      marginBottom: 12, borderWidth: 1, borderColor: t.border,
      ...shadow.soft,
    },
    chip: { alignItems: 'center', gap: 8, flex: 1 },
    chipCircle: {
      width: 58, height: 58, borderRadius: 29,
      alignItems: 'center', justifyContent: 'center',
    },
    chipLabel: {
      color: t.text, fontFamily: fonts.semibold, fontSize: 11,
      textAlign: 'center', maxWidth: 72,
    },

    // Bayar Sekarang — hero gradient card
    payBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      borderRadius: radius.xl, paddingVertical: 18, paddingHorizontal: 20,
    },
    payIconWrap: {
      width: 48, height: 48, borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    payBtnLabel: { color: 'rgba(255,255,255,0.82)', fontFamily: fonts.semibold, fontSize: 12 },
    payBtnAmount: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 20, marginTop: 2 },
    payChevron: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center', justifyContent: 'center',
    },

    // WA Reminder — pastel green row
    waBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: '#F0FDF4', borderWidth: 1.5, borderColor: '#BBF7D0',
      borderRadius: radius.xl, paddingVertical: 16, paddingHorizontal: 18,
      marginBottom: 12, ...shadow.soft,
    },
    waIconWrap: {
      width: 48, height: 48, borderRadius: 18,
      backgroundColor: '#DCFCE7',
      alignItems: 'center', justifyContent: 'center',
    },
    waBtnTitle: { color: '#15803D', fontFamily: fonts.extrabold, fontSize: 15 },
    waBtnSub:   { color: '#4ADE80', fontFamily: fonts.medium, fontSize: 12, marginTop: 1 },
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
