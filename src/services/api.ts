import axios from 'axios';
import { useUiLoadingStore } from '../stores/uiLoadingStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/backend';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const startLoading = () => useUiLoadingStore.getState().startLoading();
const stopLoading = () => useUiLoadingStore.getState().stopLoading();

// Adicionar token JWT a cada requisição
api.interceptors.request.use((config) => {
  startLoading();
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  stopLoading();
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  const refreshedTokenHeader = response.headers['x-refreshed-token'];
  if (typeof refreshedTokenHeader === 'string' && refreshedTokenHeader.trim()) {
    const refreshedToken = refreshedTokenHeader.trim();
    localStorage.setItem('token', refreshedToken);

    const adminSessionRaw = localStorage.getItem('schemusic_admin_session');
    if (adminSessionRaw) {
      try {
        const adminSession = JSON.parse(adminSessionRaw) as Record<string, unknown>;
        localStorage.setItem('schemusic_admin_session', JSON.stringify({
          ...adminSession,
          token: refreshedToken,
        }));
      } catch {
        localStorage.removeItem('schemusic_admin_session');
      }
    }

    const publicUserRaw = localStorage.getItem('user');
    if (publicUserRaw) {
      try {
        const publicUser = JSON.parse(publicUserRaw) as Record<string, unknown>;
        localStorage.setItem('user', JSON.stringify({
          ...publicUser,
          token: refreshedToken,
        }));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }

  stopLoading();
  return response;
}, (error) => {
  stopLoading();
  return Promise.reject(error);
});

export default api;