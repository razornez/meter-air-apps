/// <reference lib="dom" />
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentWebView'>;

// Versi WEB: buka Snap di tab baru karena WebView tidak tersedia di browser.
export default function PaymentWebViewScreen({ route, navigation }: Props) {
  const { noFaktur, snapToken } = route.params;
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const url = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
    window.open(url, '_blank');
    setOpened(true);
    // Kembali setelah 2 detik
    const t = setTimeout(() => navigation.goBack(), 2000);
    return () => clearTimeout(t);
  }, [snapToken, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>
        {opened
          ? 'Halaman pembayaran dibuka di tab baru.\nKembali ke halaman sebelumnya…'
          : 'Membuka halaman pembayaran…'}
      </Text>
      <Text style={styles.sub}>Faktur: {noFaktur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: 24 },
  text: { color: colors.text, marginTop: 16, textAlign: 'center', lineHeight: 22 },
  sub: { color: colors.muted, marginTop: 8, fontSize: 13 },
});
