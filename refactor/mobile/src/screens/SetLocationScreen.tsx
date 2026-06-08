import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiUpdateLocation } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { LeafletMap } from '../components/LeafletMap';
import { PickedPoint } from '../components/leafletMapTypes';
import { fonts, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { MapPinIcon } from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'SetLocation'>;
const DEFAULT_CENTER = { lat: -7.0215, lng: 107.581 };

export default function SetLocationScreen({ route, navigation }: Props) {
  const { t: tr } = useTranslation();
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { id, nama, lat, lng } = route.params;
  const initial = lat != null && lng != null ? { lat, lng } : null;
  const [picked, setPicked] = useState<PickedPoint | null>(initial);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onUseGps() {
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        Alert.alert(tr('set_location_alert_gps_unavailable_title'), tr('set_location_alert_gps_unavailable_message'));
        return;
      }
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPicked({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsLoading(false);
        },
        () => {
          Alert.alert(tr('set_location_alert_gps_failed_title'), tr('set_location_alert_gps_failed_browser'));
          setGpsLoading(false);
        },
        { timeout: 10000 },
      );
      return;
    }

    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(tr('set_location_alert_gps_denied_title'), tr('set_location_alert_gps_denied_message'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setPicked({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      Alert.alert(tr('set_location_alert_gps_failed_title'), tr('set_location_alert_gps_failed_message'));
    } finally {
      setGpsLoading(false);
    }
  }

  async function onSave() {
    if (!picked) {
      Alert.alert(tr('set_location_alert_no_point_title'), tr('set_location_alert_no_point_message'));
      return;
    }
    setSaving(true);
    try {
      await apiUpdateLocation(id, picked.lat, picked.lng);
      setSaved(true); // tampilkan modal sukses kustom
    } catch (e) {
      Alert.alert(tr('set_location_alert_failed_title'), apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={s.container}>
      <View style={s.bar}>
        <Text style={s.title} numberOfLines={1}>{nama ?? `Pelanggan ${id}`}</Text>
        <Text style={s.hint}>{tr('set_location_hint')}</Text>
        <TouchableOpacity style={[s.gpsBtn, gpsLoading && { opacity: 0.6 }]} onPress={onUseGps} disabled={gpsLoading} activeOpacity={0.85}>
          {gpsLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MapPinIcon size={16} color="#fff" />
              <Text style={s.gpsBtnText}>{tr('set_location_button_use_gps')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={s.mapWrap}>
        <LeafletMap markers={[]} editable selected={initial} center={initial ?? DEFAULT_CENTER} zoom={16} onPick={setPicked} />
      </View>

      <View style={s.footer}>
        <Text style={s.coord}>
          {picked ? tr('set_location_coord_picked', { lat: picked.lat.toFixed(6), lng: picked.lng.toFixed(6) }) : tr('set_location_coord_none')}
        </Text>
        <TouchableOpacity activeOpacity={0.9} onPress={onSave} disabled={!picked || saving}>
          <LinearGradient
            colors={t.scan}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.saveBtn, (!picked || saving) && { opacity: 0.6 }]}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveText}>{tr('set_location_button_save')}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal sukses kustom (ganti Alert default) */}
      <Modal visible={saved} transparent animationType="fade" onRequestClose={() => { setSaved(false); navigation.goBack(); }}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalIcon}>
              <Ionicons name="location" size={30} color="#fff" />
              <View style={s.modalCheck}><Ionicons name="checkmark-circle" size={22} color={t.success} /></View>
            </View>
            <Text style={s.modalTitle}>{tr('set_location_alert_saved_title')}</Text>
            <Text style={s.modalMsg}>{tr('set_location_alert_saved_message')}</Text>
            {!!picked && (
              <View style={s.modalCoordChip}>
                <Ionicons name="navigate" size={13} color={t.primary} />
                <Text style={s.modalCoordText}>{picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}</Text>
              </View>
            )}
            <TouchableOpacity style={s.modalBtn} activeOpacity={0.85} onPress={() => { setSaved(false); navigation.goBack(); }}>
              <Text style={s.modalBtnText}>{tr('set_location_alert_ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    bar: { padding: 14, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border },
    title: { fontFamily: fonts.displayBold, color: t.text, fontSize: 17 },
    hint: { color: t.muted, fontSize: 12, marginTop: 3, fontFamily: fonts.regular },
    gpsBtn: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: t.primary,
      borderRadius: radius.md,
      paddingVertical: 11,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    gpsBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 13 },
    mapWrap: { flex: 1 },
    footer: { padding: 14, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, ...shadow.float },
    coord: { color: t.text, marginBottom: 10, fontSize: 13, fontFamily: fonts.medium },
    saveBtn: { borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
    saveText: { color: '#fff', fontFamily: fonts.bold, fontSize: 16 },

    // Modal sukses kustom
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 28 },
    modalCard: { width: '100%', maxWidth: 340, backgroundColor: t.surface, borderRadius: radius.xl, padding: 24, alignItems: 'center', ...shadow.float },
    modalIcon: { width: 68, height: 68, borderRadius: 24, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    modalCheck: { position: 'absolute', bottom: -4, right: -4, backgroundColor: t.surface, borderRadius: 12 },
    modalTitle: { color: t.text, fontFamily: fonts.displayBold, fontSize: 19, marginTop: 14 },
    modalMsg: { color: t.muted, fontFamily: fonts.regular, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
    modalCoordChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.badgeBg, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
    modalCoordText: { color: t.primary, fontFamily: fonts.semibold, fontSize: 12 },
    modalBtn: { alignSelf: 'stretch', marginTop: 18, backgroundColor: t.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
  });
