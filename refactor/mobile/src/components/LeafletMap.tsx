import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildMapHtml } from './mapHtml';
import { LeafletMapProps } from './leafletMapTypes';

// Implementasi NATIVE (iOS/Android) — Leaflet di dalam WebView.
// (Metro memilih LeafletMap.web.tsx untuk platform web.)
export function LeafletMap({
  markers,
  center,
  zoom,
  editable,
  selected,
  officerPos,
  onPick,
}: LeafletMapProps) {
  const html = buildMapHtml(markers, { center, zoom, editable, selected, officerPos });
  return (
    <View style={styles.fill}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.fill}
        onMessage={(e) => {
          try {
            const d = JSON.parse(e.nativeEvent.data);
            if (d?.type === 'pick' && onPick) onPick({ lat: d.lat, lng: d.lng });
          } catch {
            /* abaikan pesan tak dikenal */
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
