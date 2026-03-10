import { useState, useEffect, useCallback } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export const useAfiliados = () => {
  const [afiliados, setAfiliados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [conexion, setConexion] = useState(null);
  
  // Estados para filtros activos
  const [filtrosActivos, setFiltrosActivos] = useState({
    search: '',
    orden: 'alfabetico',
    conPatente: null,
    puestoCount: null,
    rubro: null
  });
  
  // Estado para rubros disponibles
  const [rubrosDisponibles, setRubrosDisponibles] = useState([]);
  
  // Estado para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total_afiliados: 0,
    puestos_con_patente: 0,
    puestos_sin_patente: 0,
    puestos_ocupados: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarAfiliados();
    probarConexion();
    cargarRubros();
    cargarEstadisticas();
  }, []);

  const probarConexion = async () => {
    try {
      const resultado = await afiliadosService.probarConexion();
      setConexion(resultado);
    } catch (err) {
      setConexion({ error: err.message });
    }
  };

  const cargarRubros = async () => {
    try {
      const rubros = await afiliadosService.obtenerRubros();
      setRubrosDisponibles(rubros);
    } catch (err) {
      console.error('Error cargando rubros:', err);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const stats = await afiliadosService.obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  // Función principal para cargar afiliados con filtros
  const cargarAfiliados = useCallback(async (nuevosFiltros = null) => {
    try {
      setCargando(true);
      setError(null);
      
      // Actualizar filtros si se proporcionan nuevos
      const filtrosAUsar = nuevosFiltros !== null 
        ? { ...filtrosActivos, ...nuevosFiltros }
        : filtrosActivos;
      
      if (nuevosFiltros) {
        setFiltrosActivos(filtrosAUsar);
      }
      
      const datos = await afiliadosService.obtenerTodos(filtrosAUsar);
      setAfiliados(datos);
      
      return datos;
    } catch (err) {
      setError(err.message || 'Error al cargar afiliados');
      // Usar datos mock si hay error
      if (afiliados.length === 0) {
        setAfiliados(getMockAfiliados());
      }
      return [];
    } finally {
      setCargando(false);
    }
  }, [filtrosActivos]);

  // Filtros específicos
  const buscarPorTexto = async (termino) => {
    return cargarAfiliados({ search: termino, puestoCount: null, rubro: null, conPatente: null });
  };

  const ordenarPor = async (tipoOrden) => {
    return cargarAfiliados({ orden: tipoOrden });
  };

  const filtrarPorCantidadPuestos = async (cantidad) => {
    return cargarAfiliados({ puestoCount: cantidad, search: '' });
  };

  const filtrarPorPatente = async (tienePatente) => {
    return cargarAfiliados({ conPatente: tienePatente, search: '' });
  };

  const filtrarPorRubro = async (rubro) => {
    return cargarAfiliados({ rubro });
  };

  const limpiarFiltros = async () => {
    const filtrosLimpios = {
      search: '',
      orden: 'alfabetico',
      conPatente: null,
      puestoCount: null,
      rubro: null
    };
    setFiltrosActivos(filtrosLimpios);
    return cargarAfiliados(filtrosLimpios);
  };

  const crearAfiliado = async (afiliadoData) => {
    try {
      const resultado = await afiliadosService.crear(afiliadoData);
      
      // Recargar lista después de crear
      await cargarAfiliados();
      await cargarEstadisticas();
      
      return { exito: true, datos: resultado };
    } catch (err) {
      console.error('Error al crear afiliado:', err);
      return { exito: false, error: err.message };
    }
  };

  return {
    // Datos
    afiliados,
    cargando,
    error,
    conexion,
    filtrosActivos,
    rubrosDisponibles,
    estadisticas,
    
    // Acciones principales
    cargarAfiliados,
    buscarPorTexto,
    ordenarPor,
    filtrarPorCantidadPuestos,
    filtrarPorPatente,
    filtrarPorRubro,
    limpiarFiltros,
    crearAfiliado,
    
    // Acciones adicionales
    probarConexion,
    cargarRubros,
    cargarEstadisticas
  };
};