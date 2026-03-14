// services/historialService.js
import { API_BASE_URL } from '../../../api/config';

// ============================================================
// HISTORIAL SERVICE
// Consume los endpoints del módulo de directorio para obtener
// el historial de afiliación y el historial de directorio
// de un afiliado específico.
// ============================================================

export const historialService = {

  /**
   * Historial de afiliación (AFILIACION, MODIFICACION, DESAFILIACION, REAFILIACION)
   * @param {number|string} idAfiliado
   * @returns {Promise<Array>}
   */
  obtenerHistorialAfiliacion: async (idAfiliado) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/directorio/historial-afiliado/${idAfiliado}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Error ${response.status}`);
      }
      const data = await response.json();
      // Normaliza para que todos los registros tengan la misma forma
      return (data.data || []).map((r) => ({
        id:          r.id_historial_af,
        origen:      'afiliado',            // distingue la fuente
        tipo:        r.tipo,                // AFILIACION | MODIFICACION | DESAFILIACION | REAFILIACION
        descripcion: r.detalle || '',
        fecha:       r.fecha,
        hora:        r.hora,
        responsable: r.nom_usuario_master
          ? `${r.nom_usuario_master} — ${r.nom_afiliado_master}`
          : 'sistema',
      }));
    } catch (error) {
      console.error('historialService.obtenerHistorialAfiliacion:', error);
      throw error;
    }
  },

  /**
   * Historial de participación en el Directorio (INGRESO / EGRESO)
   * @param {number|string} idAfiliado
   * @returns {Promise<Array>}
   */
  obtenerHistorialDirectorio: async (idAfiliado) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/directorio/historial/afiliado/${idAfiliado}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Error ${response.status}`);
      }
      const data = await response.json();
      return (data.data || []).map((r) => ({
        id:          r.id_historial_dir,
        origen:      'directorio',
        tipo:        r.tipo,               // INGRESO | EGRESO
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
    } catch (error) {
      console.error('historialService.obtenerHistorialDirectorio:', error);
      throw error;
    }
  },

  /**
   * Combina y ordena ambos historiales por fecha/hora descendente
   * @param {number|string} idAfiliado
   * @returns {Promise<Array>}
   */
  obtenerHistorialCompleto: async (idAfiliado) => {
    const [afiliacion, directorio] = await Promise.allSettled([
      historialService.obtenerHistorialAfiliacion(idAfiliado),
      historialService.obtenerHistorialDirectorio(idAfiliado),
    ]);

    const registros = [
      ...(afiliacion.status  === 'fulfilled' ? afiliacion.value  : []),
      ...(directorio.status === 'fulfilled' ? directorio.value : []),
    ];

    // Orden descendente: primero el más reciente
    registros.sort((a, b) => {
      const fechaA = `${a.fecha} ${a.hora || ''}`;
      const fechaB = `${b.fecha} ${b.hora || ''}`;
      return fechaB.localeCompare(fechaA);
    });

    return registros;
  },
};