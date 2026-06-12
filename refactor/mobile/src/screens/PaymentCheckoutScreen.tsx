import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { alertDialog } from '../utils/dialog';
import { pollLunas } from '../utils/paymentStatus';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCheckout'>;

/**
 * Native: render halaman /checkout hosted kasugai dalam WebView. Hasil bayar dikirim halaman
 * via window.ReactNativeWebView.postMessage(JSON) → onMessage. Status lunas final dari webhook.
 */
export default function PaymentCheckoutScreen({ route, navigation }: Props) {
  const { noFaktur, checkoutUrl } = route.params;
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const handled = useRef(false);

  async function handleResult(status: string) {
    if (handled.current) return;
    if (status === 'error') { await alertDialog('Pembayaran Gagal', 'Pembayaran gagal atau dibatalkan.'); return; }
    handled.current = true;
    if (status === 'success') {
      setVerifying(true);
      const lunas = await pollLunas(noFaktur);
      setVerifying(false);
      await alertDialog('✅ Pembayaran Diterima', lunas ? 'Faktur sudah LUNAS.' : 'Pembayaran berhasil. Status diperbarui otomatis.');
    } else {
      await alertDialog('Menunggu Pembayaran', 'Selesaikan pembayaran sesuai instruksi. Status diperbarui otomatis.');
    }
    navigation.goBack();
  }

  function onMessage(e: WebViewMessageEvent) {
    try {
      const r = JSON.parse(e.nativeEvent.data) as { type?: string; status?: string };
      if (r?.type === 'kasugai_payment' && r.status) handleResult(r.status);
    } catch { /* abaikan pesan non-JSON */ }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <WebView
        source={{ uri: checkoutUrl }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['https://*']}
        onMessage={onMessage}
        onLoadEnd={() => setLoading(false)}
      />
      {(loading || verifying) && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.text}>{verifying ? 'Mengecek status pembayaran…' : 'Memuat…'}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.7)', alignItems: 'center', justifyContent: 'center', gap: 14 },
  text: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
