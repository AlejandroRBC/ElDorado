import api from '../../../api/axiosConfig'; 

// ============================================
// SERVICIOS DE USUARIO
// ============================================

const usuarioService = {
  /**
   * Listar usuarios con filtro opcional
   */
  listar: (estado = 'todos') => {
    return api.get('/usuario', { params: { estado } });
  },

  /**
   * Obtener afiliados para select (con búsqueda)
   */
  obtenerAfiliadosSelect: (search = '') => {
    return api.get('/usuario/afiliados/select', { 
      params: { search } 
    });
  },

  /**
   * Obtener afiliado por ID
   */
  obtenerAfiliadoPorId: (id) => {
    return api.get(`/usuario/afiliados/${id}`);
  },

  /**
   * Crear nuevo usuario
   */
  crear: (data) => {
    return api.post('/usuario', data);
  },
  
  /**
   * Obtener usuario por ID
   */
  obtener: (id) => {
    return api.get(`/usuario/${id}`);
  },

  /**
   * Actualizar usuario (password opcional)
   */
  actualizar: (id, data) => {
    return api.put(`/usuario/${id}`, data);
  },

  /**
   * Desactivar usuario
   */
  desactivar: (id) => {
    return api.patch(`/usuario/${id}/desactivar`);
  },

  /**
   * Reactivar usuario
   */
  reactivar: (id) => {
    return api.patch(`/usuario/${id}/reactivar`);
  },

  /**
   * Historial de cambios con filtros
   */
  historial: (params = {}) => {
    return api.get('/usuario/historial', { params });
  }
};

export default usuarioService;