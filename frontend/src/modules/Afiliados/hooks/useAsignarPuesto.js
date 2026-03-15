// frontend/src/modules/Afiliados/hooks/useAsignarPuesto.js

import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { afiliadosService } from '../services/afiliadosService';

export const useAsignarPuesto = (idAfiliado) => {
  const [loading, setLoading] = useState(false);
  const [puestosDisponibles, setPuestosDisponibles] = useState([]);
  const [puestosFiltrados, setPuestosFiltrados] = useState([]);
  const [puestosCargando, setPuestosCargando] = useState(false);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    fila: '',
    cuadra: '',
    nroPuesto: '',
    rubro: ''
  });
  
  // Opciones disponibles para filtros
  const [opcionesFiltros, setOpcionesFiltros] = useState({
    filas: [],
    cuadras: [],
    total: 0,
    rango_numeros: { min: 1, max: 100 }
  });

  // 🔴 SOLUCIÓN: Envolver cargarPuestosDisponibles con useCallback
  const cargarPuestosDisponibles = useCallback(async () => {
    try {
      setPuestosCargando(true);
      console.log('📥 Cargando puestos disponibles...');
      
      const puestos = await afiliadosService.obtenerPuestosDisponibles();
      
      console.log('✅ Puestos recibidos del backend:', puestos?.length || 0);
      
      setPuestosDisponibles(puestos || []);
      setPuestosFiltrados(puestos || []);
      
      // Extraer opciones únicas para filtros
      const filas = [...new Set(puestos.map(p => p.fila))].sort();
      const cuadras = [...new Set(puestos.map(p => p.cuadra))].sort();
      const numeros = puestos.map(p => p.nroPuesto);
      
      setOpcionesFiltros({
        filas,
        cuadras,
        total: puestos.length,
        rango_numeros: {
          min: numeros.length > 0 ? Math.min(...numeros) : 1,
          max: numeros.length > 0 ? Math.max(...numeros) : 100
        }
      });
      
      return puestos;
    } catch (error) {
      console.error('❌ Error cargando puestos disponibles:', error);
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los puestos disponibles',
        color: 'red'
      });
      return [];
    } finally {
      setPuestosCargando(false);
    }
  }, []); // ✅ Sin dependencias, se crea una sola vez

  // Función para aplicar filtros
  const aplicarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => {
      const filtrosActualizados = { ...prev, ...nuevosFiltros };
      
      let resultados = [...puestosDisponibles];

      // Filtrar por fila
      if (filtrosActualizados.fila) {
        resultados = resultados.filter(p => p.fila === filtrosActualizados.fila);
      }

      // Filtrar por cuadra
      if (filtrosActualizados.cuadra) {
        resultados = resultados.filter(p => p.cuadra === filtrosActualizados.cuadra);
      }

      // Filtrar por número de puesto
      if (filtrosActualizados.nroPuesto) {
        const numBuscado = parseInt(filtrosActualizados.nroPuesto);
        if (!isNaN(numBuscado)) {
          resultados = resultados.filter(p => p.nroPuesto === numBuscado);
        }
      }

      // Filtrar por rubro (búsqueda parcial)
      if (filtrosActualizados.rubro) {
        const termino = filtrosActualizados.rubro.toLowerCase();
        resultados = resultados.filter(p => 
          p.rubro && p.rubro.toLowerCase().includes(termino)
        );
      }

      setPuestosFiltrados(resultados);
      
      return filtrosActualizados;
    });
  }, [puestosDisponibles]); // ✅ Dependencia correcta

  // Limpiar todos los filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      fila: '',
      cuadra: '',
      nroPuesto: '',
      rubro: ''
    });
    setPuestosFiltrados(puestosDisponibles);
  }, [puestosDisponibles]); // ✅ Dependencia correcta

  const asignarPuesto = useCallback(async (puestoData) => {
    try {
      setLoading(true);
      
      const dataToSend = {
        id_puesto: puestoData.id_puesto,
        fila: puestoData.fila,
        cuadra: puestoData.cuadra,
        nroPuesto: puestoData.nroPuesto,
        rubro: puestoData.rubro || '',
        tiene_patente: puestoData.tiene_patente || false,
        razon: 'ASIGNADO'
      };

      const resultado = await afiliadosService.asignarPuesto(idAfiliado, dataToSend);
      
      notifications.show({
        title: '✅ Éxito',
        message: `Puesto ${puestoData.nroPuesto}-${puestoData.fila}-${puestoData.cuadra} asignado`,
        color: 'green'
      });
      
      // ✅ Recargar puestos disponibles después de asignar
      await cargarPuestosDisponibles();
      
      return { exito: true, datos: resultado };
    } catch (error) {
      console.error('❌ Error asignando puesto:', error);
      
      if (error.message?.includes('ocupado') || error.message?.includes('disponible')) {
        notifications.show({
          title: '⚠️ Puesto no disponible',
          message: 'Este puesto ya está ocupado',
          color: 'yellow'
        });
      } else {
        notifications.show({
          title: '❌ Error',
          message: error.message || 'No se pudo asignar el puesto',
          color: 'red'
        });
      }
      
      return { exito: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [idAfiliado, cargarPuestosDisponibles]); // ✅ Añadir cargarPuestosDisponibles

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
    asignarPuesto
  };
};