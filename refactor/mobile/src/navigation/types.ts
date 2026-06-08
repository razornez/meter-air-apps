import { MeterInfo } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Home: undefined;
  About: undefined;
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
  // Sprint 8 (anomali)
  Anomaly: undefined;
  // Sprint 9 (worklist)
  Worklist: undefined;
  // Sprint 10
  Tunggakan: undefined;
  // Sprint 11
  Kinerja: undefined;
  // Sprint 12
  // snapUrl = redirectUrl dari Midtrans API (sudah termasuk environment sandbox/production)
  PaymentWebView: { noFaktur: string; snapToken: string; snapUrl?: string };
  CustomerCard: { id: number };
  // Multi-payment screens
  PaymentSelect: { noFaktur: string; amount: number; customerName: string | null };
  CashPayment: { noFaktur: string; amount: number };
  AccountPayment: { noFaktur: string; amount: number; method: import('../types').PaymentMethod };
};
