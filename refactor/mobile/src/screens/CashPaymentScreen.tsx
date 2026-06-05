import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiPay } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { colors, formatRupiah } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CashPayment'>;

// Nomor cantik yang dibulatkan ke atas
function roundUp(n: number, amount: number): number {
  const opts = [amount, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  return opts.find((v) => v >= n) ?? n;
}

export default function CashPaymentScreen({ route, navigation }: Props) {
  const { t: tr } = useTranslation();
  const { noFaktur, amount } = route.params;
  const [received, setReceived] = useState('');
  const [saving, setSaving] = useState(false);

  const receivedNum = parseInt(received.replace(/\D/g, ''), 10) || 0;
  const kembalian = receivedNum - amount;
  const isValid = receivedNum >= amount;

  const quickOptions = useMemo(() => {
    const base = [amount, roundUp(amount, amount)];
    const extras = [5000, 10000, 20000, 50000, 100000, 200000, 500000].map(
      (step) => Math.ceil(amount / step) * step,
    );
    return [...new Set([...base, ...extras])].filter((v) => v >= amount).slice(0, 6);
  }, [amount]);

  const onConfirm = useCallback(async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await apiPay(noFaktur, 'cash');
      Alert.alert(
        tr('cash_payment_alert_success_title'),
        `Tagihan: Rp ${amount.toLocaleString('id-ID')}\n` +
        `Diterima: Rp ${receivedNum.toLocaleString('id-ID')}\n` +
        `Kembalian: Rp ${kembalian.toLocaleString('id-ID')}`,
        [{ text: tr('cash_payment_alert_done'), onPress: () => navigation.pop(2) }],
      );
    } catch (e) {
      Alert.alert(tr('cash_payment_alert_failed'), apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }, [noFaktur, amount, receivedNum, kembalian, isValid, navigation]);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {/* Tagihan */}
      <View style={s.billCard}>
        <Text style={s.billLabel}>{tr('cash_payment_bill_label')}</Text>
        <Text style={s.billAmount}>Rp {amount.toLocaleString('id-ID')}</Text>
        <Text style={s.billNo}>{noFaktur}</Text>
      </View>

      {/* Input uang diterima */}
      <Text style={s.label}>{tr('cash_payment_input_label')}</Text>
      <View style={s.inputWrap}>
        <Text style={s.inputPrefix}>Rp</Text>
        <TextInput
          style={s.input}
          keyboardType="number-pad"
          value={received ? parseInt(received.replace(/\D/g, ''), 10).toLocaleString('id-ID') : ''}
          onChangeText={(v) => setReceived(v.replace(/\D/g, ''))}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Tombol nominal cepat */}
      <View style={s.quickGrid}>
        {quickOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[s.quickBtn, receivedNum === opt && s.quickBtnActive]}
            onPress={() => setReceived(String(opt))}
          >
            <Text style={[s.quickText, receivedNum === opt && s.quickTextActive]}>
              {opt >= 1000000 ? `${opt / 1000000}jt` : `${opt / 1000}rb`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Kembalian */}
      <View style={[s.kembalianCard, isValid && receivedNum > amount ? s.kembalianOk : !received ? s.kembalianEmpty : s.kembalianErr]}>
        <Text style={s.kembalianLabel}>{tr('cash_payment_change_label')}</Text>
        <Text style={s.kembalianAmount}>
          {!received
            ? '—'
            : !isValid
            ? tr('cash_payment_change_insufficient', { amount: formatRupiah(Math.abs(kembalian)) })
            : `Rp ${kembalian.toLocaleString('id-ID')}`}
        </Text>
      </View>

      {/* Konfirmasi */}
      <TouchableOpacity
        style={[s.confirmBtn, (!isValid || saving) && s.confirmDisabled]}
        onPress={onConfirm}
        disabled={!isValid || saving}
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.confirmText}>{tr('cash_payment_button_confirm')}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F9' },
  billCard: {
    backgroundColor: '#1565C0', borderRadius: 18, padding: 20, marginBottom: 24,
    shadowColor: '#1565C0', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  billLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  billAmount: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 4, letterSpacing: -1 },
  billNo: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 2, borderColor: '#3B82F6',
    paddingHorizontal: 16, marginBottom: 14, height: 60,
    shadowColor: '#3B82F6', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  inputPrefix: { fontSize: 18, fontWeight: '700', color: '#6B7280', marginRight: 8 },
  input: { flex: 1, fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  quickBtn: {
    paddingVertical: 10, paddingHorizontal: 16,
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  quickBtnActive: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  quickText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  quickTextActive: { color: '#fff' },
  kembalianCard: { borderRadius: 14, padding: 18, marginBottom: 24 },
  kembalianOk: { backgroundColor: '#D1FAE5', borderWidth: 1.5, borderColor: '#6EE7B7' },
  kembalianEmpty: { backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
  kembalianErr: { backgroundColor: '#FEE2E2', borderWidth: 1.5, borderColor: '#FCA5A5' },
  kembalianLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  kembalianAmount: { fontSize: 28, fontWeight: '900', color: '#111827', marginTop: 4, letterSpacing: -0.5 },
  confirmBtn: {
    backgroundColor: '#059669', borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#059669', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  confirmDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0, elevation: 0 },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
});
