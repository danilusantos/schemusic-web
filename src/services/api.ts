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
  stopLoading();
  return response;
}, (error) => {
  stopLoading();
  return Promise.reject(error);
});

export default api;