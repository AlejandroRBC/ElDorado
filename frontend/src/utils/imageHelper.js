// frontend/src/utils/imageHelper.js

// ============================================
// UTILIDADES DE IMÁGENES
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Construye la URL completa de una imagen dado su path relativo o absoluto.
 * - Sin path: retorna la imagen de perfil por defecto
 * - Path absoluto (http): retorna tal cual
 * - Path relativo (/uploads): antepone la URL del API
 */
export const getImageUrl = (path) => {
  if (!path) return `${API_URL}/uploads/perfiles/sinPerfil.png`;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  return path;
};

/**
 * Obtiene la URL de perfil de un afiliado.
 * Si tiene foto personalizada usa getImageUrl, si no retorna la imagen por defecto.
 */
export const getPerfilUrl = (afiliado) => {
  if (afiliado?.url_perfil && !afiliado.url_perfil.includes('sinPerfil.png')) {
    return getImageUrl(afiliado.url_perfil);
  }
  return `${API_URL}/uploads/perfiles/sinPerfil.png`;
};