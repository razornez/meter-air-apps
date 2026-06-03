import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiResolveCustomer } from '../api/services';
import { apiErrorMessage, isNetworkError } from '../api/client';
import { useOffline } from '../offline/OfflineContext';
import { fonts, palette, radius, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ScanIcon } from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export default function ScanScreen({ navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const [permission, requestPermission] = useCameraPermissions();
  const { resolveOffline } = useOffline();
  const [busy, setBusy] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const handledAt = useRef(0); // timestamp-based debounce (lebih robust dari boolean)

  async function processCode(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;

    // Debounce 2 detik per scan agar tidak double-fire
    const now = Date.now();
    if (now - handledAt.current < 2000) return;
    handledAt.current = now;

    setBusy(true);
    try {
      const info = await apiResolveCustomer(trimmed);
      navigation.replace('Reading', { meterInfo: info });
    } catch (e) {
      if (isNetworkError(e)) {
        const offline = await resolveOffline(trimmed);
        if (offline) {
          navigation.replace('Reading', { meterInfo: offline });
          return;
        }
        Alert.alert(
          'Offline',
          'Tidak ada koneksi & pelanggan tidak ada di cache.\nSinkronkan data saat ada koneksi, atau input manual.',
        );
      } else {
        Alert.alert(
          'Pelanggan tidak ditemukan',
          `Kode "${trimmed}" tidak cocok dengan pelanggan mana pun.\n\n${apiErrorMessage(e)}`,
        );
      }
      // Reset debounce setelah error agar bisa scan ulang
      handledAt.current = 0;
    } finally {
      setBusy(false);
    }
  }

  function onScanned(result: BarcodeScanningResult) {
    processCode(result.data);
  }

  function onManualSubmit() {
    processCode(manualCode);
    setManualCode('');
  }

  if (!permission) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={t.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={s.center}>
        <View style={s.permIcon}>
          <ScanIcon size={40} color={t.primary} strokeWidth={2} />
        </View>
        <Text style={s.permText}>
          Aplikasi memerlukan izin kamera untuk memindai QR meter.
        </Text>
        <TouchableOpacity activeOpacity={0.9} onPress={requestPermission}>
          <LinearGradient
            colors={t.scan}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.permBtn}
          >
            <Text style={s.permBtnText}>Izinkan Kamera</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Camera layer */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'ean13', 'code39'] }}
        onBarcodeScanned={busy ? undefined : onScanned}
      />

      {/* Overlay */}
      <View style={s.overlay}>
        {/* Bingkai scan */}
        <View style={s.frame}>
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
        </View>

        {/* Keterangan */}
        <View style={s.hintPill}>
          <ScanIcon size={16} color={palette.white} />
          <Text style={s.hint}>Arahkan ke QR / barcode meter</Text>
        </View>

        {/* Loading state */}
        {busy && (
          <View style={s.busy}>
            <ActivityIndicator color="#fff" />
            <Text style={s.busyText}>Mencari pelanggan…</Text>
          </View>
        )}
      </View>

      {/* Input manual — di bagian bawah layar kamera */}
      <View style={s.manualBar}>
        <Text style={s.manualLabel}>Atau ketik ID manual:</Text>
        <View style={s.manualRow}>
          <TextInput
            style={s.manualInput}
            placeholder="mis. 200212011"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={manualCode}
            onChangeText={setManualCode}
            keyboardType="number-pad"
            onSubmitEditing={onManualSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[s.manualBtn, (!manualCode.trim() || busy) && { opacity: 0.4 }]}
            onPress={onManualSubmit}
            disabled={!manualCode.trim() || busy}
          >
            <Text style={s.manualBtnText}>Cari</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const C = 34;
const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: t.bg,
    },
    permIcon: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: t.badgeBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    permText: {
      textAlign: 'center',
      color: t.text,
      marginBottom: 18,
      fontFamily: fonts.medium,
      fontSize: 14,
    },
    permBtn: { paddingHorizontal: 24, paddingVertical: 13, borderRadius: radius.md },
    permBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 120, // ruang untuk manual input bar
      justifyContent: 'center',
      alignItems: 'center',
    },
    frame: { width: 248, height: 248, borderRadius: 28 },
    corner: { position: 'absolute', width: C, height: C, borderColor: palette.aquaLight },
    tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
    tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
    br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
    hintPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 26,
      backgroundColor: 'rgba(6,40,46,0.7)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: radius.pill,
    },
    hint: { color: '#fff', fontSize: 13.5, fontFamily: fonts.semibold },
    busy: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
    busyText: { color: '#fff', fontFamily: fonts.medium },
    // Manual input bar di bawah
    manualBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(6,20,30,0.92)',
      padding: 16,
      paddingBottom: 32,
    },
    manualLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontFamily: fonts.medium,
      fontSize: 12,
      marginBottom: 8,
    },
    manualRow: { flexDirection: 'row', gap: 10 },
    manualInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      borderRadius: radius.sm,
      paddingHorizontal: 14,
      paddingVertical: 11,
      color: '#fff',
      fontFamily: fonts.medium,
      fontSize: 15,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    manualBtn: {
      backgroundColor: palette.teal,
      borderRadius: radius.sm,
      paddingHorizontal: 18,
      justifyContent: 'center',
    },
    manualBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 14 },
  });
