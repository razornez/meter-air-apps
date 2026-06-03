/// <reference lib="dom" />
import React, { useEffect } from 'react';
import { buildMapHtml } from './mapHtml';
import { LeafletMapProps } from './leafletMapTypes';

// Implementasi WEB — Leaflet di dalam <iframe>. Pesan "pick" dikirim lewat
// window.parent.postMessage dan didengar di sini.
export function LeafletMap({
  markers,
  center,
  zoom,
  editable,
  selected,
  onPick,
}: LeafletMapProps) {
  const html = buildMapHtml(markers, { center, zoom, editable, selected });

  useEffect(() => {
    function handler(e: MessageEvent) {
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d?.type === 'pick' && onPick) onPick({ lat: d.lat, lng: d.lng });
      } catch {
        /* abaikan */
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onPick]);

  return (
    <iframe
      title="peta"
      srcDoc={html}
      style={{ border: 0, width: '100%', height: '100%' }}
    />
  );
}
