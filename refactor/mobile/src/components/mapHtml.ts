// Pembuat HTML peta Leaflet (murni → mudah diuji). Render via WebView (native)
// atau <iframe srcDoc> (web). Tile OpenStreetMap (gratis, tanpa API key).

export type MarkerStatus = 'lunas' | 'belum' | 'none';

export interface MapMarker {
  id: number;
  nama: string | null;
  lat: number;
  lng: number;
  status: MarkerStatus;
}

export interface MapOptions {
  center: { lat: number; lng: number };
  zoom?: number;
  editable?: boolean; // tekan peta untuk menaruh pin → kirim {type:'pick'}
  selected?: { lat: number; lng: number } | null; // pin awal (mode edit)
}

export const STATUS_COLOR: Record<MarkerStatus, string> = {
  lunas: '#2E7D32',
  belum: '#C62828',
  none: '#9E9E9E',
};

const STATUS_LABEL: Record<MarkerStatus, string> = {
  lunas: 'Lunas',
  belum: 'Belum bayar',
  none: 'Belum ada tagihan',
};

export function buildMapHtml(
  markers: MapMarker[],
  opts: MapOptions,
): string {
  // Aman untuk disisipkan dalam <script>: cegah pemutusan tag.
  const data = JSON.stringify(markers).replace(/</g, '\\u003c');
  const colors = JSON.stringify(STATUS_COLOR);
  const labels = JSON.stringify(STATUS_LABEL);
  const center = JSON.stringify(opts.center);
  const selected = JSON.stringify(opts.selected ?? null);
  const zoom = opts.zoom ?? 14;
  const editable = opts.editable ? 'true' : 'false';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0}</style>
</head><body><div id="map"></div>
<script>
  var MARKERS = ${data};
  var COLORS = ${colors};
  var LABELS = ${labels};
  var CENTER = ${center};
  var SELECTED = ${selected};
  var EDITABLE = ${editable};

  function send(obj){
    var s = JSON.stringify(obj);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent !== window) window.parent.postMessage(s, '*');
  }

  var map = L.map('map').setView([CENTER.lat, CENTER.lng], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap'
  }).addTo(map);

  var bounds = [];
  MARKERS.forEach(function(m){
    var color = COLORS[m.status] || COLORS.none;
    L.circleMarker([m.lat, m.lng], {
      radius: 9, color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.95
    }).addTo(map)
      .bindPopup('<b>'+(m.nama||'-')+'</b><br/>'+(LABELS[m.status]||'')
        +'<br/><small>ID '+m.id+'</small>');
    bounds.push([m.lat, m.lng]);
  });
  if (bounds.length > 1 && !EDITABLE) map.fitBounds(bounds, { padding: [30,30] });

  // Mode edit: tekan/seret untuk menaruh pin.
  if (EDITABLE) {
    var pin = null;
    function place(latlng){
      if (pin) pin.setLatLng(latlng);
      else {
        pin = L.marker(latlng, { draggable: true }).addTo(map);
        pin.on('dragend', function(ev){
          var p = ev.target.getLatLng(); send({type:'pick', lat:p.lat, lng:p.lng});
        });
      }
      send({type:'pick', lat: latlng.lat, lng: latlng.lng});
    }
    if (SELECTED) { place(SELECTED); map.setView([SELECTED.lat, SELECTED.lng], ${zoom}); }
    map.on('click', function(e){ place(e.latlng); });
  }
</script>
</body></html>`;
}
