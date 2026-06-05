import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import id from './locales/id.json';
import en from './locales/en.json';

export type Language = 'id' | 'en';
export const LANG_KEY = 'meterair_language';

export async function getInitialLanguage(): Promise<Language> {
  try {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved === 'id' || saved === 'en') return saved;
  } catch {}
  const locale = Localization.getLocales()[0]?.languageCode ?? 'en';
  return locale.startsWith('id') ? 'id' : 'en';
}

export async function initI18n() {
  const lng = await getInitialLanguage();
  await i18n.use(initReactI18next).init({
    resources: { id: { translation: id }, en: { translation: en } },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
  return lng;
}

export { i18n };
export default i18n;
