import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const puestosService = {
  listar: async () => {
    const response = await axios.get(`${API_BASE}/puestos/listar`);
    return response.data;
  },

  obtenerInfoTraspaso: async (idPuesto) => {
    const response = await axios.get(`${API_BASE}/puestos/info-traspaso/${idPuesto}`);
    return response.data;
  },
  traspasar: async (data) => {
    const res = await axios.post(`${API_BASE}/puestos/traspasar`, data);
    return res.data;
  },

  actualizarPuesto: async (id, data) => {
    console.log("ENTRÓ A ACTUALIZAR");
    const res = await axios.put(`${API_BASE}/puestos/${id}`, data);
    return res.data;
  }

}