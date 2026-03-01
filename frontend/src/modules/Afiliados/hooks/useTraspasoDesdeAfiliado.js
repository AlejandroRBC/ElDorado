// frontend/src/modules/Afiliados/hooks/useTraspasoDesdeAfiliado.js
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { puestosService } from '../../GestionPatentesPuestos/service/puestosService';

export const useTraspasoDesdeAfiliado = () => {
  const [loading, setLoading] = useState(false);
  const [modalTraspasoAbierto, setModalTraspasoAbierto] = useState(false);
  const [puestoParaTraspaso, setPuestoParaTraspaso] = useState(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);

  const abrirModalTraspaso = (puesto, onSuccess) => {
    if (!puesto?.id_puesto) {
      notifications.show({
        title: '❌ Error',
        message: 'El puesto seleccionado no tiene un ID válido',
        color: 'red'
      });
      return;
    }
    
    console.log('Abriendo modal con puesto:', puesto);
    setPuestoParaTraspaso(puesto);
    setOnSuccessCallback(() => onSuccess); // Guardar el callback
    setModalTraspasoAbierto(true);
  };

  const cerrarModalTraspaso = () => {
    setModalTraspasoAbierto(false);
    setPuestoParaTraspaso(null);
    setOnSuccessCallback(null);
  };

  const ejecutarTraspaso = async (data) => {
    try {
      setLoading(true);
      console.log('Ejecutando traspaso con data:', data);

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

        // Ejecutar callback si existe
        if (onSuccessCallback) {
          onSuccessCallback();
        }

        cerrarModalTraspaso();
        return { exito: true };
      } else {
        throw new Error(resultado.error || 'Error al traspasar');
      }
    } catch (error) {
      console.error('Error en traspaso:', error);
      notifications.show({
        title: '❌ Error',
        message: error.response?.data?.error || error.message || 'No se pudo realizar el traspaso',
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