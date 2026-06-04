import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiCustomerDetail, apiGetConfig } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { AppConfig, CustomerDetail } from '../types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCard'>;

const CARD_WIDTH = 320;
const PRIMARY = colors.primary;

export default function CustomerCardScreen({ route }: Props) {
  const { id } = route.params;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // ViewShot v4: ref type adalah instance dari komponen itu sendiri
  const cardRef = useRef<InstanceType<typeof ViewShot>>(null);

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

  async function captureCard(): Promise<string | null> {
    try {
      const ref = cardRef.current as unknown as { capture: () => Promise<string> } | null;
      if (!ref?.capture) return null;
      return await ref.capture();
    } catch {
      return null;
    }
  }

  async function onSave() {
    const uri = await captureCard();
    if (!uri) { Alert.alert('Gagal', 'Tidak dapat mengambil gambar kartu.'); return; }
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Save ke galeri tidak tersedia di web. Gunakan "Bagikan".');
      return;
    }
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin diperlukan', 'Aktifkan izin galeri di pengaturan HP.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('✅ Tersimpan', 'Kartu pelanggan disimpan ke galeri.');
    } catch {
      Alert.alert('Gagal', 'Tidak dapat menyimpan gambar.');
    } finally {
      setSaving(false);
    }
  }

  async function onShare() {
    const uri = await captureCard();
    if (!uri) { Alert.alert('Gagal', 'Tidak dapat mengambil gambar kartu.'); return; }
    setSaving(true);
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Bagikan Kartu Pelanggan' });
      } else {
        Alert.alert('Info', 'Berbagi tidak tersedia di perangkat ini.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></View>;
  }
  if (!customer || !config) return null;

  // Nilai QR = ID pelanggan (yang di-scan petugas saat catat meter)
  const qrValue = String(customer.id);

  return (
    <View style={styles.container}>
      {/* Kartu — di-capture via ViewShot */}
      <ViewShot ref={cardRef} options={{ format: 'png', quality: 0.95 }} style={styles.cardWrap}>
        <View style={styles.card}>

          {/* Header biru */}
          <View style={styles.cardHeader}>
            <View style={styles.droplet}>
              <Text style={styles.dropletIcon}>💧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName} numberOfLines={1}>
                {config.perusahaan || 'PDAM / BUMDES'}
              </Text>
              <Text style={styles.cardTitle}>KARTU PELANGGAN AIR</Text>
            </View>
          </View>

          {/* Garis aksen */}
          <View style={styles.divider} />

          {/* Body: info kiri + QR kanan */}
          <View style={styles.body}>
            <View style={styles.bodyLeft}>
              <Text style={styles.customerName} numberOfLines={2}>
                {customer.nama ?? '-'}
              </Text>
              <Text style={styles.customerAlamat} numberOfLines={2}>
                {customer.alamat ?? '-'}
              </Text>

              {/* ID + Tipe */}
              <View style={styles.idRow}>
                <View style={styles.idBox}>
                  <Text style={styles.idLabel}>NO. PELANGGAN</Text>
                  <Text style={styles.idValue}>{qrValue}</Text>
                </View>
                <View style={styles.tipeBox}>
                  <Text style={styles.tipeLabel}>TIPE</Text>
                  <Text style={styles.tipeValue}>{customer.tipe ?? '-'}</Text>
                </View>
              </View>
            </View>

            {/* QR Code */}
            <View style={styles.qrWrap}>
              <QRCode
                value={qrValue}
                size={90}
                color="#1A2530"
                backgroundColor="#fff"
              />
              <Text style={styles.qrCaption}>Scan meter</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            {!!config.telp && (
              <Text style={styles.footerText}>📞 {config.telp}</Text>
            )}
            {!!config.alamat && (
              <Text style={styles.footerText} numberOfLines={1}>
                📍 {config.alamat.slice(0, 50)}
              </Text>
            )}
          </View>
        </View>
      </ViewShot>

      {/* Tombol aksi */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnSave, saving && { opacity: 0.5 }]}
          onPress={onSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnText}>💾 Simpan ke Galeri</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnShare, saving && { opacity: 0.5 }]}
          onPress={onShare}
          disabled={saving}
        >
          <Text style={styles.btnText}>📲 Bagikan via WA</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        💡 QR berisi ID pelanggan. Petugas scan saat mencatat meter — langsung buka form catat.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardWrap: { width: CARD_WIDTH },
  card: {
    width: CARD_WIDTH, backgroundColor: '#fff',
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#D0E8F5',
  },
  cardHeader: {
    backgroundColor: PRIMARY, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  droplet: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  dropletIcon: { fontSize: 22 },
  companyName: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cardTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 10, letterSpacing: 1.5, marginTop: 2 },
  divider: { height: 3, backgroundColor: '#0277BD' },
  body: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'flex-start' },
  bodyLeft: { flex: 1 },
  customerName: { color: '#1A2530', fontWeight: '800', fontSize: 17, letterSpacing: -0.3 },
  customerAlamat: { color: '#6B7A8D', fontSize: 11, marginTop: 4, lineHeight: 16 },
  idRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
  idBox: { flex: 1, backgroundColor: '#F0F7FF', borderRadius: 8, padding: 8 },
  idLabel: { color: '#0277BD', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  idValue: { color: '#1A2530', fontSize: 15, fontWeight: '800', marginTop: 2 },
  tipeBox: {
    width: 52, backgroundColor: '#E8F5E9',
    borderRadius: 8, padding: 8, alignItems: 'center',
  },
  tipeLabel: { color: '#2E7D32', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  tipeValue: { color: '#1A2530', fontSize: 20, fontWeight: '900', marginTop: 2 },
  qrWrap: { alignItems: 'center' },
  qrCaption: { color: '#6B7A8D', fontSize: 9, marginTop: 5, textAlign: 'center' },
  cardFooter: {
    backgroundColor: '#F0F7FF', paddingHorizontal: 14, paddingVertical: 10,
  },
  footerText: { color: '#0277BD', fontSize: 10, lineHeight: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20, width: CARD_WIDTH },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  btnSave: { backgroundColor: colors.primary },
  btnShare: { backgroundColor: '#25D366' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  note: {
    marginTop: 14, color: colors.muted, fontSize: 12,
    textAlign: 'center', lineHeight: 18, paddingHorizontal: 10,
  },
});
