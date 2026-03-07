import api from '../../../api/axiosConfig';

// ============================================
// SERVICIOS DE AUTENTICACIÓN
// ============================================

export const LoginService = {
  /**
   * Autenticar usuario con credenciales
   * @param {{ usuario: string, password: string }} credentials
   */
  login: async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión con el servidor';
      throw new Error(message);
    }
  },

  /**
   * Cerrar sesión limpiando datos locales
   */
  logout: () => {
    localStorage.removeItem('user_session');
  }
};