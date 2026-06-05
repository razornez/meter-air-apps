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
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiCalculate, apiOcrMeter, apiSaveReading, apiUpdateLocation, apiUploadPhoto } from '../api/services';
import { preprocessForOcr } from '../utils/imagePreprocess';
import { apiErrorMessage, isNetworkError } from '../api/client';
import { useOffline } from '../offline/OfflineContext';
import { ReadingResult, TariffResult } from '../types';
import { fonts, formatRupiah, palette, radius, shadow, tracking, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { CameraIcon, CheckIcon, MapPinIcon, SyncIcon } from '../components/ui/Icons';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Reading'>;

const BEBAN = 5000; // sinkron dengan konstanta backend (preview saja)

export default function ReadingScreen({ route, navigation }: Props) {
  const { t: tr } = useTranslation();
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
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
  const noCoords = meterInfo.latitude == null && meterInfo.longitude == null;
  const [gpsTagged, setGpsTagged] = useState(false);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSource, setOcrSource] = useState(false); // true = input dari OCR

  async function onRecognize() {
    if (!photoUri) return;
    setOcrLoading(true);
    try {
      // Preprocess: resize ke maks 800px sebelum kirim → Tesseract lebih cepat.
      const processedUri = await preprocessForOcr(photoUri);
      const res = await apiOcrMeter(processedUri);
      if (res.best != null) {
        setMeterText(String(res.best));
        setOcrSource(true);
        setCalc(null);
      } else {
        Alert.alert(
          tr('reading_alert_ocr_not_found_title'),
          tr('reading_alert_ocr_not_found_message'),
        );
      }
    } catch {
      Alert.alert(tr('reading_alert_ocr_failed_title'), tr('reading_alert_ocr_failed_message'));
    } finally {
      setOcrLoading(false);
    }
  }

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
      Alert.alert(tr('reading_alert_invalid_meter'));
      return;
    }
    setCalcLoading(true);
    try {
      const r = await apiCalculate(customer.tipe ?? '', pemakaian);
      setCalc(r);
    } catch (e) {
      Alert.alert(tr('reading_alert_calc_failed_title'), apiErrorMessage(e));
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
      Alert.alert(tr('reading_alert_invalid_meter'));
      return;
    }
    if (meterBaru < lastMeter) {
      Alert.alert(
        tr('reading_alert_meter_low_title'),
        tr('reading_alert_meter_low_message', { meterBaru, lastMeter }),
      );
    }
    setSaving(true);
    try {
      const saved = await apiSaveReading(customer.id, meterBaru, catatan || undefined);
      if (photoUri) {
        try {
          await apiUploadPhoto(saved.noFaktur, photoUri);
        } catch {
          Alert.alert(tr('reading_alert_photo_upload_title'), tr('reading_alert_photo_upload_message'));
        }
      }
      setResult(saved);
    } catch (e) {
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
        Alert.alert(tr('reading_alert_save_failed_title'), apiErrorMessage(e));
      }
    } finally {
      setSaving(false);
    }
  }

  const PrimaryButton = ({ label, onPress, disabled, busy }: { label: string; onPress: () => void; disabled?: boolean; busy?: boolean }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled}>
      <LinearGradient colors={t.scan} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.primaryBtn, (disabled || busy) && { opacity: 0.6 }, shadow.glow]}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );

  // ---- Offline saved ----
  if (offlineSaved) {
    return (
      <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: 'transparent' }} contentContainerStyle={s.successWrap}>
        <View style={[s.successBadge, { backgroundColor: t.warning + '22' }]}>
          <SyncIcon size={40} color={t.warning} />
        </View>
        <Text style={[s.successTitle, { color: t.warning }]}>{tr('reading_alert_offline_saved_title')}</Text>
        <View style={s.card}>
          <Row s={s} label={tr('reading_label_customer')} value={customer.nama ?? '-'} />
          <Row s={s} label={tr('reading_label_new_meter_result')} value={String(meterBaru)} />
          <Row s={s} label={tr('reading_label_usage')} value={`${pemakaian} m³`} />
          <Text style={[s.custMeta, { marginTop: 10 }]}>
            {tr('reading_alert_offline_saved_detail')}
          </Text>
        </View>
        <View style={{ width: '100%' }}>
          <PrimaryButton label={tr('reading_button_done')} onPress={() => navigation.popToTop()} />
        </View>
      </ScrollView>
    );
  }

  // ---- Success — satu layar, no scroll ----
  if (result) {
    return (
      <View style={s.successScreen}>
        {/* Hero */}
        <LinearGradient colors={[t.success, '#1A9E75']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.successHero, shadow.glow]}>
          <View style={s.successIconWrap}>
            <Ionicons name="checkmark-circle" size={32} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.successHeroLabel}>{tr('reading_alert_record_saved_title')}</Text>
            <Text style={s.successHeroFaktur}>{result.noFaktur}</Text>
            <Text style={s.successHeroName} numberOfLines={1}>{customer.nama ?? '-'}</Text>
          </View>
        </LinearGradient>

        {/* Stat chips */}
        <View style={s.successStatRow}>
          <View style={s.successStat}>
            <Text style={s.successStatVal}>{result.meterLama}</Text>
            <Text style={s.successStatLbl}>{tr('reading_label_old_meter')}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={t.muted} />
          <View style={[s.successStat, { backgroundColor: t.badgeBg }]}>
            <Text style={[s.successStatVal, { color: t.primary }]}>{result.meterBaru}</Text>
            <Text style={s.successStatLbl}>{tr('reading_label_new_meter_result')}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={t.muted} />
          <View style={s.successStat}>
            <Text style={[s.successStatVal, { color: t.accent }]}>{result.pemakaian} m³</Text>
            <Text style={s.successStatLbl}>{tr('reading_label_usage')}</Text>
          </View>
        </View>

        {/* Rincian tagihan */}
        <View style={s.card}>
          <Row s={s} label={tr('reading_label_subtotal')} value={formatRupiah(result.subtotal)} />
          <Row s={s} label={tr('reading_label_charge')}   value={formatRupiah(result.beban)} />
          <View style={s.sep} />
          <Row s={s} label={tr('reading_label_total')}    value={formatRupiah(result.total)} bold />
          <Row s={s} label={tr('reading_label_due_date')} value={result.tglJatuhTempo} />
        </View>

        {/* Foto meteran */}
        {!!photoUri && (
          <View style={s.photoRow}>
            <Text style={s.photoLabel}>{tr('reading_label_photo')}</Text>
            <Image source={{ uri: photoUri }} style={s.photoThumb} resizeMode="cover" />
          </View>
        )}

        <PrimaryButton label={tr('reading_button_done')} onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  // ---- Form ----
  return (
    <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: 'transparent' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.custHero, shadow.glow]}>
        <Text style={s.custHeroLabel}>{tr('reading_label_customer')}</Text>
        <Text style={s.custHeroName} numberOfLines={1}>{customer.nama ?? tr('reading_customer_no_name')}</Text>
        <Text style={s.custHeroMeta} numberOfLines={1}>
          ID {customer.id}{customer.alamat ? ` · ${customer.alamat}` : ''}
        </Text>
        <View style={s.custHeroBadges}>
          <View style={s.custHeroBadge}><Text style={s.custHeroBadgeText}>{tr('reading_badge_type', { type: customer.tipe ?? '-' })}</Text></View>
          <View style={s.custHeroBadge}><Text style={s.custHeroBadgeText}>{tr('reading_badge_old_meter', { meter: lastMeter })}</Text></View>
        </View>
      </LinearGradient>

      {alreadyRecordedThisMonth && (
        <View style={s.warnBox}>
          <Text style={s.warnText}>{tr('reading_warn_already_recorded')}</Text>
        </View>
      )}

      {noCoords && !gpsTagged && (
        <TouchableOpacity
          style={s.gpsBanner}
          onPress={async () => {
            try {
              if (typeof window !== 'undefined' && navigator?.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    await apiUpdateLocation(customer.id, pos.coords.latitude, pos.coords.longitude).catch(() => {});
                    setGpsTagged(true);
                  },
                  () => {},
                  { timeout: 8000 },
                );
              } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                await apiUpdateLocation(customer.id, loc.coords.latitude, loc.coords.longitude).catch(() => {});
                setGpsTagged(true);
              }
            } catch {
              /* tidak blok alur catat bila GPS gagal */
            }
          }}
        >
          <MapPinIcon size={17} color={t.primary} />
          <Text style={s.gpsBannerText}>{tr('reading_gps_banner')}</Text>
        </TouchableOpacity>
      )}
      {gpsTagged && <Text style={s.gpsOk}>{tr('reading_gps_tagged')}</Text>}

      {/* Info periode pencatatan */}
      <View style={s.periodBar}>
        <Text style={s.periodText}>
          {tr('reading_period_label', { month_year: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) })}
        </Text>
        <Text style={s.periodSub}>{tr('reading_badge_old_meter', { meter: lastMeter })}</Text>
      </View>

      <View style={s.labelRow}>
        <Text style={s.label}>{tr('reading_label_new_meter')}</Text>
        {ocrSource && (
          <View style={s.ocrBadge}>
            <Text style={s.ocrBadgeText}>{tr('reading_ocr_badge')}</Text>
          </View>
        )}
      </View>
      <TextInput
        style={[s.meterInput, ocrSource && s.meterInputOcr]}
        keyboardType="number-pad"
        value={meterText}
        onChangeText={(t2) => {
          setMeterText(t2.replace(/[^0-9]/g, ''));
          setOcrSource(false); // user mengedit → hapus badge OCR
          setCalc(null);
        }}
        placeholder={`> ${lastMeter}`}
        placeholderTextColor={t.muted}
      />
      <Text style={s.pemakaian}>
        {tr('reading_usage_label')} <Text style={{ fontFamily: fonts.bold, color: t.text }}>{pemakaian} m³</Text>
      </Text>

      <TouchableOpacity style={s.secondaryBtn} onPress={onCalculate} disabled={calcLoading}>
        {calcLoading ? <ActivityIndicator color={t.primary} /> : <Text style={s.secondaryBtnText}>{tr('reading_button_calculate')}</Text>}
      </TouchableOpacity>

      {calc && (
        <View style={s.card}>
          <Text style={s.cardTitle}>{tr('reading_tariff_title')}</Text>
          {calc.posts.map((p) => (
            <Row s={s} key={p.level} label={`Blok ${p.level} • ${p.quantity} m³ × ${formatRupiah(p.harga)}`} value={formatRupiah(p.total)} />
          ))}
          <View style={s.sep} />
          <Row s={s} label={tr('reading_tariff_subtotal')} value={formatRupiah(calc.totalBiaya)} />
          <Row s={s} label={tr('reading_tariff_fixed_charge')} value={formatRupiah(BEBAN)} />
          <Row s={s} label={tr('reading_tariff_estimated_total')} value={formatRupiah(calc.totalBiaya + BEBAN)} bold />
        </View>
      )}

      <Text style={s.label}>{tr('reading_label_note')}</Text>
      <TextInput
        style={s.noteInput}
        value={catatan}
        onChangeText={setCatatan}
        placeholder={tr('reading_placeholder_note')}
        placeholderTextColor={t.muted}
        multiline
      />

      <Text style={s.label}>{tr('reading_label_photo')}</Text>
      {photoUri ? (
        <View>
          <Image source={{ uri: photoUri }} style={s.preview} />
          {/* Tombol OCR muncul setelah foto ada */}
          <TouchableOpacity
            style={[s.ocrBtn, ocrLoading && { opacity: 0.6 }]}
            onPress={onRecognize}
            disabled={ocrLoading}
          >
            {ocrLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.ocrBtnText}>{tr('reading_button_recognize')}</Text>
            )}
          </TouchableOpacity>
          {ocrLoading && (
            <Text style={s.ocrHint}>{tr('reading_ocr_hint')}</Text>
          )}
          <TouchableOpacity style={s.linkBtn} onPress={() => { setOcrSource(false); openCamera(); }}>
            <Text style={s.linkBtnText}>{tr('reading_button_retake')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.photoBtn} onPress={openCamera}>
          <CameraIcon size={20} color={t.primary} />
          <Text style={s.photoBtnText}>{tr('reading_button_take_photo')}</Text>
        </TouchableOpacity>
      )}

      <View style={{ marginTop: 20 }}>
        <PrimaryButton label={tr('reading_button_save')} onPress={onSave} busy={saving} disabled={saving} />
      </View>

      <Modal visible={cameraOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
          <View style={s.camControls}>
            <TouchableOpacity style={s.camCancel} onPress={() => setCameraOpen(false)}>
              <Text style={s.camCancelText}>{tr('reading_camera_button_cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.shutter} onPress={capture} />
            <View style={{ width: 60 }} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function BillCell({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <View style={{ flex: 1, padding: 8 }}>
      <Text style={{ color: '#9CA3AF', fontFamily: fonts.medium, fontSize: 10, marginBottom: 2 }}>{label}</Text>
      <Text style={{ color: '#1F2937', fontFamily: fonts.bold, fontSize: small ? 12 : 14 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function Row({ s, label, value, bold }: { s: ReturnType<typeof createStyles>; label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, bold && s.rowBold]}>{label}</Text>
      <Text style={[s.rowValue, bold && s.rowBold]}>{value}</Text>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 12,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    cardTitle: { fontFamily: fonts.bold, color: t.text, marginBottom: 8, fontSize: 15 },
    custHero: { borderRadius: radius.xl, padding: 20, marginBottom: 16 },
    custHeroLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: tracking.overline },
    custHeroName: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 24, marginTop: 4, letterSpacing: tracking.tight },
    custHeroMeta: { color: 'rgba(255,255,255,0.9)', fontFamily: fonts.regular, fontSize: 12.5, marginTop: 3 },
    custHeroBadges: { flexDirection: 'row', gap: 8, marginTop: 14 },
    custHeroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill },
    custHeroBadgeText: { color: '#fff', fontSize: 12, fontFamily: fonts.semibold },
    custName: { fontSize: 23, fontFamily: fonts.displayBold, color: t.text, letterSpacing: tracking.tight },
    custMeta: { color: t.muted, marginTop: 2, fontFamily: fonts.regular },
    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    badge: { backgroundColor: t.badgeBg, paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.sm },
    badgeText: { color: t.primary, fontSize: 12, fontFamily: fonts.semibold },
    periodBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: t.badgeBg,
      borderRadius: radius.sm,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: t.primary + '33',
    },
    periodText: {
      color: t.primary,
      fontFamily: fonts.bold,
      fontSize: 14,
    },
    periodSub: {
      color: t.muted,
      fontFamily: fonts.regular,
      fontSize: 12,
    },
    gpsBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.badgeBg,
      borderRadius: radius.sm,
      padding: 11,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: t.primary + '55',
    },
    gpsBannerText: { color: t.primary, fontFamily: fonts.semibold, fontSize: 13 },
    gpsOk: { color: t.success, fontSize: 12, marginBottom: 6, fontFamily: fonts.medium },
    warnBox: { backgroundColor: t.warning + '22', borderRadius: radius.sm, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: t.warning + '55' },
    warnText: { color: t.isDark ? t.warning : '#8a5c00', fontSize: 13, fontFamily: fonts.medium },
    labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, marginTop: 4 },
    label: { fontSize: 13, color: t.muted, fontFamily: fonts.semibold },
    ocrBadge: {
      backgroundColor: '#7C3AED22',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: '#7C3AED44',
    },
    ocrBadgeText: { color: '#7C3AED', fontSize: 11, fontFamily: fonts.semibold },
    ocrBtn: {
      backgroundColor: '#7C3AED',
      borderRadius: radius.sm,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 4,
    },
    ocrBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 14 },
    ocrHint: { color: t.muted, fontSize: 11, textAlign: 'center', marginBottom: 4, fontFamily: fonts.regular },
    meterInputOcr: { borderColor: '#7C3AED', borderWidth: 2 },
    meterInput: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radius.sm,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 22,
      fontFamily: fonts.bold,
      color: t.text,
      backgroundColor: t.inputBg,
      letterSpacing: 2,
    },
    pemakaian: { marginTop: 8, color: t.text, fontFamily: fonts.regular },
    secondaryBtn: {
      borderWidth: 1.5,
      borderColor: t.primary,
      borderRadius: radius.md,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 14,
      marginBottom: 16,
    },
    secondaryBtnText: { color: t.primary, fontFamily: fonts.bold },
    noteInput: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radius.sm,
      paddingHorizontal: 14,
      paddingVertical: 10,
      minHeight: 60,
      textAlignVertical: 'top',
      backgroundColor: t.inputBg,
      color: t.text,
      marginBottom: 8,
      fontFamily: fonts.regular,
    },
    photoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: t.primary,
      borderRadius: radius.md,
      paddingVertical: 18,
      backgroundColor: t.surface,
    },
    photoBtnText: { color: t.primary, fontFamily: fonts.semibold },
    preview: { width: '100%', height: 200, borderRadius: radius.md },
    linkBtn: { paddingVertical: 10, alignItems: 'center' },
    linkBtnText: { color: t.primary, fontFamily: fonts.medium },
    primaryBtn: { borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    rowLabel: { color: t.muted, flex: 1, fontSize: 13, fontFamily: fonts.regular },
    rowValue: { color: t.text, fontFamily: fonts.semibold, fontSize: 13 },
    rowBold: { color: t.text, fontFamily: fonts.extrabold, fontSize: 15 },
    sep: { height: 1, backgroundColor: t.border, marginVertical: 8 },
    // ── Success screen (no scroll) ──
    successScreen: {
      flex: 1, padding: 14, paddingBottom: 20, gap: 10,
    },
    successHero: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderRadius: radius.lg, paddingVertical: 13, paddingHorizontal: 16,
    },
    successIconWrap: {
      width: 44, height: 44, borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    successHeroLabel: { color: 'rgba(255,255,255,0.82)', fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 0.6 },
    successHeroFaktur: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 16, marginTop: 1 },
    successHeroName: { color: 'rgba(255,255,255,0.88)', fontFamily: fonts.regular, fontSize: 12, marginTop: 1 },
    successStatRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6,
      backgroundColor: t.surface, borderRadius: radius.lg, padding: 10,
      borderWidth: 1, borderColor: t.border, ...shadow.soft,
    },
    successStat: { flex: 1, alignItems: 'center', paddingVertical: 7 },
    successStatVal: { color: t.text, fontFamily: fonts.displayBold, fontSize: 16 },
    successStatLbl: { color: t.muted, fontFamily: fonts.medium, fontSize: 10, marginTop: 2 },
    photoRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: t.surface, borderRadius: radius.lg,
      paddingHorizontal: 12, paddingVertical: 10,
      borderWidth: 1, borderColor: t.border, ...shadow.soft,
    },
    photoLabel: { flex: 1, color: t.muted, fontFamily: fonts.semibold, fontSize: 13 },
    photoThumb: { width: 56, height: 56, borderRadius: 10 },
    successWrap: { padding: 24, alignItems: 'center', flexGrow: 1 },
    successBadge: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    successTitle: { fontSize: 25, fontFamily: fonts.displayBold, marginVertical: 14, letterSpacing: tracking.tight },
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
    camCancelText: { color: '#fff', fontSize: 16, fontFamily: fonts.medium },
    shutter: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', borderWidth: 5, borderColor: 'rgba(255,255,255,0.5)' },
  });
