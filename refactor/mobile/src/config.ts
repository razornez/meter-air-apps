import { Platform } from 'react-native';

// URL backend NestJS. Bisa di-override lewat env EXPO_PUBLIC_API_URL.
// Default cerdas per platform agar mudah dijalankan lokal:
//  - Web (browser)    : http://localhost:4000/api
//  - Emulator Android : http://10.0.2.2:4000/api  (10.0.2.2 = host PC dari emulator)
//  - HP fisik (iPhone): WAJIB set env ke IP LAN PC, mis.
//      EXPO_PUBLIC_API_URL=http://192.168.1.10:4000/api
const DEFAULT_API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:4000/api'
    : 'http://10.0.2.2:4000/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
