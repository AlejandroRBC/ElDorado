
// ============================================================
// HISTORIAL HANDLERS
// Funciones puras que encapsulan la lógica de interacción del
// modal de historial. Se separan del componente para mantener
// el JSX limpio y facilitar el testing.
// ============================================================

/**
 * Abre el modal de historial y dispara la carga de datos.
 *
 * @param {Function} setModalAbierto  - setState del modal
 * @param {Function} cargarHistorial  - función del hook
 * @param {number|string} idAfiliado
 */
export const handleAbrirHistorial = (setModalAbierto, cargarHistorial, idAfiliado) => {
    setModalAbierto(true);
    cargarHistorial(idAfiliado);
  };
  
  /**
   * Cierra el modal y limpia el estado del historial.
   *
   * @param {Function} setModalAbierto  - setState del modal
   * @param {Function} limpiarHistorial - función del hook
   */
  export const handleCerrarHistorial = (setModalAbierto, limpiarHistorial) => {
    setModalAbierto(false);
    limpiarHistorial();
  };
  
  /**
   * Formatea una fecha ISO (YYYY-MM-DD) a formato legible local.
   *
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
   *
   * @param {string} tipo
   * @returns {string}
   */
  export const etiquetaTipo = (tipo) => {
    const mapa = {
      AFILIACION:   'Afiliación',
      MODIFICACION: 'Edición',
      DESAFILIACION:'Desafiliación',
      REAFILIACION: 'Reafiliación',
      INGRESO:      'Directorio — Ingreso',
      EGRESO:       'Directorio — Egreso',
    };
    return mapa[tipo] || tipo;
  };
  
  /**
   * Determina el grupo visual (color de acento, icono) según tipo y origen.
   * Devuelve solo valores del sistema de colores del proyecto.
   *
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
      AFILIACION:   { color: '#374567', iconColor: '#374567' },
      MODIFICACION: { color: '#0E1528', iconColor: '#0E1528' },
      DESAFILIACION:{ color: '#0F0F0F', iconColor: '#0F0F0F' },
      REAFILIACION: { color: '#374567', iconColor: '#374567' },
    };
    return mapa[tipo] || { color: '#0F0F0F', iconColor: '#0F0F0F' };
  };