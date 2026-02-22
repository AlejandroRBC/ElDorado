const API_URL = 'http://localhost:3000/api';

export const pdfService = {
  /**
   * Obtener datos actualizados del afiliado para el PDF
   * @param {number} id - ID del afiliado
   * @returns {Promise} - Datos frescos del afiliado
   */
  obtenerDatosParaPDF: async (id) => {
    try {
      const response = await fetch(`${API_URL}/afiliados/${id}/pdf-data`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo datos para PDF:', error);
      throw error;
    }
  },

  /**
   * Versión con timestamp para evitar caché
   */
  obtenerDatosParaPDFFresh: async (id) => {
    try {
      // Agregar timestamp para evitar caché del navegador
      const timestamp = Date.now();
      const response = await fetch(`${API_URL}/afiliados/${id}/pdf-data?_=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo datos frescos:', error);
      throw error;
    }
  }
};