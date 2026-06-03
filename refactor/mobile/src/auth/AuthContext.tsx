import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setAuthToken } from '../api/client';
import { apiLogin, apiMe } from '../api/services';
import {
  deleteToken,
  getToken,
  setToken as persistToken,
} from './tokenStorage';
import { UserProfile } from '../types';

const TOKEN_KEY = 'meterair_token';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  initializing: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Pulihkan sesi dari penyimpanan aman saat aplikasi dibuka.
  useEffect(() => {
    (async () => {
      try {
        const saved = await getToken(TOKEN_KEY);
        if (saved) {
          setAuthToken(saved);
          const me = await apiMe();
          setToken(saved);
          setUser(me);
        }
      } catch {
        // token kedaluwarsa / tidak valid → biarkan logout
        await deleteToken(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  async function login(username: string, password: string) {
    const res = await apiLogin(username, password);
    setAuthToken(res.access_token);
    await persistToken(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }

  async function logout() {
    await deleteToken(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, initializing, login, logout }),
    [user, token, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
