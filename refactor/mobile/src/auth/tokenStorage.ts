import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Penyimpanan token lintas-platform:
// - Native (iOS/Android): expo-secure-store (Keychain/Keystore — aman).
// - Web: AsyncStorage (localStorage) karena SecureStore tak ada di web.
//   (Untuk web produksi, sebaiknya pakai cookie httpOnly; ini cukup utk uji.)
const isWeb = Platform.OS === 'web';

export async function getToken(key: string): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
}

export async function setToken(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function deleteToken(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
