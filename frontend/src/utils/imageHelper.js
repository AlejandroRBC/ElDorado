// frontend/src/utils/imageHelper.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getImageUrl = (path) => {
  if (!path) return `${API_URL}/uploads/perfiles/sinPerfil.png`;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  return path;
};

export const getPerfilUrl = (afiliado) => {
  // Si tiene foto personalizada (no es la default)
  if (afiliado?.url_perfil && !afiliado.url_perfil.includes('sinPerfil.png')) {
    return getImageUrl(afiliado.url_perfil);
  }
  
  // Siempre servir la default desde el backend
  return `${API_URL}/uploads/perfiles/sinPerfil.png`;
};