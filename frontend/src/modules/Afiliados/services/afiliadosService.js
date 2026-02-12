const API_URL = 'http://localhost:3000/api';

export const afiliadosService = {
  obtenerTodos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.rubro) params.append('rubro', filtros.rubro);
      if (filtros.orden) params.append('orden', filtros.orden);
      if (filtros.conPatente !== undefined && filtros.conPatente !== null) {
        params.append('conPatente', filtros.conPatente);
      }
      if (filtros.puestoCount !== undefined && filtros.puestoCount !== null) {
        params.append('puestoCount', filtros.puestoCount);
      }
      
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

  // Obtener rubros únicos
  obtenerRubros: async () => {
    try {
      const response = await fetch(`${API_URL}/afiliados/rubros`);
      if (!response.ok) throw new Error('Error al obtener rubros');
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo rubros:', error);
      return [];
    }
  },

  // Obtener estadísticas
  obtenerEstadisticas: async () => {
    try {
      const response = await fetch(`${API_URL}/afiliados/estadisticas`);
      if (!response.ok) throw new Error('Error al obtener estadísticas');
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {};
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
  },
  
  crear: async (afiliadoData) => {
    try {
      const response = await fetch(`${API_URL}/afiliados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(afiliadoData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en afiliadosService.crear:', error);
      throw error;
    }
  },

  // NUEVO: Subir imagen de perfil
  subirFotoPerfil: async (afiliadoId, fotoFile) => {
    try {
      const formData = new FormData();
      formData.append('foto', fotoFile);
      
      const response = await fetch(`${API_URL}/afiliados/${afiliadoId}/upload-perfil`, {
        method: 'POST',
        body: formData,
        // NOTA: No establezcas Content-Type manualmente para FormData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en afiliadosService.subirFotoPerfil:', error);
      throw error;
    }
  },

  // NUEVO: Asignar puesto
  asignarPuesto: async (afiliadoId, puestoData) => {
    try {
      const response = await fetch(`${API_URL}/afiliados/${afiliadoId}/asignar-puesto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(puestoData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en afiliadosService.asignarPuesto:', error);
      throw error;
    }
  },
};