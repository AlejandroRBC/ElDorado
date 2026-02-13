import axios from "axios";

const API_BASE = 'http://localhost:3000/api';

export const afiliadosService = {

  buscarTiempoReal: async (q) => {
    const res = await axios.get(`${API_BASE}/afiliados/buscar?q=${q}`);
    return res.data;   // 🔥 IMPORTANTE
  },
  obtenerPuestos: async (idAfiliado) => {
    const res = await axios.get(`${API_BASE}/afiliados/${idAfiliado}/puestos`);
    return res.data;
  },

 
};
