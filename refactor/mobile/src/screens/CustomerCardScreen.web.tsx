/// <reference lib="dom" />
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiCustomerDetail, apiGetConfig } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { alertDialog } from '../utils/dialog';
import { AppConfig, CustomerDetail } from '../types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCard'>;

// Versi WEB: tampil kartu + QR code asli + cetak via browser (Ctrl+P → Save as PDF).
export default function CustomerCardScreen({ route }: Props) {
  const { id } = route.params;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [c, cfg] = await Promise.all([apiCustomerDetail(id), apiGetConfig()]);
      setCustomer(c);
      setConfig(cfg);
    } catch (e) {
      alertDialog('Gagal', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (!customer || !config) return null;

  const qrValue = String(customer.id);

  return (
    <View style={s.container}>
      {/* Kartu */}
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.emoji}>💧</Text>
          <View>
            <Text style={s.company}>{config.perusahaan || 'PDAM / BUMDES'}</Text>
            <Text style={s.cardTitle}>KARTU PELANGGAN AIR</Text>
          </View>
        </View>
        <View style={s.divider} />

        <View style={s.body}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{customer.nama ?? '-'}</Text>
            <Text style={s.alamat}>{customer.alamat ?? '-'}</Text>
            <View style={s.idRow}>
              <View style={s.idBox}>
                <Text style={s.idLabel}>NO. PELANGGAN</Text>
                <Text style={s.idVal}>{qrValue}</Text>
              </View>
              <View style={s.tipeBox}>
                <Text style={s.tipeLabel}>TIPE</Text>
                <Text style={s.tipeVal}>{customer.tipe ?? '-'}</Text>
              </View>
            </View>
          </View>
          {/* QR Code */}
          <View style={s.qrWrap}>
            <QRCode value={qrValue} size={90} color="#1A2530" backgroundColor="#fff" />
            <Text style={s.qrCaption}>Scan meter</Text>
          </View>
        </View>

        <View style={s.footer}>
          {!!config.telp && <Text style={s.footerText}>📞 {config.telp}</Text>}
          {!!config.alamat && <Text style={s.footerText} numberOfLines={1}>📍 {config.alamat.slice(0, 50)}</Text>}
        </View>
      </View>

      {/* Tombol cetak */}
      <TouchableOpacity style={s.btn} onPress={() => window.print()}>
        <Text style={s.btnText}>🖨 Cetak / Simpan PDF (Ctrl+P)</Text>
      </TouchableOpacity>
      <Text style={s.hint}>Gunakan Ctrl+P → "Save as PDF" untuk menyimpan atau mencetak kartu.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: 320, backgroundColor: '#fff',
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#D0E8F5',
  },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  emoji: { fontSize: 24 },
  company: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cardTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 10, letterSpacing: 1.5, marginTop: 2 },
  divider: { height: 3, backgroundColor: '#0277BD' },
  body: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'flex-start' },
  name: { color: '#1A2530', fontWeight: '800', fontSize: 17 },
  alamat: { color: '#6B7A8D', fontSize: 11, marginTop: 4, lineHeight: 16 },
  idRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
  idBox: { flex: 1, backgroundColor: '#F0F7FF', borderRadius: 8, padding: 8 },
  idLabel: { color: '#0277BD', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  idVal: { color: '#1A2530', fontSize: 15, fontWeight: '800', marginTop: 2 },
  tipeBox: { width: 52, backgroundColor: '#E8F5E9', borderRadius: 8, padding: 8, alignItems: 'center' },
  tipeLabel: { color: '#2E7D32', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  tipeVal: { color: '#1A2530', fontSize: 20, fontWeight: '900', marginTop: 2 },
  qrWrap: { alignItems: 'center' },
  qrCaption: { color: '#6B7A8D', fontSize: 9, marginTop: 5, textAlign: 'center' },
  footer: { backgroundColor: '#F0F7FF', paddingHorizontal: 14, paddingVertical: 10 },
  footerText: { color: '#0277BD', fontSize: 10, lineHeight: 16 },
  btn: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 13, marginTop: 20,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint: { color: colors.muted, marginTop: 10, fontSize: 12, textAlign: 'center' },
});
