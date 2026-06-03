import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiCustomersMap } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { CustomerMarker } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { STATUS_COLOR } from '../components/mapHtml';
import { colors } from '../theme';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

// Default area Kab. Bandung (Kiangroke) bila tak ada titik.
const DEFAULT_CENTER = { lat: -7.0215, lng: 107.581 };

export default function MapScreen() {
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

  if (loading) return <Loading label="Memuat peta…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (markers.length === 0)
    return (
      <EmptyState label="Belum ada pelanggan dengan koordinat. Atur lokasi dari detail pelanggan." />
    );

  return (
    <View style={styles.container}>
      <LeafletMap
        markers={markers}
        center={center}
        zoom={15}
      />
      <View style={styles.legend}>
        <LegendItem color={STATUS_COLOR.lunas} label={`Lunas (${counts.lunas})`} />
        <LegendItem color={STATUS_COLOR.belum} label={`Belum (${counts.belum})`} />
        <LegendItem color={STATUS_COLOR.none} label={`Tanpa tagihan (${counts.none})`} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  legend: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 12, color: colors.text },
});
