import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiPaymentMethods, apiPay } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { PaymentMethod } from '../types';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  noFaktur: string | null;
  totalAmount: number;
  onClose: () => void;
  // Callback setelah proses berhasil, dengan data respons
  onResult: (result: { type: string; token?: string; accountNumber?: string; accountName?: string; instructions?: string; amount?: number }) => void;
}

export default function PaymentMethodSheet({
  visible,
  noFaktur,
  totalAmount,
  onClose,
  onResult,
}: Props) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoadingMethods(true);
    apiPaymentMethods()
      .then(setMethods)
      .catch(() => {/* abaikan, tampil kosong */})
      .finally(() => setLoadingMethods(false));
  }, [visible]);

  async function onSelect(method: PaymentMethod) {
    if (!noFaktur) return;
    setPaying(method.code);
    try {
      const res = await apiPay(noFaktur, method.code);

      if (res.alreadyPaid) {
        Alert.alert('Sudah Lunas', 'Faktur ini sudah terbayar.');
        onClose();
        return;
      }

      onResult({
        type: res.type,
        token: res.token ?? undefined,
        accountNumber: res.accountNumber ?? undefined,
        accountName: res.accountName ?? undefined,
        instructions: res.instructions ?? undefined,
        amount: res.amount,
      });
      onClose();
    } catch (e) {
      Alert.alert('Gagal', apiErrorMessage(e));
    } finally {
      setPaying(null);
    }
  }

  const typeLabel: Record<string, string> = {
    cash: 'Tunai',
    midtrans: 'Digital',
    transfer: 'Transfer',
  };

  const typeColor: Record<string, string> = {
    cash: '#2E7D32',
    midtrans: '#1565C0',
    transfer: '#6A1B9A',
  };

  // Kelompokkan per type
  const grouped: Record<string, PaymentMethod[]> = {};
  methods.forEach((m) => {
    if (!grouped[m.type]) grouped[m.type] = [];
    grouped[m.type].push(m);
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Pilih Metode Bayar</Text>
        <Text style={styles.sub}>
          Total: <Text style={styles.amount}>Rp {totalAmount.toLocaleString('id-ID')}</Text>
        </Text>

        {loadingMethods ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(grouped).map(([type, items]) => (
              <View key={type}>
                <Text style={[styles.groupLabel, { color: typeColor[type] ?? colors.muted }]}>
                  {typeLabel[type] ?? type}
                </Text>
                {items.map((m) => {
                  const isBusy = paying === m.code;
                  return (
                    <TouchableOpacity
                      key={m.code}
                      style={[styles.row, isBusy && { opacity: 0.6 }]}
                      onPress={() => onSelect(m)}
                      disabled={!!paying}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.icon}>{m.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{m.name}</Text>
                        {!!m.instructions && (
                          <Text style={styles.hint} numberOfLines={1}>
                            {m.instructions}
                          </Text>
                        )}
                        {!!m.accountNumber && (
                          <Text style={styles.hint}>{m.accountNumber} · {m.accountName}</Text>
                        )}
                      </View>
                      {isBusy
                        ? <ActivityIndicator color={colors.primary} size="small" />
                        : <Text style={styles.chevron}>›</Text>
                      }
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1A2530', marginBottom: 4 },
  sub: { color: '#6B7A8D', fontSize: 13, marginBottom: 16 },
  amount: { color: colors.danger, fontWeight: '800' },
  center: { height: 80, justifyContent: 'center', alignItems: 'center' },
  groupLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', marginTop: 12, marginBottom: 6,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 12, gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#E8EEF4',
  },
  icon: { fontSize: 28, width: 36, textAlign: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#1A2530' },
  hint: { fontSize: 12, color: '#6B7A8D', marginTop: 2 },
  chevron: { color: '#9EA8B3', fontSize: 22 },
});
