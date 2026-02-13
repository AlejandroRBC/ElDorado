import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { afiliadosService } from '../services/afiliadosService';

export const useAsignarPuesto = (idAfiliado) => {
  const [loading, setLoading] = useState(false);
  const [puestosDisponibles, setPuestosDisponibles] = useState([]);
  const [puestosCargando, setPuestosCargando] = useState(false);

  const cargarPuestosDisponibles = async () => {
    try {
      setPuestosCargando(true);
      // Llamar al endpoint que devuelve puestos disponibles (no ocupados, no pasos)
      const puestos = await afiliadosService.obtenerPuestosDisponibles();
      setPuestosDisponibles(puestos);
      return puestos;
    } catch (error) {
      console.error('Error cargando puestos disponibles:', error);
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los puestos disponibles',
        color: 'red'
      });
      return [];
    } finally {
      setPuestosCargando(false);
    }
  };

  const asignarPuesto = async (puestoData) => {
    try {
      setLoading(true);
      
      const dataToSend = {
        id_puesto: puestoData.id_puesto,
        fila: puestoData.fila,
        cuadra: puestoData.cuadra,
        nroPuesto: puestoData.nroPuesto,
        rubro: puestoData.rubro || '',
        tiene_patente: puestoData.tiene_patente || false,
        razon: 'ASIGNADO'  // 👈 Cambiado de 'NUEVITO' a 'ASIGNADO'
      };

      const resultado = await afiliadosService.asignarPuesto(idAfiliado, dataToSend);
      
      notifications.show({
        title: 'Éxito',
        message: `Puesto ${puestoData.nroPuesto}-${puestoData.fila}-${puestoData.cuadra} asignado correctamente`,
        color: 'green'
      });
      
      return { exito: true, datos: resultado };
    } catch (error) {
      console.error('Error asignando puesto:', error);
      
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo asignar el puesto',
        color: 'red'
      });
      
      return { exito: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    puestosDisponibles,
    puestosCargando,
    loading,
    cargarPuestosDisponibles,
    asignarPuesto
  };
};