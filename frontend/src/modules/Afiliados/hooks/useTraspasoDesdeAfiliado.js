// frontend/src/modules/Afiliados/hooks/useTraspasoDesdeAfiliado.js

// ============================================
// HOOK USE TRASPASO DESDE AFILIADO
// ============================================

import { useState }         from 'react';
import { notifications }    from '@mantine/notifications';
import { puestosService }   from '../../GestionPatentesPuestos/service/puestosService';

/**
 * Gestiona el flujo de traspaso de un puesto iniciado desde
 * la ficha de un afiliado (emisor predefinido).
 * Controla la apertura/cierre del modal y la ejecución del traspaso.
 */
export const useTraspasoDesdeAfiliado = () => {
  const [loading,               setLoading]               = useState(false);
  const [modalTraspasoAbierto,  setModalTraspasoAbierto]  = useState(false);
  const [puestoParaTraspaso,    setPuestoParaTraspaso]    = useState(null);
  const [onSuccessCallback,     setOnSuccessCallback]     = useState(null);

  /**
   * Abre el modal de traspaso para el puesto dado.
   * Valida que el puesto tenga un ID válido antes de abrir.
   */
  const abrirModalTraspaso = (puesto, onSuccess) => {
    if (!puesto?.id_puesto) {
      notifications.show({
        title:   '❌ Error',
        message: 'El puesto seleccionado no tiene un ID válido',
        color:   'red',
      });
      return;
    }
    setPuestoParaTraspaso(puesto);
    setOnSuccessCallback(() => onSuccess);
    setModalTraspasoAbierto(true);
  };

  /**
   * Cierra el modal y limpia el estado del traspaso.
   */
  const cerrarModalTraspaso = () => {
    setModalTraspasoAbierto(false);
    setPuestoParaTraspaso(null);
    setOnSuccessCallback(null);
  };

  /**
   * Ejecuta el traspaso llamando al servicio de puestos.
   * Llama al callback de éxito si el traspaso fue exitoso.
   */
  const ejecutarTraspaso = async (data) => {
    try {
      setLoading(true);

      const resultado = await puestosService.traspasar({
        id_puesto:         data.puestos[0],
        id_nuevo_afiliado: data.para,
        razon:             data.motivoDetallado || 'TRASPASO',
      });

      if (resultado.success) {
        notifications.show({
          title:   'Éxito',
          message: 'Puesto traspasado correctamente',
          color:   'green',
        });
        if (onSuccessCallback) onSuccessCallback();
        cerrarModalTraspaso();
        return { exito: true };
      } else {
        throw new Error(resultado.error || 'Error al traspasar');
      }
    } catch (error) {
      console.error('Error en traspaso:', error);
      notifications.show({
        title:   '❌ Error',
        message: error.response?.data?.error || error.message || 'No se pudo realizar el traspaso',
        color:   'red',
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
    ejecutarTraspaso,
  };
};