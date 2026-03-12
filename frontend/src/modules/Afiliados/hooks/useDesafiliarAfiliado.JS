import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { afiliadosService } from '../services/afiliadosService';

// ============================================================
// HOOK useDesafiliarAfiliado
// ============================================================
// Encapsula la llamada al servicio, el estado de carga y las
// notificaciones de éxito/error.
//
// Responsabilidades del hook:
//   - Llamar a afiliadosService.deshabilitarAfiliado(id)
//   - Gestionar `cargando`
//   - Mostrar notificaciones
//   - Devolver { exito: true/false } para que el componente
//     decida qué hacer en la UI (cerrar modal, navegar, etc.)
//
// Responsabilidades que QUEDAN en el componente (UI pura):
//   - Cerrar el modal de confirmación
//   - Navegar a /afiliados tras el éxito
// ============================================================

export const useDesafiliarAfiliado = () => {
  const [cargando, setCargando] = useState(false);

  const desafiliar = async (id) => {
    try {
      setCargando(true);

      await afiliadosService.deshabilitarAfiliado(id);

      notifications.show({
        title:     '✅ Afiliado Desafiliado',
        message:   'El afiliado ha sido deshabilitado y sus puestos han sido despojados',
        color:     'green',
        autoClose: 5000,
      });

      return { exito: true };
    } catch (err) {
      notifications.show({
        title:   '❌ Error',
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