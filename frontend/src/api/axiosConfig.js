import axios from 'axios';

// ============================================
// CONFIGURACIÓN DE AXIOS
// ============================================

/**
 * Instancia de Axios configurada para la API
 * - Base URL apunta al backend local
 * - Timeout de 5 segundos
 * - Credenciales habilitadas para enviar cookies de sesión
 */
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true 
});

export default api;