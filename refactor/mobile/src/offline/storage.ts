import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValueStore } from './types';

// Adapter konkret memakai AsyncStorage. Logika queue/sync tidak bergantung
// langsung padanya (di-inject sebagai KeyValueStore) agar mudah diuji.
export const asyncStore: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};
