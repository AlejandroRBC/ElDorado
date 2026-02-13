import { useEffect, useState } from "react";
import { puestosService } from "../service/puestosService";

export function usePuestos(closeEditar, closeTraspaso) {

  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [puestoParaTraspaso, setPuestoParaTraspaso] = useState(null);

  const cargarPuestos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await puestosService.listar();
      console.log("Todos los datos que llegan del servidor:", data);
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
    } catch (e) {
      console.error(e);
      setError("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const handleEjecutarTraspaso = async (data) => {
    try {
      setLoading(true);

      const idPuesto = data.puestos[0];

      if (data.desde === data.para) {
        alert("No puede traspasar a sí mismo");
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
      }

    } catch (e) {
      console.error(e);
      setError("Error al realizar traspaso");
    } finally {
      setLoading(false);
    }
  };

  return {
    puestos,
    loading,
    error,
    cargarPuestos,
    handleGuardarEdicion,
    handleEjecutarTraspaso,
    puestoParaTraspaso,
    setPuestoParaTraspaso,
    puestoSeleccionado,
    setPuestoSeleccionado
  };
}
