import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { apiCustomersMap } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { CustomerMarker } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { STATUS_COLOR } from '../components/mapHtml';
import { fonts, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

const DEFAULT_CENTER = { lat: -7.0215, lng: 107.581 };

export default function MapScreen() {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { t: tr } = useTranslation();
  const [markers, setMarkers] = useState<CustomerMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officerPos, setOfficerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setMarkers(await apiCustomersMap()); }
    catch (e) { setError(apiErrorMessage(e)); }
    finally { setLoading(false); }
  }, []);

  async function locateOfficer() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setOfficerPos({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch { /* GPS tidak tersedia */ }
    finally { setLocating(false); }
  }

  useEffect(() => { load(); locateOfficer(); }, []);

  const center = useMemo(() => {
    if (officerPos) return officerPos;
    if (markers.length === 0) return DEFAULT_CENTER;
    const lat = markers.reduce((a, m) => a + m.lat, 0) / markers.length;
    const lng = markers.reduce((a, m) => a + m.lng, 0) / markers.length;
    return { lat, lng };
  }, [markers, officerPos]);

  const counts = useMemo(() => {
    const c = { lunas: 0, belum: 0, none: 0 };
    markers.forEach((m) => (c[m.status] += 1));
    return c;
  }, [markers]);

  if (loading) return <Loading label={tr('map_loading')} />;
  if (error)   return <ErrorState message={error} onRetry={load} />;
  if (markers.length === 0) return <EmptyState label={tr('map_empty')} />;

  return (
    <View style={s.container}>
      <LeafletMap markers={markers} center={center} zoom={15} officerPos={officerPos} />

      <View style={s.legend}>
        <LegendItem s={s} color={STATUS_COLOR.lunas} label={tr('map_legend_paid',       { count: counts.lunas })} />
        <LegendItem s={s} color={STATUS_COLOR.belum} label={tr('map_legend_unpaid',     { count: counts.belum })} />
        <LegendItem s={s} color={STATUS_COLOR.none}  label={tr('map_legend_no_billing', { count: counts.none })} />
        {officerPos && (
          <View style={s.legendItem}>
            <View style={[s.dot, s.dotOfficer]} />
            <Text style={s.legendText}>Posisi Anda</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[s.locBtn, locating && { opacity: 0.6 }]}
        onPress={locateOfficer}
        disabled={locating}
        activeOpacity={0.8}
      >
        <Ionicons name={locating ? 'hourglass-outline' : 'navigate'} size={20} color="#fff" />
      </TouchableOpacity>
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
      position: 'absolute', left: 12, bottom: 16,
      backgroundColor: t.surface, borderRadius: radius.md,
      padding: 12, borderWidth: 1, borderColor: t.border, ...shadow.float,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    dotOfficer: { backgroundColor: '#1565C0', borderWidth: 2, borderColor: '#fff' },
    legendText: { fontSize: 12, color: t.text, fontFamily: fonts.medium },
    locBtn: {
      position: 'absolute', right: 14, bottom: 16,
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center',
      ...shadow.glow,
    },
  });
