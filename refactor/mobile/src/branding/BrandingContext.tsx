import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const BRANDING_URL = 'https://meterair.online/api/public/branding';
const BRANDING_TS_KEY = 'meterair_branding_ts';
const BRANDING_DIR = `${FileSystem.documentDirectory}branding/`;

interface BrandingState {
  logoUri: string | null;
  logoWhiteUri: string | null;
  iconUri: string | null;
  appName: string;
}

const DEFAULT: BrandingState = {
  logoUri: null,
  logoWhiteUri: null,
  iconUri: null,
  appName: 'Meter Air',
};

const BrandingContext = createContext<BrandingState>(DEFAULT);

export function useBranding(): BrandingState {
  return useContext(BrandingContext);
}

// SVG tidak bisa dimuat oleh react-native Image — skip, gunakan fallback drawable.
function isRasterUrl(url: string): boolean {
  return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(url);
}

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(BRANDING_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BRANDING_DIR, { intermediates: true });
  }
}

async function downloadToCache(url: string, filename: string): Promise<string | null> {
  if (!isRasterUrl(url)) return null;
  try {
    const dest = BRANDING_DIR + filename;
    const { uri } = await FileSystem.downloadAsync(url, dest);
    return uri;
  } catch {
    return null;
  }
}

async function getCachedUri(filename: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(BRANDING_DIR + filename);
    return info.exists ? info.uri : null;
  } catch {
    return null;
  }
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BrandingState>(DEFAULT);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await ensureDir();

      // Fetch manifest — public, tanpa auth
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      let manifest: {
        app_name: string;
        logo_url: string;
        logo_white_url: string;
        icon_url: string;
        updated_at: number;
      } | null = null;

      try {
        const res = await fetch(BRANDING_URL, { signal: ctrl.signal });
        clearTimeout(timer);
        if (res.ok) manifest = await res.json();
      } catch {
        clearTimeout(timer);
      }

      if (cancelled) return;

      if (manifest) {
        const storedTs = await AsyncStorage.getItem(BRANDING_TS_KEY).catch(() => null);
        const needsDownload = storedTs !== String(manifest.updated_at);

        let logoUri: string | null;
        let logoWhiteUri: string | null;
        let iconUri: string | null;

        if (needsDownload) {
          [logoUri, logoWhiteUri, iconUri] = await Promise.all([
            downloadToCache(manifest.logo_url, 'logo.png'),
            downloadToCache(manifest.logo_white_url, 'logo-white.png'),
            downloadToCache(manifest.icon_url, 'icon.png'),
          ]);
          await AsyncStorage.setItem(BRANDING_TS_KEY, String(manifest.updated_at)).catch(() => {});
        } else {
          // Cache masih valid — muat dari disk
          [logoUri, logoWhiteUri, iconUri] = await Promise.all([
            getCachedUri('logo.png'),
            getCachedUri('logo-white.png'),
            getCachedUri('icon.png'),
          ]);
        }

        if (!cancelled) {
          setState({ logoUri, logoWhiteUri, iconUri, appName: manifest.app_name });
        }
      } else {
        // Network gagal — coba load dari cache disk
        const [logoUri, logoWhiteUri, iconUri] = await Promise.all([
          getCachedUri('logo.png'),
          getCachedUri('logo-white.png'),
          getCachedUri('icon.png'),
        ]);
        if (!cancelled && (logoUri || logoWhiteUri || iconUri)) {
          setState((prev) => ({ ...prev, logoUri, logoWhiteUri, iconUri }));
        }
      }
    }

    load().catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <BrandingContext.Provider value={state}>
      {children}
    </BrandingContext.Provider>
  );
}
