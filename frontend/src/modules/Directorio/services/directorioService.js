// modules/Directorio/services/directorioService.js

// ============================================================
// SERVICIO — DIRECTORIO
// ============================================================

import { API_BASE_URL } from '../../../api/config';

const BASE = `${API_BASE_URL}/directorio`;

/**
 * Procesa la respuesta HTTP y lanza error si no es exitosa.
 */
const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
};

export const directorioService = {

  // ── Gestiones ──────────────────────────────────────────────

  /**
   * Obtiene la lista completa de gestiones disponibles.
   */
  obtenerGestiones: async () => {
    const res  = await fetch(`${BASE}/gestiones`, { credentials: 'include' });
    const data = await handleResponse(res);
    return data.data || [];
  },

  /**
   * Obtiene la gestión activa según el año actual.
   */
  obtenerGestionActiva: async () => {
    const res  = await fetch(`${BASE}/gestiones/activa`, { credentials: 'include' });
    const data = await handleResponse(res);
    return data.data || null;
  },

  /**
   * Crea una nueva gestión con año inicio y año fin.
   */
  crearGestion: async (anio_inicio, anio_fin) => {
    const res = await fetch(`${BASE}/gestiones`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ anio_inicio, anio_fin }),
    });
    return handleResponse(res);
  },

  // ── Secretarías ────────────────────────────────────────────

  /**
   * Obtiene el catálogo de secretarías desde el backend.
   */
  obtenerSecretarias: async () => {
    const res  = await fetch(`${BASE}/secretarias`, { credentials: 'include' });
    const data = await handleResponse(res);
    return data.data || [];
  },

  // ── Directorio ─────────────────────────────────────────────

  /**
   * Obtiene los cargos asignados de una gestión específica.
   */
  obtenerPorGestion: async (idGestion) => {
    const res  = await fetch(`${BASE}/gestion/${idGestion}`, { credentials: 'include' });
    const data = await handleResponse(res);
    return data.data || [];
  },

  /**
   * Asigna un afiliado a un cargo dentro de una gestión (INSERT).
   */
  asignarCargo: async ({ id_gestion, id_secretaria, id_afiliado, fecha_inicio }) => {
    const res = await fetch(BASE, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ id_gestion, id_secretaria, id_afiliado, fecha_inicio }),
    });
    return handleResponse(res);
  },

  /**
   * Elimina un cargo del directorio por su ID (DELETE).
   * El trigger BEFORE DELETE graba el egreso en historial automáticamente.
   */
  eliminarCargo: async (idDirectorio) => {
    const res = await fetch(`${BASE}/${idDirectorio}`, {
      method:      'DELETE',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // ── Búsqueda de afiliados ──────────────────────────────────

  /**
   * Busca afiliados por nombre o CI para el buscador del modal.
   * Requiere mínimo 2 caracteres para ejecutar la búsqueda.
   */
  buscarAfiliados: async (termino) => {
    if (!termino || termino.trim().length < 2) return [];
    const params = new URLSearchParams({ search: termino.trim() });
    const res    = await fetch(`${API_BASE_URL}/afiliados?${params}`, { credentials: 'include' });
    const data   = await handleResponse(res);
    return Array.isArray(data) ? data : (data.data || []);
  },
};