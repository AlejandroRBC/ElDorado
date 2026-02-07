const API_URL = 'http://localhost:3000/api';

export const afiliadosService = {
  obtenerTodos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.rubro) params.append('rubro', filtros.rubro);
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}/afiliados?${queryString}` : `${API_URL}/afiliados`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en afiliadosService.obtenerTodos:', error);
      throw error;
    }
  },

  probarConexion: async () => {
    try {
      const response = await fetch(`${API_URL}/afiliados/test`);
      return await response.json();
    } catch (error) {
      console.error('Error probando conexión:', error);
      return { error: 'No se pudo conectar con el servidor' };
    }
  },
  // Obtener afiliado por ID
  obtenerPorId: async (id) => {
    try {
      const response = await fetch(`${API_URL}/afiliados/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Afiliado no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error en afiliadosService.obtenerPorId ${id}:`, error);
      throw error;
    }
  }
};