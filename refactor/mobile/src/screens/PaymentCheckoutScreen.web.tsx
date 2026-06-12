import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { pollLunas } from '../utils/paymentStatus';
import { PaymentResultOverlay, ResultStatus } from '../components/PaymentResultOverlay';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCheckout'>;

const KASUGAI_ORIGIN = 'https://kasugai.razornez.net';

/**
 * Web: halaman /checkout hosted kasugai dalam <iframe>. Hasil via window.parent.postMessage
 * (cek origin). Status lunas final dari webhook; overlay beranimasi memberi umpan balik. */
export default function PaymentCheckoutScreen({ route, navigation }: Props) {
  const { noFaktur, checkoutUrl, amount } = route.params;
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
    if (result === 'error') { handled.current = false; setResult(null); return; }
    navigation.goBack();
  }

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== KASUGAI_ORIGIN) return; // keamanan: hanya dari kasugai
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
      {result && <PaymentResultOverlay status={result} amount={amount} onDone={onDone} />}
    </View>
  );
}
