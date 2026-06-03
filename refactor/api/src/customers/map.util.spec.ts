import { mapCustomerMarkerRow, markerStatus } from './map.util';

describe('markerStatus', () => {
  it('tanpa faktur → none', () => {
    expect(markerStatus(null, null)).toBe('none');
  });
  it('faktur lunas → lunas', () => {
    expect(markerStatus('FA/1', 1)).toBe('lunas');
    expect(markerStatus('FA/1', '1')).toBe('lunas');
  });
  it('faktur belum lunas → belum', () => {
    expect(markerStatus('FA/1', 0)).toBe('belum');
  });
});

describe('mapCustomerMarkerRow', () => {
  it('cast koordinat ke number & derive status', () => {
    expect(
      mapCustomerMarkerRow({
        id: '200212011',
        nama: 'DENI',
        alamat: 'Kiangroke',
        lat: '-7.0205000',
        lng: '107.5810000',
        isLunas: 0,
        noFaktur: 'FA/BD/26/06/1',
      }),
    ).toEqual({
      id: 200212011,
      nama: 'DENI',
      alamat: 'Kiangroke',
      lat: -7.0205,
      lng: 107.581,
      status: 'belum',
    });
  });
});
