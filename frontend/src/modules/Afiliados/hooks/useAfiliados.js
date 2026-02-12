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

// Datos mock de respaldo
const getMockAfiliados = () => {
  return [
    {
      id: 1,
      nombre: 'Juan Pérez García',
      ci: '1234567-LP',
      ocupacion: 'Comerciante',
      patentes: ['101-A-Cuadra 1', '102-A-Cuadra 1'],
      total_puestos: 2,
      puestos_con_patente: 1,
      estado: 'Activo',
      telefono: '76543210',
      direccion: 'Av. Principal #123',
      fechaRegistro: '2023-01-15',
      url_perfil: '/assets/perfiles/sinPerfil.png',
      fecha_afiliacion: '2023-01-15'
    },
    {
      id: 2,
      nombre: 'María García Rodríguez',
      ci: '7654321-LP',
      ocupacion: 'Servicios',
      patentes: ['201-B-Cuadra 2'],
      total_puestos: 1,
      puestos_con_patente: 0,
      estado: 'Activo',
      telefono: '71234567',
      direccion: 'Calle Secundaria #456',
      fechaRegistro: '2023-02-10',
      url_perfil: '/assets/perfiles/sinPerfil.png',
      fecha_afiliacion: '2023-02-10'
    },
    {
      id: 3,
      nombre: 'Carlos López Mendoza',
      ci: '9876543-LP',
      ocupacion: 'Comercio',
      patentes: ['301-C-Cuadra 3', '302-C-Cuadra 3', '303-C-Cuadra 3'],
      total_puestos: 3,
      puestos_con_patente: 2,
      estado: 'Activo',
      telefono: '70123456',
      direccion: 'Av. Comercial #789',
      fechaRegistro: '2023-03-05',
      url_perfil: '/assets/perfiles/sinPerfil.png',
      fecha_afiliacion: '2023-03-05'
    },
    {
      id: 4,
      nombre: 'Ana Martínez',
      ci: '4567890-LP',
      ocupacion: 'Industria',
      patentes: ['401-D-Cuadra 4', '402-D-Cuadra 4', '403-D-Cuadra 4', '404-D-Cuadra 4'],
      total_puestos: 4,
      puestos_con_patente: 3,
      estado: 'Activo',
      telefono: '79876543',
      direccion: 'Calle Industrial #321',
      fechaRegistro: '2023-04-15',
      url_perfil: '/assets/perfiles/sinPerfil.png',
      fecha_afiliacion: '2023-04-15'
    },
    {
      id: 5,
      nombre: 'Pedro Ramírez',
      ci: '1112223-LP',
      ocupacion: 'Tecnología',
      patentes: ['501-E-Cuadra 5', '502-E-Cuadra 5', '503-E-Cuadra 5', '504-E-Cuadra 5', '505-E-Cuadra 5'],
      total_puestos: 5,
      puestos_con_patente: 5,
      estado: 'Activo',
      telefono: '78901234',
      direccion: 'Av. Tecnológica #567',
      fechaRegistro: '2023-05-20',
      url_perfil: '/assets/perfiles/sinPerfil.png',
      fecha_afiliacion: '2023-05-20'
    }
  ];
};