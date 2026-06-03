import axios from 'axios';
import { API_URL } from '../config';

// Token disuntikkan oleh AuthContext (setAuthToken) agar interceptor
// selalu mengirim Authorization header terbaru.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Error jaringan = tidak ada respons dari server (offline / timeout).
export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response;
}

// 409 = catatan sudah tercatat di server (mis. retry / dobel).
export function isAlreadyRecorded(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 409;
}

// Error permanen (validasi 400/422) → tak akan pernah sukses bila diulang.
export function isPermanentError(err: unknown): boolean {
  const s = axios.isAxiosError(err) ? err.response?.status : undefined;
  return s === 400 || s === 422;
}

// Ubah error axios jadi pesan yang ramah untuk ditampilkan.
export function apiErrorMessage(err: unknown, fallback = 'Terjadi kesalahan'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
    if (err.code === 'ECONNABORTED') return 'Koneksi timeout ke server';
    if (!err.response) return 'Tidak dapat terhubung ke server. Cek alamat API.';
  }
  return fallback;
}
