// src/modules/Mapa/service/mapaService.js
import api from '../../../api/axiosConfig';

// ============================================
// SERVICIO MAPA
// ============================================

/**
 * Obtiene todos los puestos con su afiliado actual desde el backend.
 * Endpoint: GET /api/puestos
 * Retorna: { id_puesto, fila, cuadra, nroPuesto, tiene_patente, id_afiliado, ci, apoderado, ... }
 *
 * @returns {Promise<Array>} Lista de puestos con datos del afiliado asignado
 */
export const obtenerPuestosConAfiliado = async () => {
  const response = await api.get('/puestos');
  return response.data;
};