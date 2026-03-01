// frontend/src/modules/GestionPatentesPuestos/service/afiliadosService.js
// Actualiza este archivo para incluir búsqueda de afiliados disponibles

import axios from "axios";

const API_BASE = 'http://localhost:3000/api';

export const afiliadosService = {
  buscarTiempoReal: async (q) => {
    const res = await axios.get(`${API_BASE}/afiliados/buscar?q=${q}`);
    return res.data;
  },
  obtenerPuestos: async (idAfiliado) => {
    const res = await axios.get(`${API_BASE}/afiliados/${idAfiliado}/puestos`);
    return res.data;
  },

  //  Obtener afiliados activos para asignar puesto
  obtenerActivos: async (search = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('es_habilitado', '1');
    
    const res = await axios.get(`${API_BASE}/afiliados?${params.toString()}`);
    return res.data;
  },

  //  Buscar afiliado por CI para asignación rápida
  buscarPorCI: async (ci) => {
    const res = await axios.get(`${API_BASE}/afiliados/buscar?q=${ci}`);
    return res.data[0]; // Retorna el primer resultado
  }
};