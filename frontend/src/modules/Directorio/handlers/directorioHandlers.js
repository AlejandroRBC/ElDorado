// modules/Directorio/handlers/directorioHandlers.js

// ============================================================
// DIRECTORIO HANDLERS — funciones puras
// ============================================================

/**
 * Calcula el año de fin de gestión sumando 2 al año inicio.
 */
export const calcularAnioFin = (anioInicio) => {
  const inicio = parseInt(anioInicio, 10);
  return isNaN(inicio) ? '' : inicio + 2;
};

/**
 * Construye el label legible de una gestión: "2023 — 2025".
 */
export const labelGestion = (anioInicio, anioFin) =>
  `${anioInicio} — ${anioFin}`;

/**
 * Inicializa las filas del modal a partir del estado actual del cuadro.
 * Cada fila hereda los datos del directorio vigente para la gestión.
 */
export const inicializarFilasModal = (filasDirectorio) =>
  filasDirectorio.map((fila) => ({
    id_secretaria:     fila.id_secretaria,
    nom_secretaria:    fila.nom_secretaria,
    orden:             fila.orden,
    id_directorio:     fila.id_directorio,
    id_afiliado_prev:  fila.id_afiliado,
    id_afiliado_nuevo:  fila.id_afiliado  || null,
    nom_afiliado_nuevo: fila.nom_afiliado || '',
    ci_nuevo:           fila.ci           || '',
  }));

/**
 * Inicializa las filas del modal con todas las secretarías vacías
 * para el caso de "Nueva Gestión".
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
 * Recibe null para limpiar la selección.
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
 * Retorna mensaje de error o null si es válido.
 */
export const validarAnioInicio = (anio) => {
  const n     = parseInt(anio, 10);
  const ahora = new Date().getFullYear();
  if (isNaN(n))      return 'El año debe ser un número';
  if (n < 1990)      return 'El año es demasiado antiguo';
  if (n > ahora + 5) return 'El año está muy adelantado';
  return null;
};