import api from '../../../api/axiosConfig';

// ============================================
// SERVICIOS DE USUARIO
// ============================================

const usuarioService = {
  /**
   * Listar usuarios con filtro de estado opcional
   * @param {string} estado - 'todos' | 'activo' | 'inactivo'
   */
  listar: (estado = 'todos') => {
    return api.get('/usuario', { params: { estado } });
  },

  /**
   * Obtener afiliados disponibles para el selector de búsqueda
   * @param {string} search - Término de búsqueda opcional
   */
  obtenerAfiliadosSelect: (search = '') => {
    return api.get('/usuario/afiliados/select', { params: { search } });
  },

  /**
   * Obtener datos de un afiliado por su ID
   * @param {number} id - ID del afiliado
   */
  obtenerAfiliadoPorId: (id) => {
    return api.get(`/usuario/afiliados/${id}`);
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} data - Datos del usuario (id_afiliado, rol, nom_usuario, password)
   */
  crear: (data) => {
    return api.post('/usuario', data);
  },

  /**
   * Obtener un usuario por su ID
   * @param {number} id - ID del usuario
   */
  obtener: (id) => {
    return api.get(`/usuario/${id}`);
  },

  /**
   * Actualizar datos de un usuario (password es opcional)
   * @param {number} id   - ID del usuario
   * @param {Object} data - Datos a actualizar
   */
  actualizar: (id, data) => {
    return api.put(`/usuario/${id}`, data);
  },

  /**
   * Desactivar un usuario (baja lógica)
   * @param {number} id - ID del usuario
   */
  desactivar: (id) => {
    return api.patch(`/usuario/${id}/desactivar`);
  },

  /**
   * Reactivar un usuario previamente desactivado
   * @param {number} id - ID del usuario
   */
  reactivar: (id) => {
    return api.patch(`/usuario/${id}/reactivar`);
  },

  /**
   * Obtener historial de cambios con filtros opcionales
   * @param {Object} params - { id_usuario, desde, hasta }
   */
  historial: (params = {}) => {
    return api.get('/usuario/historial', { params });
  }
};

export default usuarioService;