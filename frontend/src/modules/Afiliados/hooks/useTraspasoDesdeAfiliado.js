
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { puestosService } from '../../GestionPatentesPuestos/service/puestosService';

export const useTraspasoDesdeAfiliado = () => {
  const [loading, setLoading] = useState(false);
  const [modalTraspasoAbierto, setModalTraspasoAbierto] = useState(false);
  const [puestoParaTraspaso, setPuestoParaTraspaso] = useState(null);

  const abrirModalTraspaso = (puesto) => {
    setPuestoParaTraspaso(puesto);
    setModalTraspasoAbierto(true);
  };

  const cerrarModalTraspaso = () => {
    setModalTraspasoAbierto(false);
    setPuestoParaTraspaso(null);
  };

  const ejecutarTraspaso = async (data) => {
    try {
      setLoading(true);

      const resultado = await puestosService.traspasar({
        id_puesto: data.puestos[0],
        id_nuevo_afiliado: data.para,
        razon: data.motivoDetallado || 'TRASPASO'
      });

      if (resultado.success) {
        notifications.show({
          title: '✅ Éxito',
          message: 'Puesto traspasado correctamente',
          color: 'green'
        });

        cerrarModalTraspaso();
        return { exito: true };
      } else {
        throw new Error(resultado.error || 'Error al traspasar');
      }
    } catch (error) {
      console.error('Error en traspaso:', error);
      notifications.show({
        title: '❌ Error',
        message: error.message || 'No se pudo realizar el traspaso',
        color: 'red'
      });
      return { exito: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    modalTraspasoAbierto,
    puestoParaTraspaso,
    abrirModalTraspaso,
    cerrarModalTraspaso,
    ejecutarTraspaso
  };
};