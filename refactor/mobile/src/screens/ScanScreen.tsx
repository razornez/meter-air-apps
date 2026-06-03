import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiResolveCustomer } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export default function ScanScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cegah callback scan terpicu berkali-kali untuk satu kode.
  const handled = useRef(false);

  async function onScanned(result: BarcodeScanningResult) {
    if (handled.current || busy) return;
    handled.current = true;
    setBusy(true);
    setError(null);
    try {
      const info = await apiResolveCustomer(result.data.trim());
      navigation.replace('Reading', { meterInfo: info });
    } catch (e) {
      setError(apiErrorMessage(e));
      // izinkan scan ulang setelah jeda singkat
      setTimeout(() => {
        handled.current = false;
      }, 1200);
    } finally {
      setBusy(false);
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>
          Aplikasi memerlukan izin kamera untuk memindai QR meter.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'ean13'] }}
        onBarcodeScanned={onScanned}
      />

      {/* Bingkai pemandu */}
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Arahkan ke QR / barcode meter</Text>
        {busy && (
          <View style={styles.busy}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.busyText}>Mencari pelanggan…</Text>
          </View>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.bg,
  },
  permText: { textAlign: 'center', color: colors.text, marginBottom: 16 },
  permBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permBtnText: { color: '#fff', fontWeight: '600' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: { color: '#fff', marginTop: 18, fontSize: 14 },
  busy: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
  busyText: { color: '#fff' },
  error: {
    marginTop: 16,
    color: '#fff',
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
