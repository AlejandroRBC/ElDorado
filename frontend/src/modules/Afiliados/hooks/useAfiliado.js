// frontend/src/modules/Afiliados/hooks/useAfiliado.js

// ============================================
// HOOK USE AFILIADO
// ============================================

import { useState, useEffect } from 'react';
import { afiliadosService }    from '../services/afiliadosService';

/**
 * Carga y expone los datos de un afiliado por su ID.
 * Se recarga automáticamente si el ID cambia.
 *
 * id - ID del afiliado a cargar
 */
export const useAfiliado = (id) => {
  const [afiliado, setAfiliado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  /**
   * Carga los datos del afiliado desde el backend.
   */
  const cargarAfiliado = async () => {
    try {
      setCargando(true);
      setError(null);

      if (!id) throw new Error('ID de afiliado no proporcionado');

      const datos = await afiliadosService.obtenerPorId(id);
      setAfiliado(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar afiliado');
      console.error(`Error cargando afiliado ${id}:`, err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (id) cargarAfiliado();
  }, [id]);

  return { afiliado, cargando, error, cargarAfiliado };
};