import api from '../../api/axiosConfig';


export const loginService = {
  login: async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data; 
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión con el servidor';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('user_session');
  }
};