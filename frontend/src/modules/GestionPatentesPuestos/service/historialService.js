// service/historialService.js
import axios from 'axios';

export const obtenerHistorialPuesto = async (id_puesto) => {
  const res = await axios.get(`http://localhost:3000/api/historial/${id_puesto}`);
  return res.data;
};


