import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiUpdateLocation } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { LeafletMap } from '../components/LeafletMap';
import { PickedPoint } from '../components/leafletMapTypes';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SetLocation'>;
const DEFAULT_CENTER = { lat: -7.0215, lng: 107.581 };

export default function SetLocationScreen({ route, navigation }: Props) {
  const { id, nama, lat, lng } = route.params;
  const initial =
    lat != null && lng != null ? { lat, lng } : null;
  const [picked, setPicked] = useState<PickedPoint | null>(initial);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  async function onUseGps() {
    // Web tidak punya expo-location native — fallback ke browser Geolocation.
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        Alert.alert('GPS tidak tersedia', 'Browser tidak mendukung geolocation.');
        return;
      }
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPicked({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsLoading(false);
        },
        () => {
          Alert.alert('GPS gagal', 'Tidak dapat mengambil posisi dari browser.');
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
        Alert.alert(
          'Izin GPS ditolak',
          'Aktifkan izin lokasi di pengaturan untuk menggunakan fitur ini.',
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setPicked({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      Alert.alert('GPS gagal', 'Tidak dapat mengambil posisi GPS.');
    } finally {
      setGpsLoading(false);
    }
  }

  async function onSave() {
    if (!picked) {
      Alert.alert('Pilih titik', 'Tekan pada peta untuk menaruh titik dulu.');
      return;
    }
    setSaving(true);
    try {
      await apiUpdateLocation(id, picked.lat, picked.lng);
      Alert.alert('Tersimpan', 'Lokasi pelanggan diperbarui.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Gagal', apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Text style={styles.title} numberOfLines={1}>
          {nama ?? `Pelanggan ${id}`}
        </Text>
        <Text style={styles.hint}>Tekan peta untuk menaruh titik — atau:</Text>
        <TouchableOpacity
          style={[styles.gpsBtn, gpsLoading && { opacity: 0.6 }]}
          onPress={onUseGps}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.gpsBtnText}>📍 Gunakan GPS saat ini</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrap}>
        <LeafletMap
          markers={[]}
          editable
          selected={initial}
          center={initial ?? DEFAULT_CENTER}
          zoom={16}
          onPick={setPicked}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.coord}>
          {picked
            ? `Titik: ${picked.lat.toFixed(6)}, ${picked.lng.toFixed(6)}`
            : 'Belum ada titik dipilih'}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, (!picked || saving) && { opacity: 0.6 }]}
          onPress={onSave}
          disabled={!picked || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Simpan Lokasi</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  bar: { padding: 12, backgroundColor: colors.card },
  title: { fontWeight: '700', color: colors.text, fontSize: 16 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  gpsBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 8,
  },
  gpsBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  mapWrap: { flex: 1 },
  footer: {
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  coord: { color: colors.text, marginBottom: 10, fontSize: 13 },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
