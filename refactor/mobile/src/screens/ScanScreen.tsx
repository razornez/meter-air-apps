import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  function retryLater() {
    setTimeout(() => {
      handled.current = false;
    }, 1200);
  }

  async function onScanned(result: BarcodeScanningResult) {
    if (handled.current || busy) return;
    handled.current = true;
    setBusy(true);
    setError(null);
    const code = result.data.trim();
    try {
      const info = await apiResolveCustomer(code);
      navigation.replace('Reading', { meterInfo: info });
    } catch (e) {
      if (isNetworkError(e)) {
        const offline = await resolveOffline(code);
        if (offline) {
          navigation.replace('Reading', { meterInfo: offline });
          return;
        }
        setError('Offline & pelanggan tidak ada di cache. Sinkronkan data saat ada koneksi.');
      } else {
        setError(apiErrorMessage(e));
      }
      retryLater();
    } finally {
      setBusy(false);
    }
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
        <Text style={s.permText}>Aplikasi memerlukan izin kamera untuk memindai QR meter.</Text>
        <TouchableOpacity activeOpacity={0.9} onPress={requestPermission}>
          <LinearGradient colors={t.scan} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.permBtn}>
            <Text style={s.permBtnText}>Izinkan Kamera</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'ean13'] }}
        onBarcodeScanned={onScanned}
      />

      <View style={s.overlay}>
        <View style={s.frame}>
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
        </View>
        <View style={s.hintPill}>
          <ScanIcon size={16} color={palette.white} />
          <Text style={s.hint}>Arahkan ke QR / barcode meter</Text>
        </View>
        {busy && (
          <View style={s.busy}>
            <ActivityIndicator color="#fff" />
            <Text style={s.busyText}>Mencari pelanggan…</Text>
          </View>
        )}
        {error && <Text style={s.error}>{error}</Text>}
      </View>
    </View>
  );
}

const C = 34; // corner length
const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: t.bg },
    permIcon: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: t.badgeBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    permText: { textAlign: 'center', color: t.text, marginBottom: 18, fontFamily: fonts.medium, fontSize: 14 },
    permBtn: { paddingHorizontal: 24, paddingVertical: 13, borderRadius: radius.md },
    permBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
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
    error: {
      marginTop: 16,
      color: '#fff',
      backgroundColor: t.danger,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radius.sm,
      overflow: 'hidden',
      fontFamily: fonts.medium,
      textAlign: 'center',
      marginHorizontal: 24,
    },
  });
