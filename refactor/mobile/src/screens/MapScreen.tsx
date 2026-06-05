import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiCustomersMap } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { CustomerMarker } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { STATUS_COLOR } from '../components/mapHtml';
import { fonts, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

// Default area Kab. Bandung (Kiangroke) bila tak ada titik.
const DEFAULT_CENTER = { lat: -7.0215, lng: 107.581 };

export default function MapScreen() {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { t: tr } = useTranslation();
  const [markers, setMarkers] = useState<CustomerMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMarkers(await apiCustomersMap());
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const center = useMemo(() => {
    if (markers.length === 0) return DEFAULT_CENTER;
    const lat = markers.reduce((a, m) => a + m.lat, 0) / markers.length;
    const lng = markers.reduce((a, m) => a + m.lng, 0) / markers.length;
    return { lat, lng };
  }, [markers]);

  const counts = useMemo(() => {
    const c = { lunas: 0, belum: 0, none: 0 };
    markers.forEach((m) => (c[m.status] += 1));
    return c;
  }, [markers]);

  if (loading) return <Loading label={tr('map_loading')} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (markers.length === 0)
    return <EmptyState label={tr('map_empty')} />;

  return (
    <View style={s.container}>
      <LeafletMap markers={markers} center={center} zoom={15} />
      <View style={s.legend}>
        <LegendItem s={s} color={STATUS_COLOR.lunas} label={tr('map_legend_paid', { count: counts.lunas })} />
        <LegendItem s={s} color={STATUS_COLOR.belum} label={tr('map_legend_unpaid', { count: counts.belum })} />
        <LegendItem s={s} color={STATUS_COLOR.none} label={tr('map_legend_no_billing', { count: counts.none })} />
      </View>
    </View>
  );
}

function LegendItem({ s, color, label }: { s: ReturnType<typeof createStyles>; color: string; label: string }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{label}</Text>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    legend: {
      position: 'absolute',
      left: 12,
      bottom: 12,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      padding: 12,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.float,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    legendText: { fontSize: 12, color: t.text, fontFamily: fonts.medium },
  });
