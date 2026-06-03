// Item antrian catatan meter yang menunggu dikirim ke server.
export interface PendingReading {
  id: string; // id lokal (unik di perangkat)
  customerId: number;
  customerNama: string | null;
  meterBaru: number;
  catatan?: string;
  photoUri?: string | null;
  createdAt: string; // ISO
}

// Abstraksi penyimpanan key-value (mudah di-mock saat test).
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
