import axios from 'axios';

const API_URL = 'http://localhost:3000/api/puestos';

export const puestosService = {

  crear: async (datosPuesto) => {
    const response = await axios.post(API_URL, datosPuesto);
    return response.data;
  },

  listar: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  obtener: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  actualizar: async (id, datos) => {
    const response = await axios.put(`${API_URL}/${id}`, datos);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }

};
