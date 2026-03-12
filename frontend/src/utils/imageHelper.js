// frontend/src/utils/imageHelper.js

import { SERVER_URL } from '../api/config';

// ============================================================
// HELPERS DE IMÁGENES
// ============================================================

/**
 * Construye la URL completa de una imagen dado su path.
 * - Sin path → imagen de perfil por defecto
 * - URL absoluta (http/https) → sin cambios
 * - Path relativo (/uploads/...) → antepone SERVER_URL
 */
export const getImageUrl = (path) => {
  if (!path) return `${SERVER_URL}/uploads/perfiles/sinPerfil.png`;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${SERVER_URL}${path}`;
  return path;
};

/**
 * Devuelve la URL de foto de perfil de un afiliado.
 * Si no tiene foto personalizada retorna la imagen por defecto.
 */
export const getPerfilUrl = (afiliado) => {
  if (afiliado?.url_perfil && !afiliado.url_perfil.includes('sinPerfil.png')) {
    return getImageUrl(afiliado.url_perfil);
  }
  return `${SERVER_URL}/uploads/perfiles/sinPerfil.png`;
};