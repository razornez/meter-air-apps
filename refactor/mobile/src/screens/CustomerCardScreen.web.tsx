/// <reference lib="dom" />
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiCustomerDetail, apiGetConfig } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { AppConfig, CustomerDetail } from '../types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCard'>;

// Versi WEB: simpan via browser print dialog (Ctrl+P → Save as PDF).
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
      Alert.alert('Gagal', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function onPrint() {
    window.print();
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (!customer || !config) return null;

  return (
    <View style={s.container}>
      {/* Card */}
      <View style={s.card} id="customer-card">
        <View style={s.header}>
          <Text style={s.emoji}>💧</Text>
          <View>
            <Text style={s.company}>{config.perusahaan || 'PDAM / BUMDES'}</Text>
            <Text style={s.cardTitle}>KARTU PELANGGAN AIR</Text>
          </View>
        </View>
        <View style={s.divider} />
        <Text style={s.name}>{customer.nama ?? '-'}</Text>
        <Text style={s.alamat}>{customer.alamat ?? '-'}</Text>
        <View style={s.row}>
          <View style={s.idBox}>
            <Text style={s.idLabel}>NO. PELANGGAN</Text>
            <Text style={s.idVal}>{String(customer.id)}</Text>
          </View>
          <View style={s.tipeBox}>
            <Text style={s.tipeLabel}>TIPE</Text>
            <Text style={s.tipeVal}>{customer.tipe ?? '-'}</Text>
          </View>
        </View>
        <View style={s.footer}>
          <Text style={s.footerText}>{config.telp}</Text>
          <Text style={s.footerText}>{config.alamat?.slice(0, 50)}</Text>
        </View>
      </View>

      {/* Aksi */}
      <TouchableOpacity style={s.btn} onPress={onPrint}>
        <Text style={s.btnText}>🖨 Cetak / Simpan PDF</Text>
      </TouchableOpacity>
      <Text style={s.hint}>Gunakan Ctrl+P → "Save as PDF" untuk menyimpan atau mencetak.</Text>
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
  name: { color: '#1A2530', fontWeight: '800', fontSize: 18, paddingHorizontal: 16, paddingTop: 14 },
  alamat: { color: '#6B7A8D', fontSize: 12, paddingHorizontal: 16, paddingTop: 4 },
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  idBox: { flex: 1, backgroundColor: '#F0F7FF', borderRadius: 10, padding: 10 },
  idLabel: { color: '#0277BD', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  idVal: { color: '#1A2530', fontSize: 20, fontWeight: '800', marginTop: 2 },
  tipeBox: { width: 80, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, alignItems: 'center' },
  tipeLabel: { color: '#2E7D32', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  tipeVal: { color: '#1A2530', fontSize: 26, fontWeight: '900', marginTop: 2 },
  footer: { backgroundColor: '#F0F7FF', paddingHorizontal: 16, paddingVertical: 10, marginTop: 12 },
  footerText: { color: '#0277BD', fontSize: 10, lineHeight: 16 },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 13, marginTop: 20 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint: { color: colors.muted, marginTop: 10, fontSize: 12, textAlign: 'center' },
});
