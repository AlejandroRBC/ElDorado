// src/modules/Mapa/service/mapaService.js
import api from '../../../api/axiosConfig';

/**
 * Obtiene todos los puestos con su afiliado actual desde el backend.
 * Usa el endpoint GET /api/puestos que devuelve:
 * { id_puesto, fila, cuadra, nroPuesto, tiene_patente, id_afiliado, ci, apoderado, ... }
 */
export const obtenerPuestosConAfiliado = async () => {
  const response = await api.get('/puestos');
  return response.data;
};
