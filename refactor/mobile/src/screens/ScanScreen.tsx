import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiResolveCustomer } from '../api/services';
import { apiErrorMessage, isNetworkError } from '../api/client';
import { useOffline } from '../offline/OfflineContext';
import { fonts, palette, radius, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { ScanIcon } from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

// State machine scan: ready → scanning → result/error → ready
type ScanState = 'ready' | 'scanning' | 'error';

export default function ScanScreen({ navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { t: i18n } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const { resolveOffline } = useOffline();

  const [scanState, setScanState] = useState<ScanState>('ready');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');

  async function processCode(code: string) {
    const trimmed = code.trim();
    if (!trimmed || scanState !== 'ready') return;

    setScanState('scanning');
    setErrorMsg('');

    try {
      const info = await apiResolveCustomer(trimmed);
      // Sukses → navigasi, tidak perlu reset state
      navigation.replace('Reading', { meterInfo: info });
    } catch (e) {
      let msg = '';
      if (isNetworkError(e)) {
        const offline = await resolveOffline(trimmed);
        if (offline) {
          navigation.replace('Reading', { meterInfo: offline });
          return;
        }
        msg = i18n('scan_error_no_connection');
      } else {
        msg = i18n('scan_error_code_not_found', { code: trimmed }) + '\n' + apiErrorMessage(e);
      }
      setErrorMsg(msg);
      setScanState('error');
    }
  }

  function onScanned(result: BarcodeScanningResult) {
    processCode(result.data);
  }

  function onManualSubmit() {
    processCode(manualCode);
    setManualCode('');
  }

  function resetScan() {
    setScanState('ready');
    setErrorMsg('');
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
          {i18n('scan_permission_text')}
        </Text>
        <TouchableOpacity activeOpacity={0.9} onPress={requestPermission}>
          <LinearGradient
            colors={t.scan}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.permBtn}
          >
            <Text style={s.permBtnText}>{i18n('scan_button_allow_camera')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Camera: aktif hanya saat state 'ready' */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'ean13', 'code39'] }}
        onBarcodeScanned={scanState === 'ready' ? onScanned : undefined}
      />

      {/* Overlay tengah */}
      <View style={s.overlay}>

        {/* Bingkai scan */}
        <View style={s.frame}>
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
        </View>

        {/* State: ready — instruksi */}
        {scanState === 'ready' && (
          <View style={s.hintPill}>
            <ScanIcon size={16} color={palette.white} />
            <Text style={s.hint}>{i18n('scan_hint')}</Text>
          </View>
        )}

        {/* State: scanning — loading */}
        {scanState === 'scanning' && (
          <View style={s.statusBox}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={s.statusText}>{i18n('scan_searching')}</Text>
          </View>
        )}

        {/* State: error — pesan + tombol coba lagi */}
        {scanState === 'error' && (
          <View style={s.errorBox}>
            <Text style={s.errorTitle}>{i18n('scan_error_title')}</Text>
            <Text style={s.errorMsg}>{errorMsg}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={resetScan}>
              <Text style={s.retryText}>{i18n('scan_button_retry')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Input manual di bawah — selalu tersedia */}
      <View style={s.manualBar}>
        <Text style={s.manualLabel}>{i18n('scan_manual_label')}</Text>
        <View style={s.manualRow}>
          <TextInput
            style={s.manualInput}
            placeholder={i18n('scan_manual_placeholder')}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={manualCode}
            onChangeText={setManualCode}
            keyboardType="number-pad"
            onSubmitEditing={onManualSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[s.manualBtn, (!manualCode.trim() || scanState === 'scanning') && { opacity: 0.4 }]}
            onPress={onManualSubmit}
            disabled={!manualCode.trim() || scanState === 'scanning'}
          >
            <Text style={s.manualBtnText}>{i18n('scan_button_search')}</Text>
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
      width: 76, height: 76, borderRadius: 24,
      backgroundColor: t.badgeBg,
      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    permText: {
      textAlign: 'center', color: t.text, marginBottom: 18,
      fontFamily: fonts.medium, fontSize: 14,
    },
    permBtn: { paddingHorizontal: 24, paddingVertical: 13, borderRadius: radius.md },
    permBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
    overlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 120,
      justifyContent: 'center', alignItems: 'center',
    },
    frame: { width: 248, height: 248, borderRadius: 28 },
    corner: { position: 'absolute', width: C, height: C, borderColor: palette.aquaLight },
    tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
    tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
    br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
    hintPill: {
      flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 26,
      backgroundColor: 'rgba(6,40,46,0.7)',
      paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill,
    },
    hint: { color: '#fff', fontSize: 13.5, fontFamily: fonts.semibold },
    statusBox: {
      flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26,
      backgroundColor: 'rgba(6,40,46,0.85)',
      paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.md,
    },
    statusText: { color: '#fff', fontFamily: fonts.medium, fontSize: 14 },
    errorBox: {
      marginTop: 26, alignItems: 'center',
      backgroundColor: 'rgba(30,0,0,0.88)',
      paddingHorizontal: 20, paddingVertical: 16,
      borderRadius: radius.lg, marginHorizontal: 24,
      borderWidth: 1, borderColor: 'rgba(255,80,80,0.4)',
    },
    errorTitle: {
      color: '#FF6B6B', fontFamily: fonts.bold,
      fontSize: 15, marginBottom: 6,
    },
    errorMsg: {
      color: 'rgba(255,255,255,0.8)', fontFamily: fonts.regular,
      fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 18,
    },
    retryBtn: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 20, paddingVertical: 10,
      borderRadius: radius.pill, borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    retryText: { color: '#fff', fontFamily: fonts.bold, fontSize: 14 },
    manualBar: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: 'rgba(6,20,30,0.92)',
      padding: 16, paddingBottom: 32,
    },
    manualLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontFamily: fonts.medium, fontSize: 12, marginBottom: 8,
    },
    manualRow: { flexDirection: 'row', gap: 10 },
    manualInput: {
      flex: 1, borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      borderRadius: radius.sm,
      paddingHorizontal: 14, paddingVertical: 11,
      color: '#fff', fontFamily: fonts.medium, fontSize: 15,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    manualBtn: {
      backgroundColor: palette.teal, borderRadius: radius.sm,
      paddingHorizontal: 18, justifyContent: 'center',
    },
    manualBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 14 },
  });
