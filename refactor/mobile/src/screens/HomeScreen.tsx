import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../auth/AuthContext';
import { apiResolveCustomer } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function openManual() {
    if (!manualCode.trim()) return;
    setLoading(true);
    try {
      const info = await apiResolveCustomer(manualCode.trim());
      setManualCode('');
      navigation.navigate('Reading', { meterInfo: info });
    } catch (e) {
      Alert.alert('Tidak ditemukan', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Halo,</Text>
          <Text style={styles.name}>{user?.fullname ?? user?.username}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.scanCard}
        onPress={() => navigation.navigate('Scan')}
        activeOpacity={0.85}
      >
        <Text style={styles.scanIcon}>📷</Text>
        <Text style={styles.scanTitle}>Scan QR Meter</Text>
        <Text style={styles.scanSub}>
          Arahkan kamera ke QR pada meter pelanggan
        </Text>
      </TouchableOpacity>

      <View style={styles.menuRow}>
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('CustomersList')}
        >
          <Text style={styles.menuIcon}>👥</Text>
          <Text style={styles.menuLabel}>Pelanggan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('FakturList')}
        >
          <Text style={styles.menuIcon}>🧾</Text>
          <Text style={styles.menuLabel}>Tagihan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuRow}>
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuLabel}>Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('MasterData')}
        >
          <Text style={styles.menuIcon}>🗂️</Text>
          <Text style={styles.menuLabel}>Master</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>atau input manual</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.manualRow}>
        <TextInput
          style={styles.manualInput}
          placeholder="ID / barcode pelanggan"
          placeholderTextColor={colors.muted}
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="none"
          onSubmitEditing={openManual}
        />
        <TouchableOpacity
          style={[styles.manualBtn, loading && { opacity: 0.6 }]}
          onPress={openManual}
          disabled={loading}
        >
          <Text style={styles.manualBtnText}>{loading ? '...' : 'Cari'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  hello: { fontSize: 14, color: colors.muted },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  logout: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: { color: colors.danger, fontWeight: '600' },
  scanCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    elevation: 3,
  },
  scanIcon: { fontSize: 52 },
  scanTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 10 },
  scanSub: {
    color: '#D6ECF7',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  menuRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  menuCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: { fontSize: 30 },
  menuLabel: { marginTop: 8, fontWeight: '600', color: colors.text },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 10, color: colors.muted, fontSize: 12 },
  manualRow: { flexDirection: 'row', gap: 10 },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    color: colors.text,
  },
  manualBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  manualBtnText: { color: '#fff', fontWeight: '700' },
});
