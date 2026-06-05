import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiAnomalies } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { Anomaly } from '../types';
import { fonts, pastels, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Props = NativeStackScreenProps<RootStackParamList, 'Anomaly'>;

const TYPE_ICON: Record<Anomaly['type'], string> = {
  lonjakan: 'trending-up',
  nol:      'water-off',
  turun:    'trending-down',
};

export default function AnomalyScreen({ navigation }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const s = useMemo(() => createStyles(t), [t]);

  const TYPE_LABEL: Record<Anomaly['type'], string> = {
    lonjakan: tr('anomaly_type_spike'),
    nol:      tr('anomaly_type_zero'),
    turun:    tr('anomaly_type_drop'),
  };

  const [items, setItems]     = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await apiAnomalies(100)); }
    catch (e) { setError(apiErrorMessage(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading label={tr('anomaly_loading')} />;
  if (error)   return <ErrorState message={error} onRetry={load} />;
  if (items.length === 0) return <EmptyState label={tr('anomaly_empty')} illustration="anomaly" />;

  const tinggi = items.filter(i => i.severity === 'tinggi').length;
  const sedang = items.filter(i => i.severity === 'sedang').length;

  return (
    <View style={s.container}>
      <View style={s.summaryRow}>
        <View style={[s.summaryChip, { backgroundColor: pastels.peach.bg, borderColor: pastels.peach.fg + '55' }]}>
          <Ionicons name="flame" size={13} color={pastels.peach.fg} />
          <Text style={[s.summaryText, { color: pastels.peach.fg }]}>{tinggi} {tr('anomaly_severity_high')}</Text>
        </View>
        <View style={[s.summaryChip, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
          <Ionicons name="warning-outline" size={13} color="#B45309" />
          <Text style={[s.summaryText, { color: '#B45309' }]}>{sedang} {tr('anomaly_severity_medium')}</Text>
        </View>
        <Text style={s.summaryTotal}>{tr('anomaly_summary', { count: items.length })}</Text>
      </View>

      <FlatList
        keyboardShouldPersistTaps="handled"
        data={items}
        keyExtractor={(it) => String(it.customerId)}
        contentContainerStyle={{ padding: 14, gap: 10 }}
        renderItem={({ item }) => {
          const isHigh     = item.severity === 'tinggi';
          const accentColor = isHigh ? pastels.peach.fg : '#B45309';
          const accentBg    = isHigh ? pastels.peach.bg : '#FEF3C7';
          return (
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CustomerDetail', { id: item.customerId })}
            >
              <View style={[s.accentBar, { backgroundColor: accentColor }]} />
              <View style={[s.iconCircle, { backgroundColor: accentBg }]}>
                <MaterialCommunityIcons name={TYPE_ICON[item.type] as any} size={22} color={accentColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.cardHead}>
                  <Text style={s.nama} numberOfLines={1}>{item.nama ?? `ID ${item.customerId}`}</Text>
                  <View style={[s.badge, { backgroundColor: accentBg, borderColor: accentColor + '55' }]}>
                    <Text style={[s.badgeText, { color: accentColor }]}>{TYPE_LABEL[item.type]}</Text>
                  </View>
                </View>
                <Text style={s.alasan} numberOfLines={2}>{item.alasan}</Text>
                <View style={s.statRow}>
                  <View style={s.statChip}>
                    <Ionicons name="speedometer-outline" size={11} color={t.muted} />
                    <Text style={s.statText}>{tr('anomaly_label_latest')} <Text style={[s.statBold, { color: accentColor }]}>{item.latest} m³</Text></Text>
                  </View>
                  <View style={s.statChip}>
                    <Ionicons name="analytics-outline" size={11} color={t.muted} />
                    <Text style={s.statText}>{tr('anomaly_label_average')} {item.rata} m³</Text>
                  </View>
                  {item.rasio > 0 && (
                    <View style={[s.ratioBadge, { backgroundColor: accentBg }]}>
                      <Text style={[s.ratioText, { color: accentColor }]}>{item.rasio}×</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={t.muted} style={{ marginTop: 2 }} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    summaryRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 14, paddingTop: 12, paddingBottom: 2,
    },
    summaryChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 5,
      borderRadius: radius.pill, borderWidth: 1,
    },
    summaryText: { fontFamily: fonts.bold, fontSize: 12 },
    summaryTotal: { flex: 1, textAlign: 'right', color: t.muted, fontFamily: fonts.medium, fontSize: 12 },
    card: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 10,
      backgroundColor: t.surface, borderRadius: radius.lg,
      borderWidth: 1, borderColor: t.border,
      overflow: 'hidden', paddingRight: 12, paddingVertical: 12,
      ...shadow.soft,
    },
    accentBar: { width: 4, alignSelf: 'stretch' },
    iconCircle: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
    nama: { fontFamily: fonts.bold, color: t.text, fontSize: 14, flex: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1 },
    badgeText: { fontSize: 11, fontFamily: fonts.extrabold },
    alasan: { color: t.muted, fontSize: 12, marginTop: 4, fontFamily: fonts.regular, lineHeight: 17 },
    statRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
    statChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    statText: { color: t.muted, fontSize: 11, fontFamily: fonts.regular },
    statBold: { fontFamily: fonts.bold },
    ratioBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    ratioText: { fontFamily: fonts.extrabold, fontSize: 11 },
  });
