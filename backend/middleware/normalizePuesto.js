// ============================================
// MIDDLEWARE — NORMALIZAR CAMPOS DE PUESTO
// Convierte los campos de texto a mayúsculas
// antes de que lleguen al controlador.
// ============================================

/**
 * Campos del modelo `puesto` que deben guardarse en MAYÚSCULAS.
 * `fila` y `cuadra` también se normalizan por consistencia con
 * los CHECK constraints de la BD (fila IN ('A','B','C','D','E')).
 */
const CAMPOS_TEXTO = [
    'rubro',
    'fila',
    'cuadra',
  ];
  
  /**
   * normalizePuesto
   * Itera sobre CAMPOS_TEXTO y, si el campo existe en req.body
   * y es una cadena no vacía, lo transforma a mayúsculas con trim().
   * Llama a next() para continuar hacia el controlador.
   */
  const normalizePuesto = (req, res, next) => {
    CAMPOS_TEXTO.forEach((campo) => {
      if (req.body[campo] && typeof req.body[campo] === 'string') {
        req.body[campo] = req.body[campo].trim().toUpperCase();
      }
    });
    next();
  };
  
  module.exports = { normalizePuesto };