import { API_BASE_URL } from '../../../api/config';

const BASE = `${API_BASE_URL}/directorio`;

// ── helper interno ──────────────────────────────────────────
const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
};

export const directorioService = {

  // ── Catálogos ──────────────────────────────────────────────

  obtenerGestiones: async () => {
    const res = await fetch(`${BASE}/gestiones`, { credentials: 'include' });
    const data = await handleResponse(res);
    return data.data || [];
  },

  obtenerGestionActiva: async () => {
    const res = await fetch(`${BASE}/gestiones/activa`, { credentials: 'include' });
    const data = await handleResponse(res);
    return data.data || null;
  },

  obtenerSecretarias: async () => {
    const res = await fetch(`${BASE}/secretarias`, { credentials: 'include' });
    const data = await handleResponse(res);
    return data.data || [];
  },

  // ── Directorio por gestión ─────────────────────────────────

  obtenerPorGestion: async (idGestion) => {
    const res = await fetch(`${BASE}/gestion/${idGestion}`, { credentials: 'include' });
    const data = await handleResponse(res);
    return data.data || [];
  },

  // ── Mutaciones ─────────────────────────────────────────────

  asignarCargo: async ({ id_gestion, id_secretaria, id_afiliado, fecha_inicio }) => {
    const res = await fetch(BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id_gestion, id_secretaria, id_afiliado, fecha_inicio }),
    });
    return handleResponse(res);
  },

  cerrarCargo: async (idDirectorio, fechaFin) => {
    const res = await fetch(`${BASE}/${idDirectorio}/cerrar`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fecha_fin: fechaFin }),
    });
    return handleResponse(res);
  },

  reemplazarCargo: async (idDirectorio, { id_afiliado_nuevo, fecha_cambio }) => {
    const res = await fetch(`${BASE}/${idDirectorio}/reemplazar`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id_afiliado_nuevo, fecha_cambio }),
    });
    return handleResponse(res);
  },

  // ── Búsqueda de afiliados (para el buscador del modal) ─────
  // Reutiliza el endpoint de afiliados con search param.
  // Solo devuelve habilitados gracias al backend.

  buscarAfiliados: async (termino) => {
    if (!termino || termino.trim().length < 2) return [];
    const params = new URLSearchParams({ search: termino.trim() });
    const res = await fetch(`${API_BASE_URL}/afiliados?${params}`, { credentials: 'include' });
    const data = await handleResponse(res);
    // El endpoint devuelve directamente el array
    return Array.isArray(data) ? data : (data.data || []);
  },
};