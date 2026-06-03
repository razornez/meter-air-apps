import { MeterInfo } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Scan: undefined;
  Reading: { meterInfo: MeterInfo };
  // Fase 2
  CustomersList: undefined;
  CustomerDetail: { id: number };
  FakturList: { customerId?: number } | undefined;
  FakturDetail: { noFaktur: string };
  // Sprint 4
  Reports: undefined;
  MasterData: undefined;
  // Sprint 7 (peta)
  Map: undefined;
  SetLocation: {
    id: number;
    nama: string | null;
    lat: number | null;
    lng: number | null;
  };
};
