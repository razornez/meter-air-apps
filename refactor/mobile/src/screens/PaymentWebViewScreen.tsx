import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentWebView'>;

export default function PaymentWebViewScreen({ route, navigation }: Props) {
  const { noFaktur, snapToken, snapUrl: snapUrlFromParam } = route.params;
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef<WebView>(null);

  // Pakai snapUrl (redirectUrl) dari backend bila ada — sudah pasti benar.
  // Fallback ke v4/redirection bila tidak ada.
  const isProduction = process.env.EXPO_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const snapUrl = snapUrlFromParam
    ?? (isProduction
      ? `https://app.midtrans.com/snap/v4/redirection/${snapToken}`
      : `https://app.sandbox.midtrans.com/snap/v4/redirection/${snapToken}`);

  // Debug: log URL agar mudah diverifikasi
  console.log('[Midtrans] Loading URL:', snapUrl);

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
        onError={(e) => {
          console.error('[Midtrans] WebView error:', e.nativeEvent);
          Alert.alert('Koneksi gagal', `Tidak dapat membuka halaman pembayaran.\n${e.nativeEvent.description}`, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        mixedContentMode="compatibility"
        allowsBackForwardNavigationGestures
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
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
