const API_BASE_URL = 'http://localhost:3000/api/auth';

/**
 * Servicio para manejar la autenticación
 */
export const loginService = {
  /**
   * Envía las credenciales al backend y maneja la respuesta
   * @param {Object} credentials - { usuario, password }
   */
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Intentamos parsear el JSON
      const data = await response.json();

      if (!response.ok) {
        // Lanzamos un error con el mensaje del servidor o uno genérico
        throw new Error(data.message || 'Error en la autenticación');
      }

      return data; // Retorna { success: true, user: {...} }
    } catch (error) {
      console.error('Error en loginService:', error.message);
      throw error; // Re-lanzamos el error para que el componente lo capture
    }
  },

  // Aquí podrías agregar logout, register, etc.
  logout: () => {
    localStorage.removeItem('user_session');
  }
};