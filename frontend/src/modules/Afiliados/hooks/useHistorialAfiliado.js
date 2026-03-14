// hooks/useHistorialAfiliado.js
import { useState, useCallback } from 'react';
import { historialService } from '../services/historialService';

// ============================================================
// HOOK useHistorialAfiliado
// Gestiona la carga del historial completo de un afiliado
// (afiliación + directorio), el estado de carga y los errores.
//
// Responsabilidades:
//   - Llamar a historialService.obtenerHistorialCompleto
//   - Manejar cargando / error
//   - Exponer la función de carga para que el modal la llame
//     solo cuando se abre (lazy fetch)
// ============================================================

export const useHistorialAfiliado = () => {
  const [historial,  setHistorial]  = useState([]);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState(null);

  /**
   * Carga el historial del afiliado.
   * Se llama desde el handler al abrir el modal para evitar
   * peticiones innecesarias mientras el modal está cerrado.
   *
   * @param {number|string} idAfiliado
   */
  const cargarHistorial = useCallback(async (idAfiliado) => {
    if (!idAfiliado) return;
    try {
      setCargando(true);
      setError(null);
      setHistorial([]);
      const datos = await historialService.obtenerHistorialCompleto(idAfiliado);
      setHistorial(datos);
    } catch (err) {
      console.error('useHistorialAfiliado:', err);
      setError(err.message || 'No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  }, []);

  /** Limpia el estado al cerrar el modal */
  const limpiarHistorial = useCallback(() => {
    setHistorial([]);
    setError(null);
  }, []);

  return {
    historial,
    cargando,
    error,
    cargarHistorial,
    limpiarHistorial,
  };
};