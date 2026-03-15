// frontend/src/modules/GestionPatentesPuestos/service/afiliadosService.js

// ============================================
// SERVICIO — AFILIADOS (GESTIÓN PUESTOS)
// ============================================

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const afiliadosService = {

  /**
   * Busca afiliados en tiempo real por nombre o CI.
   * Usa el endpoint GET /afiliados/buscar?q=
   */
  buscarTiempoReal: async (q) => {
    const res = await axios.get(`${API_BASE}/afiliados/buscar?q=${encodeURIComponent(q)}`);
    return res.data;
  },

  /**
   * Obtiene los puestos asignados a un afiliado por su ID.
   */
  obtenerPuestos: async (idAfiliado) => {
    const res = await axios.get(`${API_BASE}/afiliados/${idAfiliado}/puestos`);
    return res.data;
  },

  /**
   * Obtiene afiliados habilitados con filtro de búsqueda opcional.
   */
  obtenerActivos: async (search = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('es_habilitado', '1');
    const res = await axios.get(`${API_BASE}/afiliados?${params.toString()}`);
    return res.data;
  },

  /**
   * Busca un afiliado por CI o nombre y retorna el primer resultado.
   */
  buscarPorCI: async (ci) => {
    const res = await axios.get(`${API_BASE}/afiliados/buscar?q=${encodeURIComponent(ci)}`);
    return res.data[0];
  },
};