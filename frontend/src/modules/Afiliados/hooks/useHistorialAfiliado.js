// frontend/src/modules/Afiliados/hooks/useHistorialAfiliado.js

// ============================================
// HOOK USE HISTORIAL AFILIADO
// ============================================

import { useState, useCallback } from 'react';
import { historialService }      from '../services/historialService';

/**
 * Gestiona la carga lazy del historial completo de un afiliado.
 * Se llama desde el handler al abrir el modal para evitar
 * peticiones innecesarias mientras el modal está cerrado.
 */
export const useHistorialAfiliado = () => {
  const [historial, setHistorial] = useState([]);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState(null);

  /**
   * Carga el historial completo del afiliado por su ID.
   * Limpia el estado anterior antes de cada carga.
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

  /**
   * Limpia el historial y los errores al cerrar el modal.
   */
  const limpiarHistorial = useCallback(() => {
    setHistorial([]);
    setError(null);
  }, []);

  return { historial, cargando, error, cargarHistorial, limpiarHistorial };
};