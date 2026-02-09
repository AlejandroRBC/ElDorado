// service/historialService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/tenencias';

export const obtenerHistorialPuesto = async (id_puesto) => {
  try {
    const response = await axios.get(`${API_URL}/historial/${id_puesto}`);
    return response.data; // Array con todo el historial
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    throw error;
  }
};
