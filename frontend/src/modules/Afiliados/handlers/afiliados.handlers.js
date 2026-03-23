// ─────────────────────────────────────────────────────────────
// HISTORIAL
// ─────────────────────────────────────────────────────────────

/**
 * Abre el modal de historial y dispara la carga de datos.
 * @param {Function} setModalAbierto
 * @param {Function} cargarHistorial
 * @param {number|string} idAfiliado
 */
export const handleAbrirHistorial = (setModalAbierto, cargarHistorial, idAfiliado) => {
    setModalAbierto(true);
    cargarHistorial(idAfiliado);
  };
  
  /**
   * Cierra el modal y limpia el estado del historial.
   * @param {Function} setModalAbierto
   * @param {Function} limpiarHistorial
   */
  export const handleCerrarHistorial = (setModalAbierto, limpiarHistorial) => {
    setModalAbierto(false);
    limpiarHistorial();
  };
  
  // ─────────────────────────────────────────────────────────────
  // FORMATEO
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Formatea una fecha ISO (YYYY-MM-DD) a formato legible local.
   * @param {string} fecha
   * @returns {string}
   */
  export const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-ES', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
      });
    } catch {
      return fecha;
    }
  };
  
  /**
   * Devuelve la etiqueta legible de cada tipo de evento.
   * @param {string} tipo
   * @returns {string}
   */
  export const etiquetaTipo = (tipo) => {
    const mapa = {
      AFILIACION:    'Afiliación',
      MODIFICACION:  'Edición',
      DESAFILIACION: 'Desafiliación',
      REAFILIACION:  'Reafiliación',
      INGRESO:       'Directorio — Ingreso',
      EGRESO:        'Directorio — Egreso',
    };
    return mapa[tipo] || tipo;
  };
  
  /**
   * Determina el grupo visual (color de acento) según tipo y origen.
   * Devuelve valores del sistema de colores del proyecto.
   * @param {string} tipo
   * @param {string} origen  'afiliado' | 'directorio'
   * @returns {{ color: string, iconColor: string }}
   */
  export const metadatosTipo = (tipo, origen) => {
    if (origen === 'directorio') {
      return {
        color:     tipo === 'INGRESO' ? '#374567' : '#C4C4C4',
        iconColor: tipo === 'INGRESO' ? '#374567' : '#C4C4C4',
      };
    }
    const mapa = {
      AFILIACION:    { color: '#374567', iconColor: '#374567' },
      MODIFICACION:  { color: '#0E1528', iconColor: '#0E1528' },
      DESAFILIACION: { color: '#0F0F0F', iconColor: '#0F0F0F' },
      REAFILIACION:  { color: '#374567', iconColor: '#374567' },
    };
    return mapa[tipo] || { color: '#0F0F0F', iconColor: '#0F0F0F' };
  };
  
  // ─────────────────────────────────────────────────────────────
  // IMAGEN DE PERFIL
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Inyecta el SVG de fallback cuando la imagen de perfil no carga.
   * Se usa en el evento onError de <img>.
   * @param {HTMLElement} parentElement
   */
  export const renderFallbackPerfil = (parentElement) => {
    parentElement.innerHTML = `
      <div class="foto-perfil-fallback">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>`;
  };
  
  // ─────────────────────────────────────────────────────────────
  // FILTROS — etiquetas para FiltrosActivos
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Devuelve el texto legible de un filtro activo para mostrarlo como badge.
   * @param {string} tipo
   * @param {string|number} valor
   * @returns {string}
   */
  export const etiquetaFiltro = (tipo, valor) => {
    switch (tipo) {
      case 'search':      return `Búsqueda: ${valor}`;
      case 'conPatente':  return valor === 'true' ? 'Con patente' : 'Sin patente';
      case 'puestoCount': return valor === '5' ? '5+ puestos' : `${valor} puesto${valor !== '1' ? 's' : ''}`;
      case 'rubro':       return `Rubro: ${valor}`;
      case 'orden':       return `Orden: ${valor === 'registro' ? 'Fecha registro' : valor}`;
      default:            return String(valor);
    }
  };