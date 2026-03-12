// ============================================================
// FUENTE ÚNICA DE VERDAD — URLs del servidor
// ============================================================
// Cambiar el backend (staging, producción) requiere solo
// modificar la variable de entorno VITE_API_URL, sin tocar
// ningún componente ni servicio.
//
// Configuración en .env (ejemplo):
//   VITE_API_URL=https://api.eldorado.com
//
// Si la variable no está definida, apunta al backend local.

/** URL base del servidor — para archivos estáticos e imágenes */
export const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** URL base de la API REST — todos los endpoints usan este prefijo */
export const API_BASE_URL = `${SERVER_URL}/api`;