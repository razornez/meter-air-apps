import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
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
      Alert.alert(tr('set_location_alert_saved_title'), tr('set_location_alert_saved_message'), [{ text: 'OK', onPress: () => navigation.goBack() }]);
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
  });
