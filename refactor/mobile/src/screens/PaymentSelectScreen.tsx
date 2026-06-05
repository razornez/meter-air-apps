import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiPaymentMethods } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { PaymentMethod } from '../types';
import { BrandLogo } from '../components/BrandLogo';
import { colors } from '../theme';
import { ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSelect'>;

const GROUP_ORDER = ['cash', 'ewallet', 'bank_static', 'midtrans'];

export default function PaymentSelectScreen({ route, navigation }: Props) {
  const { t: tr } = useTranslation();
  const { noFaktur, amount, customerName } = route.params;
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GROUP_LABEL: Record<string, string> = {
    cash: tr('payment_select_group_cash'),
    ewallet: tr('payment_select_group_ewallet'),
    bank_static: tr('payment_select_group_bank'),
    midtrans: tr('payment_select_group_gateway'),
  };
  const GROUP_DESC: Record<string, string> = {
    cash: tr('payment_select_desc_cash'),
    ewallet: tr('payment_select_desc_ewallet'),
    bank_static: tr('payment_select_desc_bank'),
    midtrans: tr('payment_select_desc_gateway'),
  };

  useEffect(() => {
    apiPaymentMethods()
      .then(setMethods)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, PaymentMethod[]> = {};
    methods.forEach((m) => {
      if (!g[m.type]) g[m.type] = [];
      g[m.type].push(m);
    });
    return GROUP_ORDER.filter((k) => g[k]?.length).map((k) => ({
      type: k,
      items: g[k],
    }));
  }, [methods]);

  function onSelect(method: PaymentMethod) {
    if (method.type === 'cash') {
      navigation.navigate('CashPayment', { noFaktur, amount });
    } else if (method.type === 'ewallet' || method.type === 'bank_static') {
      navigation.navigate('AccountPayment', { noFaktur, amount, method });
    } else {
      // midtrans: lewat AccountPaymentScreen yg buat snap token → buka WebView
      navigation.navigate('AccountPayment', { noFaktur, amount, method });
    }
  }

  if (loading) return <Loading label={tr('payment_select_loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => { setLoading(true); setError(null); apiPaymentMethods().then(setMethods).catch((e) => setError(apiErrorMessage(e))).finally(() => setLoading(false)); }} />;

  return (
    <View style={s.container}>
      {/* Header tagihan */}
      <LinearGradient colors={['#1565C0', '#0D47A1']} style={s.header}>
        <Text style={s.headerLabel}>{tr('payment_select_header_label')}</Text>
        <Text style={s.headerAmount}>Rp {amount.toLocaleString('id-ID')}</Text>
        {!!customerName && <Text style={s.headerCustomer}>{customerName}</Text>}
        <Text style={s.headerFaktur}>{noFaktur}</Text>
      </LinearGradient>

      <FlatList
        data={grouped}
        keyExtractor={(g) => g.type}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item: group }) => (
          <View style={s.group}>
            <View style={s.groupHeader}>
              <Text style={s.groupTitle}>{GROUP_LABEL[group.type]}</Text>
              <Text style={s.groupDesc}>{GROUP_DESC[group.type]}</Text>
            </View>
            {group.items.map((method) => (
              <TouchableOpacity
                key={method.code}
                style={s.row}
                onPress={() => onSelect(method)}
                activeOpacity={0.75}
              >
                <BrandLogo
                  logoBg={method.logoBg}
                  logoText={method.logoText}
                  logoUrl={method.logoUrl}
                  size={48}
                />
                <View style={s.rowText}>
                  <Text style={s.rowName}>{method.name}</Text>
                  {!!method.accountNumber && (
                    <Text style={s.rowSub}>{method.accountNumber}</Text>
                  )}
                  {!!method.accountNumber && !!method.accountName && (
                    <Text style={s.rowOwner}>{tr('payment_select_owner_prefix')} {method.accountName}</Text>
                  )}
                  {!method.accountNumber && !!method.instructions && (
                    <Text style={s.rowSub} numberOfLines={1}>{method.instructions}</Text>
                  )}
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F9' },
  header: { padding: 24, paddingBottom: 28 },
  headerLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  headerAmount: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  headerCustomer: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 8, fontWeight: '600' },
  headerFaktur: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  group: { marginTop: 20, paddingHorizontal: 16 },
  groupHeader: { marginBottom: 10 },
  groupTitle: { fontSize: 13, fontWeight: '800', color: '#374151', letterSpacing: 0.3 },
  groupDesc: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowText: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  rowSub: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  rowOwner: { fontSize: 11, color: '#9CA3AF', marginTop: 1, fontStyle: 'italic' },
  chevron: { fontSize: 22, color: '#D1D5DB', fontWeight: '300' },
});
