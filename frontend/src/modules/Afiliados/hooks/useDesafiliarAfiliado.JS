// frontend/src/modules/Afiliados/hooks/useDesafiliarAfiliado.js

// ============================================
// HOOK USE DESAFILIAR AFILIADO
// ============================================

import { useState }         from 'react';
import { notifications }    from '@mantine/notifications';
import { afiliadosService } from '../services/afiliadosService';

/**
 * Encapsula la lógica de deshabilitación de un afiliado.
 * Gestiona el estado de carga y las notificaciones de resultado.
 *
 * Responsabilidades del hook:
 *   - Llamar a afiliadosService.deshabilitarAfiliado
 *   - Gestionar cargando
 *   - Mostrar notificaciones de éxito/error
 *
 * Responsabilidades del componente (UI pura):
 *   - Cerrar el modal de confirmación
 *   - Navegar a /afiliados tras el éxito
 */
export const useDesafiliarAfiliado = () => {
  const [cargando, setCargando] = useState(false);

  /**
   * Deshabilita un afiliado por su ID.
   * Devuelve { exito: true } o { exito: false, error } según el resultado.
   */
  const desafiliar = async (id) => {
    try {
      setCargando(true);
      await afiliadosService.deshabilitarAfiliado(id);
      notifications.show({
        title:     'Afiliado Desafiliado',
        message:   'El afiliado ha sido deshabilitado y sus puestos han sido despojados',
        color:     'green',
        autoClose: 5000,
      });
      return { exito: true };
    } catch (err) {
      notifications.show({
        title:   'Error',
        message: err.message || 'No se pudo desafiliar al afiliado',
        color:   'red',
      });
      return { exito: false, error: err.message };
    } finally {
      setCargando(false);
    }
  };

  return { desafiliar, cargando };
};