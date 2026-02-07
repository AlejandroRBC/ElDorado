import axios from "axios";

// Si estás usando Vite/React, es mejor usar rutas relativas
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const afiliadosService = {
  // ========================================
  // BUSQUEDA GENERAL
  // ========================================
  buscar: async (termino) => {
    try {
      // Opción 1: Usando fetch (si prefieres)
      // const response = await fetch(`${API_BASE}/afiliados/buscar?q=${encodeURIComponent(termino)}`);
      // return await response.json();
      
      // Opción 2: Usando axios (mejor para manejo de errores)
      const response = await axios.get(`${API_BASE}/afiliados/buscar`, {
        params: { q: termino }
      });
      return response.data;
    } catch (error) {
      console.error('Error buscando afiliados:', error);
      throw error;
    }
  },

  // ========================================
  // BUSCAR POR CI EXACTO
  // ========================================
  buscarPorCI: async (ci) => {
    try {
      const response = await axios.get(`${API_BASE}/afiliados/ci/${ci}`);
      return response.data;
    } catch (error) {
      console.error('Error buscando afiliado por CI:', error);
      throw error;
    }
  },

  // ========================================
  // LISTAR TODOS LOS AFILIADOS
  // ========================================
  listar: async () => {
    try {
      const response = await axios.get(`${API_BASE}/afiliados`);
      return response.data;
    } catch (error) {
      console.error('Error listando afiliados:', error);
      throw error;
    }
  },

  // ========================================
  // OBTENER AFILIADO POR ID
  // ========================================
  obtenerPorId: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/afiliados/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo afiliado:', error);
      throw error;
    }
  },

  // ========================================
  // CREAR NUEVO AFILIADO
  // ========================================
  crear: async (datos) => {
    try {
      const response = await axios.post(`${API_BASE}/afiliados`, datos);
      return response.data;
    } catch (error) {
      console.error('Error creando afiliado:', error);
      throw error;
    }
  },

  // ========================================
  // ACTUALIZAR AFILIADO
  // ========================================
  actualizar: async (id, datos) => {
    try {
      const response = await axios.put(`${API_BASE}/afiliados/${id}`, datos);
      return response.data;
    } catch (error) {
      console.error('Error actualizando afiliado:', error);
      throw error;
    }
  },

  // ========================================
  // DESHABILITAR AFILIADO
  // ========================================
  deshabilitar: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/afiliados/${id}/deshabilitar`);
      return response.data;
    } catch (error) {
      console.error('Error deshabilitando afiliado:', error);
      throw error;
    }
  },

  // ========================================
  // OBTENER AFILIADOS ACTIVOS
  // ========================================
  obtenerActivos: async () => {
    try {
      const response = await axios.get(`${API_BASE}/afiliados/activos`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo afiliados activos:', error);
      throw error;
    }
  },

  // ========================================
  // ASIGNAR TENENCIA (PUESTO A AFILIADO)
  // ========================================
  asignarTenencia: async (datos) => {
    try {
      const response = await axios.post(`${API_BASE}/tenencias/asignar`, datos);
      return response.data;
    } catch (error) {
      console.error('Error asignando tenencia:', error);
      throw error;
    }
  },

  // ========================================
  // OBTENER PUESTOS DE UN AFILIADO
  // ========================================
  obtenerPuestos: async (idAfiliado) => {
    try {
      const response = await axios.get(`${API_BASE}/afiliados/${idAfiliado}/puestos`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo puestos del afiliado:', error);
      throw error;
    }
  },

  // ========================================
  // BUSCAR CON FILTROS AVANZADOS
  // ========================================
  buscarAvanzado: async (filtros = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/afiliados/buscar-avanzado`, {
        params: filtros
      });
      return response.data;
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      throw error;
    }
  }
};

// Si necesitas también exportar funciones individuales (opcional)
export const buscarAfiliadoCI = afiliadosService.buscarPorCI;
export const asignarTenencia = afiliadosService.asignarTenencia;

export default afiliadosService;