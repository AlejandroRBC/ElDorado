// frontend/src/modules/GestionPatentesPuestos/service/historialService.js

// ============================================
// SERVICIO — HISTORIAL
// ============================================

import axios from 'axios';

/**
 * Obtiene el historial de asignaciones de un puesto por su ID.
 * Endpoint: GET /api/historial/:id_puesto
 */
export const obtenerHistorialPuesto = async (id_puesto) => {
  const res = await axios.get(`http://localhost:3000/api/historial/${id_puesto}`);
  return res.data;
};