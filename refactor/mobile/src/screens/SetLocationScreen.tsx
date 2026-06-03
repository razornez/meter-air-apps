import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
        <Text style={styles.hint}>Tekan peta untuk menaruh titik</Text>
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
