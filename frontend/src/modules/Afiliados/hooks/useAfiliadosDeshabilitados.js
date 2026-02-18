import { useState, useCallback } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export const useAfiliadosDeshabilitados = () => {
  const [afiliados, setAfiliados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  
  // Estados para filtros
  const [filtrosActivos, setFiltrosActivos] = useState({
    search: '',
    orden: 'alfabetico'
  });

  // Cargar afiliados deshabilitados
  const cargarDeshabilitados = useCallback(async (nuevosFiltros = null) => {
    try {
      setCargando(true);
      setError(null);
      
      const filtrosAUsar = nuevosFiltros !== null 
        ? { ...filtrosActivos, ...nuevosFiltros }
        : filtrosActivos;
      
      if (nuevosFiltros) {
        setFiltrosActivos(filtrosAUsar);
      }
      
      const datos = await afiliadosService.obtenerDeshabilitados(filtrosAUsar);
      setAfiliados(datos);
      
      // Actualizar contador
      const count = await afiliadosService.contarDeshabilitados();
      setTotal(count);
      
      return datos;
    } catch (err) {
      setError(err.message || 'Error al cargar afiliados deshabilitados');
      return [];
    } finally {
      setCargando(false);
    }
  }, [filtrosActivos]);

  // Buscar por texto
  const buscarPorTexto = async (termino) => {
    return cargarDeshabilitados({ search: termino });
  };

  // Ordenar
  const ordenarPor = async (tipoOrden) => {
    return cargarDeshabilitados({ orden: tipoOrden });
  };

  // Limpiar filtros
  const limpiarFiltros = async () => {
    const filtrosLimpios = {
      search: '',
      orden: 'alfabetico'
    };
    setFiltrosActivos(filtrosLimpios);
    return cargarDeshabilitados(filtrosLimpios);
  };

  // Rehabilitar afiliado
  const rehabilitarAfiliado = async (id) => {
    try {
      setCargando(true);
      const resultado = await afiliadosService.rehabilitarAfiliado(id);
      
      // Recargar lista después de rehabilitar
      await cargarDeshabilitados();
      
      return { exito: true, datos: resultado };
    } catch (err) {
      setError(err.message || 'Error al rehabilitar afiliado');
      return { exito: false, error: err.message };
    } finally {
      setCargando(false);
    }
  };

  // Actualizar contador
  const actualizarContador = async () => {
    try {
      const count = await afiliadosService.contarDeshabilitados();
      setTotal(count);
      return count;
    } catch (err) {
      console.error('Error actualizando contador:', err);
      return 0;
    }
  };

  return {
    afiliados,
    cargando,
    error,
    filtrosActivos,
    total,
    cargarDeshabilitados,
    buscarPorTexto,
    ordenarPor,
    limpiarFiltros,
    rehabilitarAfiliado,
    actualizarContador
  };
};