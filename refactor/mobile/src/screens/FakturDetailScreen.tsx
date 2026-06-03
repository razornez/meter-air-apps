import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  apiFakturDetail,
  apiGetConfig,
  apiSetFakturLunas,
} from '../api/services';
import { apiErrorMessage } from '../api/client';
import { AppConfig, FakturDetail } from '../types';
import { colors, formatRupiah } from '../theme';
import { ErrorState, Loading } from '../components/ScreenStates';
import { buildFakturHtml } from '../utils/fakturHtml';

type Props = NativeStackScreenProps<RootStackParamList, 'FakturDetail'>;

export default function FakturDetailScreen({ route }: Props) {
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

  // S3-02 — tandai / batal lunas dengan konfirmasi.
  function onToggleLunas() {
    if (!data) return;
    const toLunas = !data.isLunas;
    Alert.alert(
      toLunas ? 'Tandai Lunas' : 'Batal Lunas',
      `Ubah status faktur ${data.noFaktur}?`,
      [
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
      ],
    );
  }

  // S3-03 — buat PDF lalu cetak atau bagikan.
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
  if (error || !data)
    return <ErrorState message={error ?? 'Data tidak tersedia'} onRetry={load} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerCard}>
        <Text style={styles.faktur}>{data.noFaktur}</Text>
        <View
          style={[
            styles.statusBadge,
            data.isLunas ? styles.lunas : styles.belum,
          ]}
        >
          <Text
            style={{
              color: data.isLunas ? colors.success : colors.danger,
              fontWeight: '800',
            }}
          >
            {data.isLunas ? 'LUNAS' : 'BELUM LUNAS'}
          </Text>
        </View>
      </View>

      {/* Baris aksi: pelunasan + cetak/bagikan */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            data.isLunas ? styles.actionWarn : styles.actionPrimary,
          ]}
          onPress={onToggleLunas}
          disabled={acting}
        >
          <Text style={styles.actionText}>
            {data.isLunas ? 'Batal Lunas' : '✓ Tandai Lunas'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionGhost]}
          onPress={() => onPrintOrShare(false)}
          disabled={acting}
        >
          <Text style={styles.actionGhostText}>🖨 Cetak</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionGhost]}
          onPress={() => onPrintOrShare(true)}
          disabled={acting}
        >
          <Text style={styles.actionGhostText}>📤 Bagikan</Text>
        </TouchableOpacity>
      </View>
      {acting && (
        <View style={styles.actingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.muted}> Memproses…</Text>
        </View>
      )}

      {data.pelanggan && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pelanggan</Text>
          <Text style={styles.custName}>{data.pelanggan.nama}</Text>
          <Text style={styles.muted}>
            ID {data.pelanggan.id} • Tipe {data.pelanggan.tipe ?? '-'}
          </Text>
          {!!data.pelanggan.alamat && (
            <Text style={styles.muted}>{data.pelanggan.alamat}</Text>
          )}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rincian</Text>
        {data.items.map((it, i) => (
          <Row
            key={i}
            label={`${it.produk ?? 'Item'} (${it.quantity ?? 0} m³)`}
            value={formatRupiah(it.total ?? 0)}
          />
        ))}
        <View style={styles.sep} />
        <Row label="Subtotal" value={formatRupiah(data.subtotal ?? 0)} />
        <Row label="Beban" value={formatRupiah(data.beban ?? 0)} />
        {!!data.denda && <Row label="Denda" value={formatRupiah(data.denda)} />}
        <Row label="Total" value={formatRupiah(data.total ?? 0)} bold />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informasi</Text>
        <Row
          label="Tanggal"
          value={data.tanggal ? data.tanggal.slice(0, 10) : '-'}
        />
        <Row label="Jatuh tempo" value={data.tglJatuhTempo ?? '-'} />
        {data.meter.map((m, i) => (
          <Row key={i} label="Angka meter" value={String(m.meter)} />
        ))}
        {!!data.catatan && <Row label="Catatan" value={data.catatan} />}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faktur: { fontSize: 16, fontWeight: '700', color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  lunas: { backgroundColor: '#E8F5E9' },
  belum: { backgroundColor: '#FDECEA' },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: { backgroundColor: colors.success },
  actionWarn: { backgroundColor: colors.warning },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionGhost: { borderWidth: 1.5, borderColor: colors.primary },
  actionGhostText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  actingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    fontSize: 15,
  },
  custName: { fontSize: 16, fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, marginTop: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  rowLabel: { color: colors.muted, flex: 1, fontSize: 13 },
  rowValue: { color: colors.text, fontWeight: '600', fontSize: 13 },
  bold: { color: colors.text, fontWeight: '800', fontSize: 15 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
});
