const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getImageUrl = (path) => {
  if (!path) return `${API_URL}/assets/perfiles/sinPerfil.png`;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  return path;
};

export const getPerfilUrl = (afiliado) => {
  if (afiliado?.url_perfil && !afiliado.url_perfil.includes('sinPerfil')) {
    return getImageUrl(afiliado.url_perfil);
  }
  return `${API_URL}/assets/perfiles/sinPerfil.png`;
};