import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { alertDialog } from '../utils/dialog';
import { pollLunas } from '../utils/paymentStatus';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCheckout'>;

const KASUGAI_ORIGIN = 'https://kasugai.razornez.net';

/**
 * Web: render halaman /checkout hosted kasugai dalam <iframe>. Hasil bayar dikirim halaman via
 * window.parent.postMessage(objek) → didengar di sini (cek origin). Status lunas final dari webhook.
 */
export default function PaymentCheckoutScreen({ route, navigation }: Props) {
  const { noFaktur, checkoutUrl } = route.params;
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

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== KASUGAI_ORIGIN) return; // keamanan: hanya terima dari kasugai
      const d = e.data as { type?: string; status?: string };
      if (d?.type === 'kasugai_payment' && d.status) void handleResult(d.status);
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {React.createElement('iframe', {
        src: checkoutUrl,
        title: 'Pembayaran',
        allow: 'payment *',
        style: { border: 'none', width: '100%', height: '100%', flex: 1 },
      })}
      {verifying && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.text}>Mengecek status pembayaran…</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.7)', alignItems: 'center', justifyContent: 'center', gap: 14 },
  text: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
