import { API_BASE_URL } from '../../../api/config';

// ─────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────

/**
 * Procesa la respuesta HTTP. Lanza un Error descriptivo si no es 2xx.
 * @param {Response} res
 * @returns {Promise<any>}
 */
const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

const BASE_AF = `${API_BASE_URL}/afiliados`;

// ─────────────────────────────────────────────────────────────
// AFILIADOS — CRUD PRINCIPAL
// ─────────────────────────────────────────────────────────────

export const afiliadosApi = {

  /** Lista afiliados activos con filtros opcionales. */
  obtenerTodos: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.search)                       params.append('search',    filtros.search);
    if (filtros.rubro)                        params.append('rubro',     filtros.rubro);
    if (filtros.orden)                        params.append('orden',     filtros.orden);
    if (filtros.conPatente  != null)          params.append('conPatente',  filtros.conPatente);
    if (filtros.puestoCount != null)          params.append('puestoCount', filtros.puestoCount);
    const qs  = params.toString();
    const url = qs ? `${BASE_AF}?${qs}` : BASE_AF;
    return handleResponse(await fetch(url));
  },

  /** Obtiene un afiliado por su ID. */
  obtenerPorId: async (id) => {
    const res = await fetch(`${BASE_AF}/${id}`);
    if (res.status === 404) throw new Error('Afiliado no encontrado');
    return handleResponse(res);
  },

  /** Crea un nuevo afiliado con sus datos básicos. */
  crear: async (data) =>
    handleResponse(await fetch(BASE_AF, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })),

  /** Actualiza los datos de un afiliado existente. */
  actualizar: async (id, data) =>
    handleResponse(await fetch(`${BASE_AF}/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })),

  /** Sube o reemplaza la foto de perfil de un afiliado. */
  subirFotoPerfil: async (afiliadoId, fotoFile) => {
    const formData = new FormData();
    formData.append('foto', fotoFile);
    return handleResponse(await fetch(`${BASE_AF}/${afiliadoId}/upload-perfil`, {
      method: 'POST',
      body:   formData,
    }));
  },

  // ── Habilitación ────────────────────────────────────────────

  /** Deshabilita (desafilia) un afiliado. */
  deshabilitarAfiliado: async (id) =>
    handleResponse(await fetch(`${BASE_AF}/${id}/deshabilitar`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ es_habilitado: 0 }),
    })),

  /** Rehabilita un afiliado previamente deshabilitado. */
  rehabilitarAfiliado: async (id) =>
    handleResponse(await fetch(`${BASE_AF}/${id}/rehabilitar`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
    })),

  /** Lista afiliados deshabilitados con filtros opcionales. */
  obtenerDeshabilitados: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.orden)  params.append('orden',  filtros.orden);
    const qs  = params.toString();
    const url = qs
      ? `${BASE_AF}/deshabilitados?${qs}`
      : `${BASE_AF}/deshabilitados`;
    return handleResponse(await fetch(url));
  },

  /** Cuenta el total de afiliados deshabilitados. */
  contarDeshabilitados: async () => {
    try {
      const data = await handleResponse(
        await fetch(`${BASE_AF}/deshabilitados/count`)
      );
      return data.total || 0;
    } catch {
      return 0;
    }
  },

  // ── Listas de referencia ────────────────────────────────────

  /** Obtiene rubros únicos registrados. */
  obtenerRubros: async () => {
    try {
      return await handleResponse(await fetch(`${BASE_AF}/rubros`));
    } catch {
      return [];
    }
  },

  /** Obtiene estadísticas generales del módulo. */
  obtenerEstadisticas: async () => {
    try {
      return await handleResponse(await fetch(`${BASE_AF}/estadisticas`));
    } catch {
      return {};
    }
  },

  /** Prueba la conectividad con el backend. */
  probarConexion: async () => {
    try {
      return await handleResponse(await fetch(`${BASE_AF}/test`));
    } catch (err) {
      return { error: 'No se pudo conectar con el servidor' };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // PUESTOS DEL AFILIADO
  // ─────────────────────────────────────────────────────────────

  /** Lista puestos asignados a un afiliado específico. */
  obtenerPuestosDeAfiliado: async (afiliadoId) =>
    handleResponse(await fetch(`${BASE_AF}/${afiliadoId}/puestos`)),

  /** Lista puestos disponibles para ser asignados. */
  obtenerPuestosDisponibles: async () => {
    const res  = await fetch(`${API_BASE_URL}/puestos/disponibles`);
    const data = await handleResponse(res);
    return data.data || data;
  },

  /** Asigna un puesto a un afiliado. */
  asignarPuesto: async (afiliadoId, puestoData) =>
    handleResponse(await fetch(`${BASE_AF}/${afiliadoId}/asignar-puesto`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(puestoData),
    })),

  /** Quita (desasigna/despoja) un puesto de un afiliado. */
  desasignarPuesto: async (idAfiliado, idPuesto, razon) =>
    handleResponse(await fetch(`${API_BASE_URL}/afiliados/despojar-puesto`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ idAfiliado, idPuesto, razon }),
    })),

  /** Obtiene el historial de tenencias de un puesto. */
  obtenerHistorialPuesto: async (idPuesto) =>
    handleResponse(await fetch(`${API_BASE_URL}/historial/${idPuesto}`)),

  // ─────────────────────────────────────────────────────────────
  // HISTORIAL DEL AFILIADO
  // (fusionado desde historialService.js)
  // ─────────────────────────────────────────────────────────────

  /** Historial de afiliación de un afiliado (AFILIACION, MODIFICACION, etc.). */
  obtenerHistorialAfiliacion: async (idAfiliado) => {
    const res  = await fetch(
      `${API_BASE_URL}/directorio/historial-afiliado/${idAfiliado}`,
      { credentials: 'include' }
    );
    const data = await handleResponse(res);
    return (data.data || []).map((r) => ({
      id:          r.id_historial_af,
      origen:      'afiliado',
      tipo:        r.tipo,
      descripcion: r.detalle || '',
      fecha:       r.fecha,
      hora:        r.hora,
      responsable: r.nom_usuario_master
        ? `${r.nom_usuario_master} — ${r.nom_afiliado_master}`
        : 'sistema',
    }));
  },

  /** Historial de participación en el Directorio (INGRESO / EGRESO). */
  obtenerHistorialDirectorio: async (idAfiliado) => {
    const res  = await fetch(
      `${API_BASE_URL}/directorio/historial/afiliado/${idAfiliado}`,
      { credentials: 'include' }
    );
    const data = await handleResponse(res);
    return (data.data || []).map((r) => ({
      id:          r.id_historial_dir,
      origen:      'directorio',
      tipo:        r.tipo,
      descripcion: r.tipo === 'INGRESO'
        ? `Ingresó como ${r.nom_secretaria} — Gestión ${r.gestion_label}`
        : `Salió de ${r.nom_secretaria} — Gestión ${r.gestion_label}`,
      secretaria:  r.nom_secretaria,
      gestion:     r.gestion_label,
      fecha:       r.fecha,
      hora:        r.hora,
      responsable: r.nom_usuario_master
        ? `${r.nom_usuario_master} — ${r.nom_afiliado_master}`
        : 'sistema',
    }));
  },

  /**
   * Combina y ordena ambos historiales por fecha/hora descendente.
   * Usa Promise.allSettled para que un fallo parcial no rompa todo.
   */
  obtenerHistorialCompleto: async (idAfiliado) => {
    const [afiliacion, directorio] = await Promise.allSettled([
      afiliadosApi.obtenerHistorialAfiliacion(idAfiliado),
      afiliadosApi.obtenerHistorialDirectorio(idAfiliado),
    ]);

    const registros = [
      ...(afiliacion.status  === 'fulfilled' ? afiliacion.value  : []),
      ...(directorio.status === 'fulfilled' ? directorio.value : []),
    ];

    registros.sort((a, b) => {
      const fa = `${a.fecha} ${a.hora || ''}`;
      const fb = `${b.fecha} ${b.hora || ''}`;
      return fb.localeCompare(fa);
    });

    return registros;
  },

  /** Datos específicos para el template de PDF (endpoint dedicado). */
  obtenerDatosParaPDF: async (id) =>
    handleResponse(
      await fetch(`${BASE_AF}/${id}/pdf-data?_=${Date.now()}`)
    ),
};