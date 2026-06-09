import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { alertDialog } from '../utils/dialog';
import { apiLogin, apiMe } from '../api/services';
import { deleteToken, getToken, setToken as persistToken } from './tokenStorage';
import { UserProfile, TenantInfo } from '../types';

const TOKEN_KEY = 'meterair_token';
const TENANT_KEY = 'meterair_tenant';

interface AuthState {
  user: UserProfile | null;
  tenant: TenantInfo | null;
  token: string | null;
  initializing: boolean;
  login: (username: string, password: string, kode: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Daftarkan handler: bila API balas 401, hapus token & set user null
    setUnauthorizedHandler(() => {
      deleteToken(TOKEN_KEY);
      deleteToken(TENANT_KEY);
      setToken(null);
      setUser(null);
      setTenant(null);
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getToken(TOKEN_KEY);
        if (saved) {
          setAuthToken(saved);
          const me = await apiMe();
          setToken(saved);
          setUser(me);
          // Pulihkan tenant info dari storage
          const savedTenant = await getToken(TENANT_KEY);
          if (savedTenant) setTenant(JSON.parse(savedTenant));
        }
      } catch {
        await deleteToken(TOKEN_KEY);
        await deleteToken(TENANT_KEY);
        setAuthToken(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  async function login(username: string, password: string, kode: string) {
    try {
      const res = await apiLogin(username, password, kode);
      setAuthToken(res.access_token);
      await persistToken(TOKEN_KEY, res.access_token);
      await persistToken(TENANT_KEY, JSON.stringify(res.tenant));
      setToken(res.access_token);
      setUser(res.user);
      setTenant(res.tenant);
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.message === 'TENANT_EXPIRED') {
        alertDialog(
          'Langganan Kedaluwarsa',
          'Masa langganan perusahaan sudah habis.\nHubungi administrator untuk perpanjangan.',
        );
        return;
      }
      throw error;
    }
  }

  async function logout() {
    await deleteToken(TOKEN_KEY);
    await deleteToken(TENANT_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setTenant(null);
  }

  const value = useMemo(
    () => ({ user, tenant, token, initializing, login, logout }),
    [user, tenant, token, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
