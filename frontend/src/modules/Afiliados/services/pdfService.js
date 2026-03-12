import { API_BASE_URL } from '../../../api/config';

export const pdfService = {
  /**
   * Obtener datos del afiliado para el PDF.
   * @param {number} id - ID del afiliado
   */
  obtenerDatosParaPDF: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/afiliados/${id}/pdf-data`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo datos para PDF:', error);
      throw error;
    }
  },

  /**
   * Versión con timestamp para evitar caché del navegador.
   * @param {number} id - ID del afiliado
   */
  obtenerDatosParaPDFFresh: async (id) => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`${API_BASE_URL}/afiliados/${id}/pdf-data?_=${timestamp}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo datos frescos:', error);
      throw error;
    }
  },
};