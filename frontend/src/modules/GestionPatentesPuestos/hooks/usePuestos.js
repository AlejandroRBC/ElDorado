
import { useEffect, useState } from "react";
import { puestosService } from "../service/puestosService";
import { notifications } from '@mantine/notifications';

export function usePuestos(closeEditar, closeTraspaso, closeAsignar) {
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [puestoParaTraspaso, setPuestoParaTraspaso] = useState(null);
  const [puestoParaAsignar, setPuestoParaAsignar] = useState(null); // ← Nuevo estado

  const cargarPuestos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await puestosService.listar();
      setPuestos(data);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los puestos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPuestos();
  }, []);

  const handleGuardarEdicion = async (data) => {
    try {
      setLoading(true);
      await puestosService.actualizarPuesto(data.id_puesto, data);
      await cargarPuestos();
      closeEditar();
      notifications.show({
        title: '✅ Éxito',
        message: 'Puesto actualizado correctamente',
        color: 'green'
      });
    } catch (e) {
      console.error(e);
      setError("Error al actualizar");
      notifications.show({
        title: '❌ Error',
        message: 'No se pudo actualizar el puesto',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEjecutarTraspaso = async (data) => {
    try {
      setLoading(true);

      const idPuesto = data.puestos[0];

      if (data.desde === data.para) {
        notifications.show({
          title: '⚠️ Error',
          message: 'No puede traspasar a sí mismo',
          color: 'yellow'
        });
        return;
      }

      const resultado = await puestosService.traspasar({
        id_puesto: idPuesto,
        id_nuevo_afiliado: data.para,
        razon: data.motivoDetallado || "Traspaso sistema"
      });

      if (resultado.success) {
        await cargarPuestos();
        closeTraspaso();
        notifications.show({
          title: '✅ Éxito',
          message: 'Traspaso realizado correctamente',
          color: 'green'
        });
      }

    } catch (e) {
      console.error(e);
      setError("Error al realizar traspaso");
      notifications.show({
        title: '❌ Error',
        message: e.response?.data?.error || 'Error al realizar traspaso',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para manejar la asignación exitosa
  const handleAsignacionExitosa = () => {
    cargarPuestos();
    notifications.show({
      title: '✅ Éxito',
      message: 'Puesto asignado correctamente',
      color: 'green'
    });
  };

  return {
    puestos,
    loading,
    error,
    cargarPuestos,
    handleGuardarEdicion,
    handleEjecutarTraspaso,
    handleAsignacionExitosa,
    puestoParaTraspaso,
    setPuestoParaTraspaso,
    puestoParaAsignar,      // ← Nuevo
    setPuestoParaAsignar,   // ← Nuevo
    puestoSeleccionado,
    setPuestoSeleccionado
  };
}