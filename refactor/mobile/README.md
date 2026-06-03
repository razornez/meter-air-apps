# Meter Air — Mobile (Expo / React Native)

Aplikasi petugas pencatat meter air. Terhubung ke backend NestJS (`refactor/api`)
yang menembak database MySQL `pdam`.

## Fitur (Fase 1)

- Login (JWT, token disimpan di `expo-secure-store`)
- Scan QR/barcode meter pelanggan (`expo-camera`) + input manual ID
- Lihat meter terakhir & info pelanggan
- Hitung tagihan tarif berjenjang (preview real-time dari API)
- Foto angka meter (kamera) + simpan catatan meter → buat faktur

## Menjalankan (dev)

1. Pastikan backend jalan: `cd ../api && npm run start:dev` (port 3000).
2. Set alamat API (penting saat pakai HP fisik / emulator):

   ```bash
   # Emulator Android (host = 10.0.2.2) sudah jadi default.
   # Untuk HP fisik, pakai IP LAN PC:
   #   buat file .env di folder ini berisi:
   EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
   ```

3. Jalankan:

   ```bash
   npm install
   npx expo start
   ```

   Lalu scan QR di terminal pakai aplikasi **Expo Go**, atau tekan `a` untuk
   emulator Android.

> Kamera tidak berfungsi di Expo Go web; gunakan perangkat/emulator.

## Struktur

```
src/
├── config.ts            # alamat API (EXPO_PUBLIC_API_URL)
├── theme.ts             # warna & format rupiah
├── types.ts             # tipe respons API
├── api/
│   ├── client.ts        # instance axios + interceptor token
│   └── services.ts      # fungsi panggilan endpoint
├── auth/AuthContext.tsx # state login + SecureStore
├── navigation/types.ts  # tipe rute
└── screens/
    ├── LoginScreen.tsx
    ├── HomeScreen.tsx
    ├── ScanScreen.tsx
    └── ReadingScreen.tsx
```

## Catatan

- QR meter idealnya mengkodekan **id pelanggan** atau **barcode** pelanggan.
  Endpoint `/customers/resolve/:code` mencoba barcode dulu lalu fallback ke id,
  sehingga tetap jalan walau kolom `customer.barcode` belum diisi.
