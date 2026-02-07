import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const puestosService = {
  crear: async (datosPuesto) => {
    const response = await axios.post(`${API_BASE}/puestos`, datosPuesto);
    return response.data;
  },

  listar: async () => {
    const response = await axios.get(`${API_BASE}/puestos`);
    return response.data;
  },

  obtener: async (id) => {
    const response = await axios.get(`${API_BASE}/puestos/${id}`);
    return response.data;
  },

  actualizar: async (id, datos) => {
    const response = await axios.put(`${API_BASE}/puestos/${id}`, datos);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await axios.delete(`${API_BASE}/puestos/${id}`);
    return response.data;
  },

  // NUEVOS MÉTODOS PARA TRASPASO
  obtenerInfoTraspaso: async (idPuesto) => {
    const response = await axios.get(`${API_BASE}/tenencias/info-traspaso/${idPuesto}`);
    return response.data;
  },

  traspasoMultiple: async (data) => {
    const response = await axios.post(`${API_BASE}/tenencias/traspaso-multiple`, data);
    return response.data;
  },

  traspasar: async (idPuesto, idNuevoAfiliado, motivoDetallado = '') => {
    const response = await axios.post(`${API_BASE}/tenencias/traspasar`, {
      id_puesto: idPuesto,
      nuevo_afiliado: idNuevoAfiliado,
      motivo_detallado: motivoDetallado
    });
    return response.data;
  },

  obtenerHistorial: async (idPuesto) => {
    const response = await axios.get(`${API_BASE}/tenencias/historial/${idPuesto}`);
    return response.data;
  }
};