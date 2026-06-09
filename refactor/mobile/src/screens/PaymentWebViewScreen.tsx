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
  const handledRef = useRef(false);

  // Pakai snapUrl (redirectUrl) dari backend bila ada — sudah pasti benar.
  // Fallback ke v4/redirection bila tidak ada.
  const isProduction = process.env.EXPO_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const snapUrl = snapUrlFromParam
    ?? (isProduction
      ? `https://app.midtrans.com/snap/v4/redirection/${snapToken}`
      : `https://app.sandbox.midtrans.com/snap/v4/redirection/${snapToken}`);

  // URL penyelesaian: finishUrl meter-air (/payment/return), fallback kasugai (snap-return),
  // atau callback Midtrans (/finish, /unfinish, /error).
  function isCompletionUrl(url: string) {
    return url.includes('/payment/return') || url.includes('snap-return') ||
      url.includes('/finish') || url.includes('/unfinish') || url.includes('/error');
  }

  function handleCompletion(url: string) {
    if (handledRef.current) return;
    handledRef.current = true;
    const m = url.match(/[?&](?:transaction_status|status_code|order_status)=([^&]+)/i);
    const status = decodeURIComponent(m?.[1] ?? '').toLowerCase();
    const failed = url.includes('/error') || /deny|cancel|expire|failure/.test(status);
    const pending = url.includes('/unfinish') || /pending/.test(status);
    Alert.alert(
      failed ? '❌ Pembayaran Gagal' : pending ? 'ℹ️ Pembayaran Tertunda' : '✅ Pembayaran Diproses',
      failed
        ? 'Pembayaran tidak selesai. Silakan coba lagi.'
        : pending
          ? 'Pembayaran belum selesai. Selesaikan lalu cek status tagihan.'
          : `Faktur ${noFaktur} sedang diproses.\nStatus tagihan diperbarui otomatis.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  }

  function onNavigationChange(state: WebViewNavigation) {
    if (isCompletionUrl(state.url)) handleCompletion(state.url);
  }

  // Cegat URL penyelesaian SEBELUM di-load → tak ada flash halaman JSON/return yang jelek.
  function onShouldStart(req: { url: string }): boolean {
    if (isCompletionUrl(req.url)) { handleCompletion(req.url); return false; }
    return true;
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
        onShouldStartLoadWithRequest={onShouldStart}
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
