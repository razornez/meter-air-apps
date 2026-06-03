// URL backend NestJS.
// - Emulator Android: host PC = http://10.0.2.2:3000/api
// - Perangkat fisik   : pakai IP LAN PC, mis. http://192.168.1.10:3000/api
//   set lewat env: EXPO_PUBLIC_API_URL=http://192.168.1.10:3000/api
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api';
