import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiAnomalies } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { Anomaly } from '../types';
import { fonts, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Anomaly'>;

export default function AnomalyScreen({ navigation }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const s = useMemo(() => createStyles(t), [t]);

  const TYPE_LABEL: Record<Anomaly['type'], string> = {
    lonjakan: tr('anomaly_type_spike'),
    nol: tr('anomaly_type_zero'),
    turun: tr('anomaly_type_drop'),
  };
  const [items, setItems] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sevColor = (sev: Anomaly['severity']) => (sev === 'tinggi' ? t.danger : t.warning);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await apiAnomalies(100));
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading label={tr('anomaly_loading')} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (items.length === 0) return <EmptyState label={tr('anomaly_empty')} illustration='anomaly' />;

  return (
    <View style={s.container}>
      <Text style={s.summary}>{tr('anomaly_summary', { count: items.length })}</Text>
      <FlatList keyboardShouldPersistTaps="handled"
        data={items}
        keyExtractor={(it) => String(it.customerId)}
        contentContainerStyle={{ padding: 14, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CustomerDetail', { id: item.customerId })}
          >
            <View style={[s.sevBar, { backgroundColor: sevColor(item.severity) }]} />
            <View style={{ flex: 1, padding: 14 }}>
              <View style={s.head}>
                <Text style={s.nama} numberOfLines={1}>{item.nama ?? `ID ${item.customerId}`}</Text>
                <View style={[s.badge, { backgroundColor: sevColor(item.severity) + '22' }]}>
                  <Text style={[s.badgeText, { color: sevColor(item.severity) }]}>{TYPE_LABEL[item.type]}</Text>
                </View>
              </View>
              <Text style={s.alasan}>{item.alasan}</Text>
              <Text style={s.meta}>
                {tr('anomaly_meta', { latest: item.latest, avg: item.rata })}
                {item.rasio > 0 ? ` · ${item.rasio}×` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    summary: { paddingHorizontal: 16, paddingTop: 14, color: t.muted, fontSize: 13, fontFamily: fonts.medium },
    row: {
      flexDirection: 'row',
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      overflow: 'hidden',
      ...shadow.soft,
    },
    sevBar: { width: 5, alignSelf: 'stretch' },
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    nama: { fontFamily: fonts.bold, color: t.text, fontSize: 15, flex: 1 },
    badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, marginLeft: 8 },
    badgeText: { fontSize: 11, fontFamily: fonts.extrabold },
    alasan: { color: t.text, fontSize: 13, marginTop: 5, fontFamily: fonts.regular },
    meta: { color: t.muted, fontSize: 12, marginTop: 5, fontFamily: fonts.regular },
    bold: { fontFamily: fonts.bold, color: t.text },
  });

