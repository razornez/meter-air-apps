import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { pollLunas } from '../utils/paymentStatus';
import { PaymentResultOverlay, ResultStatus } from '../components/PaymentResultOverlay';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCheckout'>;

/**
 * Native: halaman /checkout hosted kasugai dalam WebView. Hasil via ReactNativeWebView.postMessage.
 * Status lunas final dari webhook; overlay beranimasi memberi umpan balik. */
export default function PaymentCheckoutScreen({ route, navigation }: Props) {
  const { noFaktur, checkoutUrl, amount } = route.params;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultStatus | null>(null);
  const handled = useRef(false);

  async function handleResult(status: string) {
    if (handled.current) return;
    if (status === 'error') { setResult('error'); return; }
    handled.current = true;
    if (status === 'success') {
      setResult('verifying');
      const lunas = await pollLunas(noFaktur);
      setResult(lunas ? 'success' : 'pending');
    } else {
      setResult('pending');
    }
  }

  function onDone() {
    if (result === 'error') { handled.current = false; setResult(null); return; } // tutup, boleh coba lagi
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
      {loading && !result && (
        <View style={s.loading}><ActivityIndicator size="large" color="#16a34a" /><Text style={s.t}>Memuat…</Text></View>
      )}
      {result && <PaymentResultOverlay status={result} amount={amount} onDone={onDone} />}
    </View>
  );
}

const s = StyleSheet.create({
  loading: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 12 },
  t: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
});
