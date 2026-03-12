import axios from 'axios';
import { API_BASE_URL } from './config';

// ============================================================
// INSTANCIA DE AXIOS CONFIGURADA
// ============================================================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;