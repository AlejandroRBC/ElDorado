// ============================================
// MIDDLEWARE — NORMALIZAR CAMPOS DE AFILIADO
// Convierte los campos de texto a mayúsculas
// antes de que lleguen al controlador.
// ============================================

/**
 * Campos del modelo `afiliado` que deben guardarse en MAYÚSCULAS.
 * Agrega o quita campos según necesites.
 */
const CAMPOS_TEXTO = [
    'nombre',
    'paterno',
    'materno',
    'ocupacion',
    'direccion',
    'extension',
    'ci',        // p.ej. "7a" → "7A" (sufijos de duplicados SEGIP)
    'rubro',
  ];
  
  /**
   * normalizeAfiliado
   * Itera sobre CAMPOS_TEXTO y, si el campo existe en req.body
   * y es una cadena no vacía, lo transforma a mayúsculas con trim().
   * Llama a next() para continuar hacia el controlador.
   */
  const normalizeAfiliado = (req, res, next) => {
    CAMPOS_TEXTO.forEach((campo) => {
      if (req.body[campo] && typeof req.body[campo] === 'string') {
        req.body[campo] = req.body[campo].trim().toUpperCase();
      }
    });
    next();
  };
  
  module.exports = { normalizeAfiliado };