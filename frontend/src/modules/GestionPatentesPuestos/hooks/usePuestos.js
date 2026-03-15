// frontend/src/modules/GestionPatentesPuestos/hooks/usePuestos.js

// ============================================
// HOOK USE PUESTOS
// ============================================

import { useEffect, useState }    from 'react';
import { puestosService }         from '../service/puestosService';
import { notifications }          from '@mantine/notifications';

/**
 * Hook principal del módulo de puestos.
 * Gestiona la carga de datos, edición, traspaso y asignación de puestos.
 *
 * closeEditar   - Función para cerrar el modal de edición
 * closeTraspaso - Función para cerrar el modal de traspaso
 * closeAsignar  - Función para cerrar el modal de asignación
 */
export function usePuestos(closeEditar, closeTraspaso, closeAsignar) {
  const [puestos,           setPuestos]           = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState(null);
  const [puestoSeleccionado,setPuestoSeleccionado]= useState(null);
  const [puestoParaTraspaso,setPuestoParaTraspaso]= useState(null);
  const [puestoParaAsignar, setPuestoParaAsignar] = useState(null);

  /**
   * Carga todos los puestos desde el backend.
   */
  const cargarPuestos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await puestosService.listar();
      setPuestos(data);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los puestos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarPuestos(); }, []);

  /**
   * Guarda los cambios de edición de un puesto y recarga la lista.
   */
  const handleGuardarEdicion = async (data) => {
    try {
      setLoading(true);
      await puestosService.actualizarPuesto(data.id_puesto, data);
      await cargarPuestos();
      closeEditar();
      notifications.show({ title: '✅ Éxito', message: 'Puesto actualizado correctamente', color: 'green' });
    } catch (e) {
      console.error(e);
      setError('Error al actualizar');
      notifications.show({ title: '❌ Error', message: 'No se pudo actualizar el puesto', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ejecuta el traspaso de un puesto entre dos afiliados.
   */
  const handleEjecutarTraspaso = async (data) => {
    try {
      setLoading(true);
      const idPuesto = data.puestos[0];

      if (data.desde === data.para) {
        notifications.show({ title: '⚠️ Error', message: 'No puede traspasar a sí mismo', color: 'yellow' });
        return;
      }

      const resultado = await puestosService.traspasar({
        id_puesto:         idPuesto,
        id_nuevo_afiliado: data.para,
        razon:             data.motivoDetallado || 'Traspaso sistema',
      });

      if (resultado.success) {
        await cargarPuestos();
        closeTraspaso();
        notifications.show({ title: '✅ Éxito', message: 'Traspaso realizado correctamente', color: 'green' });
      }
    } catch (e) {
      console.error(e);
      setError('Error al realizar traspaso');
      notifications.show({ title: '❌ Error', message: e.response?.data?.error || 'Error al realizar traspaso', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recarga los puestos al completar una asignación exitosa.
   */
  const handleAsignacionExitosa = () => {
    cargarPuestos();
    notifications.show({ title: '✅ Éxito', message: 'Puesto asignado correctamente', color: 'green' });
  };

  return {
    puestos, loading, error,
    cargarPuestos,
    handleGuardarEdicion,
    handleEjecutarTraspaso,
    handleAsignacionExitosa,
    puestoParaTraspaso,  setPuestoParaTraspaso,
    puestoParaAsignar,   setPuestoParaAsignar,
    puestoSeleccionado,  setPuestoSeleccionado,
  };
}