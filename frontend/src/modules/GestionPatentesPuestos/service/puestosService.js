// frontend/src/modules/GestionPatentesPuestos/service/puestosService.js

// ============================================
// SERVICIO — PUESTOS
// ============================================

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const puestosService = {

  /**
   * Obtiene la lista completa de puestos con datos del afiliado asignado.
   */
  listar: async () => {
    const response = await axios.get(`${API_BASE}/puestos/listar`);
    return response.data;
  },

  /**
   * Obtiene el afiliado actual y sus puestos para el modal de traspaso.
   */
  obtenerInfoTraspaso: async (idPuesto) => {
    const response = await axios.get(`${API_BASE}/puestos/info-traspaso/${idPuesto}`);
    return response.data;
  },

  /**
   * Ejecuta el traspaso de un puesto a un nuevo afiliado.
   */
  traspasar: async (data) => {
    const res = await axios.post(`${API_BASE}/puestos/traspasar`, data);
    return res.data;
  },

  /**
   * Actualiza los datos editables de un puesto (patente, rubro, dimensiones).
   */
  actualizarPuesto: async (id, data) => {
    const res = await axios.put(`${API_BASE}/puestos/${id}`, data);
    return res.data;
  },
};