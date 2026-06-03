import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, lightTheme, themes } from './theme';

const STORAGE_KEY = 'tirta:themeMode';

type ThemeCtxValue = {
  theme: Theme;
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeCtx = createContext<ThemeCtxValue>({
  theme: lightTheme,
  mode: 'light',
  toggle: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'dark' || v === 'light') setModeState(v);
      })
      .catch(() => {});
  }, []);

  const persist = (m: ThemeMode) => {
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    persist(m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      persist(next);
      return next;
    });
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme: themes[mode], mode, toggle, setMode }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = (): Theme => useContext(ThemeCtx).theme;

export function useThemeMode() {
  const { mode, toggle, setMode } = useContext(ThemeCtx);
  return { mode, toggle, setMode };
}
