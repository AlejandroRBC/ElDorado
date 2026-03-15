// frontend/src/modules/Afiliados/hooks/useAsignarPuesto.js

// ============================================
// HOOK USE ASIGNAR PUESTO
// ============================================

import { useState, useCallback } from 'react';
import { notifications }         from '@mantine/notifications';
import { afiliadosService }      from '../services/afiliadosService';

/**
 * Gestiona la carga, filtrado y asignación de puestos disponibles
 * para un afiliado específico.
 *
 * idAfiliado - ID del afiliado al que se asignará el puesto
 */
export const useAsignarPuesto = (idAfiliado) => {
  const [loading,            setLoading]            = useState(false);
  const [puestosDisponibles, setPuestosDisponibles] = useState([]);
  const [puestosFiltrados,   setPuestosFiltrados]   = useState([]);
  const [puestosCargando,    setPuestosCargando]    = useState(false);

  const [filtros, setFiltros] = useState({
    fila:      '',
    cuadra:    '',
    nroPuesto: '',
    rubro:     '',
  });

  const [opcionesFiltros, setOpcionesFiltros] = useState({
    filas:          [],
    cuadras:        [],
    total:          0,
    rango_numeros:  { min: 1, max: 100 },
  });

  /**
   * Carga los puestos disponibles desde el backend y extrae
   * las opciones únicas de fila, cuadra y rango de números.
   */
  const cargarPuestosDisponibles = useCallback(async () => {
    try {
      setPuestosCargando(true);
      const puestos = await afiliadosService.obtenerPuestosDisponibles();

      setPuestosDisponibles(puestos || []);
      setPuestosFiltrados(puestos || []);

      const filas    = [...new Set(puestos.map(p => p.fila))].sort();
      const cuadras  = [...new Set(puestos.map(p => p.cuadra))].sort();
      const numeros  = puestos.map(p => p.nroPuesto);

      setOpcionesFiltros({
        filas,
        cuadras,
        total:         puestos.length,
        rango_numeros: {
          min: numeros.length > 0 ? Math.min(...numeros) : 1,
          max: numeros.length > 0 ? Math.max(...numeros) : 100,
        },
      });

      return puestos;
    } catch (error) {
      console.error('Error cargando puestos disponibles:', error);
      notifications.show({
        title:   'Error',
        message: 'No se pudieron cargar los puestos disponibles',
        color:   'red',
      });
      return [];
    } finally {
      setPuestosCargando(false);
    }
  }, []);

  /**
   * Aplica uno o más filtros sobre la lista de puestos disponibles.
   * Soporta filtros por fila, cuadra, nroPuesto y rubro.
   */
  const aplicarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => {
      const filtrosActualizados = { ...prev, ...nuevosFiltros };
      let resultados = [...puestosDisponibles];

      if (filtrosActualizados.fila) {
        resultados = resultados.filter(p => p.fila === filtrosActualizados.fila);
      }
      if (filtrosActualizados.cuadra) {
        resultados = resultados.filter(p => p.cuadra === filtrosActualizados.cuadra);
      }
      if (filtrosActualizados.nroPuesto) {
        const numBuscado = parseInt(filtrosActualizados.nroPuesto);
        if (!isNaN(numBuscado)) {
          resultados = resultados.filter(p => p.nroPuesto === numBuscado);
        }
      }
      if (filtrosActualizados.rubro) {
        const termino = filtrosActualizados.rubro.toLowerCase();
        resultados = resultados.filter(p =>
          p.rubro && p.rubro.toLowerCase().includes(termino)
        );
      }

      setPuestosFiltrados(resultados);
      return filtrosActualizados;
    });
  }, [puestosDisponibles]);

  /**
   * Limpia todos los filtros y muestra la lista completa.
   */
  const limpiarFiltros = useCallback(() => {
    setFiltros({ fila: '', cuadra: '', nroPuesto: '', rubro: '' });
    setPuestosFiltrados(puestosDisponibles);
  }, [puestosDisponibles]);

  /**
   * Asigna un puesto al afiliado y recarga la lista de disponibles.
   */
  const asignarPuesto = useCallback(async (puestoData) => {
    try {
      setLoading(true);

      const dataToSend = {
        id_puesto:     puestoData.id_puesto,
        fila:          puestoData.fila,
        cuadra:        puestoData.cuadra,
        nroPuesto:     puestoData.nroPuesto,
        rubro:         puestoData.rubro || '',
        tiene_patente: puestoData.tiene_patente || false,
        razon:         'ASIGNADO',
      };

      const resultado = await afiliadosService.asignarPuesto(idAfiliado, dataToSend);

      notifications.show({
        title:   '✅ Éxito',
        message: `Puesto ${puestoData.nroPuesto}-${puestoData.fila}-${puestoData.cuadra} asignado`,
        color:   'green',
      });

      await cargarPuestosDisponibles();
      return { exito: true, datos: resultado };
    } catch (error) {
      console.error('Error asignando puesto:', error);

      const estaOcupado = error.message?.includes('ocupado') ||
                          error.message?.includes('disponible');
      notifications.show({
        title:   estaOcupado ? '⚠️ Puesto no disponible' : '❌ Error',
        message: estaOcupado ? 'Este puesto ya está ocupado' : (error.message || 'No se pudo asignar el puesto'),
        color:   estaOcupado ? 'yellow' : 'red',
      });

      return { exito: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [idAfiliado, cargarPuestosDisponibles]);

  return {
    puestosDisponibles,
    puestosFiltrados,
    puestosCargando,
    loading,
    filtros,
    opcionesFiltros,
    cargarPuestosDisponibles,
    aplicarFiltros,
    limpiarFiltros,
    asignarPuesto,
  };
};