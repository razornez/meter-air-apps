import { buildMapHtml, MapMarker, STATUS_COLOR } from './mapHtml';

const markers: MapMarker[] = [
  { id: 1, nama: 'DENI', lat: -7.02, lng: 107.58, status: 'lunas' },
  { id: 2, nama: 'AGUS', lat: -7.03, lng: 107.59, status: 'belum' },
];

describe('buildMapHtml', () => {
  it('memuat Leaflet, nama marker, dan warna status', () => {
    const html = buildMapHtml(markers, { center: { lat: -7, lng: 107 } });
    expect(html).toContain('leaflet');
    expect(html).toContain('DENI');
    expect(html).toContain(STATUS_COLOR.lunas);
    expect(html).toContain(STATUS_COLOR.belum);
  });

  it('mode editable mengaktifkan flag EDITABLE', () => {
    const html = buildMapHtml([], { center: { lat: -7, lng: 107 }, editable: true });
    expect(html).toContain('var EDITABLE = true');
  });

  it('non-editable → flag EDITABLE false', () => {
    const html = buildMapHtml([], { center: { lat: -7, lng: 107 } });
    expect(html).toContain('var EDITABLE = false');
  });

  it('menetralkan "<" agar tidak memutus tag script', () => {
    const html = buildMapHtml(
      [{ id: 3, nama: 'X</script>', lat: -7, lng: 107, status: 'none' }],
      { center: { lat: -7, lng: 107 } },
    );
    expect(html).not.toContain('X</script>');
  });
});
