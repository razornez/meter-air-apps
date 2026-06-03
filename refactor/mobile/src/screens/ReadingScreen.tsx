import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  apiCalculate,
  apiSaveReading,
  apiUploadPhoto,
} from '../api/services';
import { apiErrorMessage, isNetworkError } from '../api/client';
import { useOffline } from '../offline/OfflineContext';
import { ReadingResult, TariffResult } from '../types';
import { colors, formatRupiah } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Reading'>;

const BEBAN = 5000; // sinkron dengan konstanta backend (preview saja)

export default function ReadingScreen({ route, navigation }: Props) {
  const { meterInfo } = route.params;
  const { customer, lastMeter, alreadyRecordedThisMonth } = meterInfo;

  const [meterText, setMeterText] = useState('');
  const [calc, setCalc] = useState<TariffResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [offlineSaved, setOfflineSaved] = useState(false);

  const { enqueueReading } = useOffline();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const meterBaru = parseInt(meterText, 10);
  const pemakaian = useMemo(() => {
    if (Number.isNaN(meterBaru)) return 0;
    return Math.max(0, meterBaru - lastMeter);
  }, [meterBaru, lastMeter]);

  async function onCalculate() {
    if (Number.isNaN(meterBaru)) {
      Alert.alert('Input meter belum valid');
      return;
    }
    setCalcLoading(true);
    try {
      const r = await apiCalculate(customer.tipe ?? '', pemakaian);
      setCalc(r);
    } catch (e) {
      Alert.alert('Gagal menghitung', apiErrorMessage(e));
    } finally {
      setCalcLoading(false);
    }
  }

  async function openCamera() {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setCameraOpen(true);
  }

  async function capture() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
    if (photo?.uri) setPhotoUri(photo.uri);
    setCameraOpen(false);
  }

  async function onSave() {
    if (Number.isNaN(meterBaru)) {
      Alert.alert('Input meter belum valid');
      return;
    }
    if (meterBaru < lastMeter) {
      Alert.alert(
        'Perhatian',
        `Meter baru (${meterBaru}) lebih kecil dari meter lama (${lastMeter}). Pemakaian akan dihitung 0.`,
      );
    }
    setSaving(true);
    try {
      const saved = await apiSaveReading(
        customer.id,
        meterBaru,
        catatan || undefined,
      );
      if (photoUri) {
        try {
          await apiUploadPhoto(saved.noFaktur, photoUri);
        } catch {
          // foto gagal diunggah bukan kegagalan fatal — catatan sudah tersimpan
          Alert.alert(
            'Catatan tersimpan',
            'Namun foto meter gagal diunggah. Coba unggah ulang nanti.',
          );
        }
      }
      setResult(saved);
    } catch (e) {
      // Offline / tidak ada respons server → simpan ke antrian lokal.
      if (isNetworkError(e)) {
        await enqueueReading({
          customerId: customer.id,
          customerNama: customer.nama,
          meterBaru,
          catatan: catatan || undefined,
          photoUri: photoUri ?? null,
        });
        setOfflineSaved(true);
      } else {
        Alert.alert('Gagal menyimpan', apiErrorMessage(e));
      }
    } finally {
      setSaving(false);
    }
  }

  // ---- Tampilan tersimpan offline (masuk antrian) ----
  if (offlineSaved) {
    return (
      <ScrollView contentContainerStyle={styles.successWrap}>
        <Text style={styles.successIcon}>📥</Text>
        <Text style={[styles.successTitle, { color: colors.warning }]}>
          Tersimpan Offline
        </Text>
        <View style={styles.card}>
          <Row label="Pelanggan" value={customer.nama ?? '-'} />
          <Row label="Meter Baru" value={String(meterBaru)} />
          <Row label="Pemakaian" value={`${pemakaian} m³`} />
          <Text style={[styles.custMeta, { marginTop: 10 }]}>
            Catatan disimpan di perangkat & akan dikirim otomatis saat ada
            koneksi internet.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.primaryBtnText}>Selesai</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ---- Tampilan sukses ----
  if (result) {
    return (
      <ScrollView contentContainerStyle={styles.successWrap}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Catatan Tersimpan</Text>
        <View style={styles.card}>
          <Row label="No. Faktur" value={result.noFaktur} />
          <Row label="Pelanggan" value={customer.nama ?? '-'} />
          <Row label="Meter Lama" value={String(result.meterLama)} />
          <Row label="Meter Baru" value={String(result.meterBaru)} />
          <Row label="Pemakaian" value={`${result.pemakaian} m³`} />
          <Row label="Subtotal" value={formatRupiah(result.subtotal)} />
          <Row label="Beban" value={formatRupiah(result.beban)} />
          <Row label="Total" value={formatRupiah(result.total)} bold />
          <Row label="Jatuh Tempo" value={result.tglJatuhTempo} />
        </View>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.primaryBtnText}>Selesai</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ---- Form input ----
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <View style={styles.card}>
        <Text style={styles.custName}>{customer.nama ?? 'Tanpa nama'}</Text>
        <Text style={styles.custMeta}>ID {customer.id}</Text>
        {!!customer.alamat && (
          <Text style={styles.custMeta}>{customer.alamat}</Text>
        )}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Tipe {customer.tipe ?? '-'}</Text>
          </View>
          <View style={[styles.badge, styles.badgeAlt]}>
            <Text style={styles.badgeText}>Meter lama: {lastMeter}</Text>
          </View>
        </View>
      </View>

      {alreadyRecordedThisMonth && (
        <View style={styles.warnBox}>
          <Text style={styles.warnText}>
            ⚠️ Pelanggan ini sudah dicatat bulan ini. Penyimpanan akan ditolak
            server.
          </Text>
        </View>
      )}

      <Text style={styles.label}>Angka Meter Baru</Text>
      <TextInput
        style={styles.meterInput}
        keyboardType="number-pad"
        value={meterText}
        onChangeText={(t) => {
          setMeterText(t.replace(/[^0-9]/g, ''));
          setCalc(null);
        }}
        placeholder={`> ${lastMeter}`}
        placeholderTextColor={colors.muted}
      />
      <Text style={styles.pemakaian}>
        Pemakaian: <Text style={{ fontWeight: '700' }}>{pemakaian} m³</Text>
      </Text>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={onCalculate}
        disabled={calcLoading}
      >
        {calcLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.secondaryBtnText}>Hitung Tagihan</Text>
        )}
      </TouchableOpacity>

      {calc && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rincian Tarif Berjenjang</Text>
          {calc.posts.map((p) => (
            <Row
              key={p.level}
              label={`Blok ${p.level} • ${p.quantity} m³ × ${formatRupiah(p.harga)}`}
              value={formatRupiah(p.total)}
            />
          ))}
          <View style={styles.sep} />
          <Row label="Subtotal pemakaian" value={formatRupiah(calc.totalBiaya)} />
          <Row label="Beban tetap" value={formatRupiah(BEBAN)} />
          <Row
            label="Perkiraan total"
            value={formatRupiah(calc.totalBiaya + BEBAN)}
            bold
          />
        </View>
      )}

      <Text style={styles.label}>Catatan (opsional)</Text>
      <TextInput
        style={styles.noteInput}
        value={catatan}
        onChangeText={setCatatan}
        placeholder="mis. meter buram / segel rusak"
        placeholderTextColor={colors.muted}
        multiline
      />

      <Text style={styles.label}>Foto Meter</Text>
      {photoUri ? (
        <View>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <TouchableOpacity style={styles.linkBtn} onPress={openCamera}>
            <Text style={styles.linkBtnText}>Ambil ulang foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoBtn} onPress={openCamera}>
          <Text style={styles.photoBtnText}>📷 Ambil Foto Meter</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
        onPress={onSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>Simpan Catatan Meter</Text>
        )}
      </TouchableOpacity>

      {/* Modal kamera untuk memotret meter */}
      <Modal visible={cameraOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
          />
          <View style={styles.camControls}>
            <TouchableOpacity
              style={styles.camCancel}
              onPress={() => setCameraOpen(false)}
            >
              <Text style={styles.camCancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shutter} onPress={capture} />
            <View style={{ width: 60 }} />
          </View>
        </View>
      </Modal>
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
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    fontSize: 15,
  },
  custName: { fontSize: 20, fontWeight: '700', color: colors.text },
  custMeta: { color: colors.muted, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeAlt: { backgroundColor: '#E0F7FA' },
  badgeText: { color: colors.primaryDark, fontSize: 12, fontWeight: '600' },
  warnBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  warnText: { color: colors.warning, fontSize: 13 },
  label: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
    marginTop: 4,
    fontWeight: '600',
  },
  meterInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: '#fff',
    letterSpacing: 2,
  },
  pemakaian: { marginTop: 8, color: colors.text },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 16,
  },
  secondaryBtnText: { color: colors.primary, fontWeight: '700' },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: colors.text,
    marginBottom: 8,
  },
  photoBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  photoBtnText: { color: colors.primary, fontWeight: '600' },
  preview: { width: '100%', height: 200, borderRadius: 10 },
  linkBtn: { paddingVertical: 8, alignItems: 'center' },
  linkBtnText: { color: colors.primary },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  rowLabel: { color: colors.muted, flex: 1, fontSize: 13 },
  rowValue: { color: colors.text, fontWeight: '600', fontSize: 13 },
  rowBold: { color: colors.text, fontWeight: '800', fontSize: 15 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  successWrap: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.bg,
    flexGrow: 1,
  },
  successIcon: { fontSize: 64, marginTop: 20 },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.success,
    marginVertical: 12,
  },
  camControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  camCancel: { padding: 12 },
  camCancelText: { color: '#fff', fontSize: 16 },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
