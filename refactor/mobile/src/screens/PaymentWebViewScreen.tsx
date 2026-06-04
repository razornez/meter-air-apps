import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentWebView'>;

export default function PaymentWebViewScreen({ route, navigation }: Props) {
  const { noFaktur, snapToken } = route.params;
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef<WebView>(null);

  // Gunakan redirect_url dari Midtrans (backend sudah tentukan sandbox/production).
  // Format: https://app[.sandbox].midtrans.com/snap/v2/vtweb/<token>
  const isProduction = process.env.EXPO_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const snapUrl = isProduction
    ? `https://app.midtrans.com/snap/v2/vtweb/${snapToken}`
    : `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;

  function onNavigationChange(state: WebViewNavigation) {
    const url = state.url;

    if (url.includes('/finish')) {
      Alert.alert(
        '✅ Pembayaran Berhasil',
        `Faktur ${noFaktur} telah dibayar.\nStatus akan diperbarui otomatis.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
      return;
    }
    if (url.includes('/unfinish')) {
      Alert.alert(
        'ℹ️ Pembayaran Tertunda',
        'Pembayaran belum selesai. Silakan coba lagi.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
      return;
    }
    if (url.includes('/error')) {
      Alert.alert(
        '❌ Pembayaran Gagal',
        'Terjadi kesalahan saat memproses pembayaran.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <WebView
        ref={webviewRef}
        source={{ uri: snapUrl }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={onNavigationChange}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    zIndex: 1,
  },
  webview: { flex: 1 },
});
