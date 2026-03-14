// ============================================================
// DIRECTORIO HANDLERS — funciones puras
// ============================================================

/**
 * Calcula el año de fin de gestión (base + 2).
 * @param {number|string} anioInicio
 * @returns {number}
 */
export const calcularAnioFin = (anioInicio) => {
    const inicio = parseInt(anioInicio, 10);
    return isNaN(inicio) ? '' : inicio + 2;
  };
  
  /**
   * Construye el label legible de una gestión.
   * @param {number} anioInicio
   * @param {number} anioFin
   * @returns {string}
   */
  export const labelGestion = (anioInicio, anioFin) =>
    `${anioInicio} — ${anioFin}`;
  
  /**
   * Inicializa las filas del modal a partir del estado actual del cuadro.
   * Cada fila hereda los datos del directorio vigente para la gestión.
   *
   * @param {Array} filasDirectorio  - filas del hook useDirectorio
   * @returns {Array}  filasModal
   */
  export const inicializarFilasModal = (filasDirectorio) =>
    filasDirectorio.map((fila) => ({
      id_secretaria:    fila.id_secretaria,
      nom_secretaria:   fila.nom_secretaria,
      orden:            fila.orden,
      // Estado previo (para detectar cambios en useGuardarGestion)
      id_directorio:    fila.id_directorio,
      id_afiliado_prev: fila.id_afiliado,
      // Estado nuevo (lo que el usuario ingresa en el modal)
      id_afiliado_nuevo:   fila.id_afiliado   || null,
      nom_afiliado_nuevo:  fila.nom_afiliado  || '',
      ci_nuevo:            fila.ci            || '',
    }));
  
  /**
   * Inicializa las filas del modal con todas las secretarías vacías
   * (para el caso de "Nueva Gestión").
   *
   * @param {Array} secretarias  - lista de secretarías del catálogo
   * @returns {Array}
   */
  export const inicializarFilasVacias = (secretarias) =>
    secretarias.map((sec) => ({
      id_secretaria:     sec.id_secretaria,
      nom_secretaria:    sec.nombre,
      orden:             sec.orden,
      id_directorio:     null,
      id_afiliado_prev:  null,
      id_afiliado_nuevo: null,
      nom_afiliado_nuevo:'',
      ci_nuevo:          '',
    }));
  
  /**
   * Actualiza una fila del modal con el afiliado seleccionado.
   *
   * @param {Array}  filas
   * @param {number} idSecretaria
   * @param {Object|null} afiliado  - { id, nombre, paterno, materno, ci, extension } o null para limpiar
   * @returns {Array}  nueva copia del array
   */
  export const actualizarAfiliadoEnFila = (filas, idSecretaria, afiliado) =>
    filas.map((f) =>
      f.id_secretaria === idSecretaria
        ? {
            ...f,
            id_afiliado_nuevo:  afiliado ? (afiliado.id || afiliado.id_afiliado) : null,
            nom_afiliado_nuevo: afiliado
              ? `${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno || ''}`.trim()
              : '',
            ci_nuevo: afiliado ? afiliado.ci : '',
          }
        : f
    );
  
  /**
   * Valida que el año inicio sea razonable (entre 1990 y año actual + 5).
   * @param {number} anio
   * @returns {string|null}  mensaje de error o null si es válido
   */
  export const validarAnioInicio = (anio) => {
    const n = parseInt(anio, 10);
    const ahora = new Date().getFullYear();
    if (isNaN(n))              return 'El año debe ser un número';
    if (n < 1990)              return 'El año es demasiado antiguo';
    if (n > ahora + 5)         return 'El año está muy adelantado';
    return null;
  };