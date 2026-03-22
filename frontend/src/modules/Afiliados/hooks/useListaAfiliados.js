// ============================================
// HOOK USE LISTA AFILIADOS
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { afiliadosService }                          from '../services/afiliadosService';

// ── Referencias estables fuera del hook para evitar re-renders ──
const FILTROS_ACTIVOS_INICIALES = {
  search:      '',
  orden:       'alfabetico',
  conPatente:  null,
  puestoCount: null,
  rubro:       null,
};

const FILTROS_DESHABILITADOS_INICIALES = {
  search: '',
  orden:  'alfabetico',
};

const ITEMS_POR_PAGINA = 50;

/**
 * Hook principal de listado de afiliados.
 * Soporta dos modos: activos (default) y solo deshabilitados.
 * En modo activos carga rubros, estadísticas y filtros avanzados.
 * En modo deshabilitados expone rehabilitar y contador.
 *
 * soloDeshabilitados - Si es true, opera en modo deshabilitados
 */
export const useListaAfiliados = ({ soloDeshabilitados = false } = {}) => {
  const [afiliados,      setAfiliados]      = useState([]);
  const [error,          setError]          = useState(null);
  const [cargando,       setCargando]       = useState(!soloDeshabilitados);
  const [filtrosActivos, setFiltrosActivos] = useState(
    soloDeshabilitados
      ? { ...FILTROS_DESHABILITADOS_INICIALES }
      : { ...FILTROS_ACTIVOS_INICIALES }
  );

  const [conexion,           setConexion]           = useState(null);
  const [rubrosDisponibles,  setRubrosDisponibles]  = useState([]);
  const [total,              setTotal]              = useState(0);

  // ── Paginación ──────────────────────────────────────────────────
  const [paginaActual, setPaginaActual] = useState(1);

  /**
   * Cuando la lista de afiliados cambia (por un nuevo fetch con filtros),
   * volvemos automáticamente a la página 1.
   */
  useEffect(() => {
    setPaginaActual(1);
  }, [afiliados]);

  /**
   * Slice de afiliados para la página actual.
   * El export SIEMPRE debe usar `afiliados` (lista completa filtrada),
   * no este array paginado.
   */
  const afiliadosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return afiliados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [afiliados, paginaActual]);

  const totalPaginas = useMemo(
    () => Math.ceil(afiliados.length / ITEMS_POR_PAGINA),
    [afiliados]
  );

  useEffect(() => {
    if (!soloDeshabilitados) {
      cargar();
      probarConexion();
      cargarRubros();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Carga la lista de afiliados aplicando los filtros actuales o nuevos.
   * Si se pasan nuevosFiltros, los fusiona con los actuales antes de cargar.
   */
  const cargar = useCallback(async (nuevosFiltros = null) => {
    try {
      setCargando(true);
      setError(null);

      const filtrosAUsar = nuevosFiltros !== null
        ? { ...filtrosActivos, ...nuevosFiltros }
        : filtrosActivos;

      if (nuevosFiltros !== null) setFiltrosActivos(filtrosAUsar);

      let datos;
      if (soloDeshabilitados) {
        datos = await afiliadosService.obtenerDeshabilitados(filtrosAUsar);
        const count = await afiliadosService.contarDeshabilitados();
        setTotal(count);
      } else {
        datos = await afiliadosService.obtenerTodos(filtrosAUsar);
      }

      setAfiliados(datos);
      return datos;
    } catch (err) {
      setError(err.message || 'Error al cargar afiliados');
      return [];
    } finally {
      setCargando(false);
    }
  }, [filtrosActivos, soloDeshabilitados]);

  /**
   * Busca afiliados por texto reseteando los filtros específicos.
   */
  const buscarPorTexto = (termino) => {
    const resetEspecificos = soloDeshabilitados
      ? {}
      : { puestoCount: null, rubro: null, conPatente: null };
    return cargar({ search: termino, ...resetEspecificos });
  };

  /**
   * Ordena la lista por el tipo de orden dado.
   */
  const ordenarPor = (tipoOrden) => cargar({ orden: tipoOrden });

  /**
   * Limpia todos los filtros y recarga la lista.
   */
  const limpiarFiltros = () => {
    const filtrosLimpios = soloDeshabilitados
      ? { ...FILTROS_DESHABILITADOS_INICIALES }
      : { ...FILTROS_ACTIVOS_INICIALES };
    setFiltrosActivos(filtrosLimpios);
    return cargar(filtrosLimpios);
  };

  /**
   * Prueba la conexión con el servidor.
   */
  const probarConexion = async () => {
    try {
      const resultado = await afiliadosService.probarConexion();
      setConexion(resultado);
    } catch (err) {
      setConexion({ error: err.message });
    }
  };

  /**
   * Carga los rubros disponibles para el filtro.
   */
  const cargarRubros = async () => {
    try {
      const rubros = await afiliadosService.obtenerRubros();
      setRubrosDisponibles(rubros);
    } catch (err) {
      console.error('Error cargando rubros:', err);
    }
  };

  /**
   * Filtra por cantidad de puestos asignados.
   */
  const filtrarPorCantidadPuestos = (cantidad) =>
    cargar({ puestoCount: cantidad, search: '' });

  /**
   * Filtra por si el afiliado tiene o no patente.
   */
  const filtrarPorPatente = (tienePatente) =>
    cargar({ conPatente: tienePatente, search: '' });

  /**
   * Filtra por rubro.
   */
  const filtrarPorRubro = (rubro) => cargar({ rubro });

  /**
   * Crea un nuevo afiliado y recarga la lista.
   */
  const crearAfiliado = async (afiliadoData) => {
    try {
      const resultado = await afiliadosService.crear(afiliadoData);
      await cargar();
      return { exito: true, datos: resultado };
    } catch (err) {
      console.error('Error al crear afiliado:', err);
      return { exito: false, error: err.message };
    }
  };

  /**
   * Rehabilita un afiliado deshabilitado y recarga la lista.
   * Usa useCallback porque se pasa como prop a componentes memorizados.
   */
  const rehabilitarAfiliado = useCallback(async (id) => {
    try {
      setCargando(true);
      const resultado = await afiliadosService.rehabilitarAfiliado(id);
      await cargar();
      return { exito: true, datos: resultado };
    } catch (err) {
      setError(err.message || 'Error al rehabilitar afiliado');
      return { exito: false, error: err.message };
    } finally {
      setCargando(false);
    }
  }, [cargar]);

  /**
   * Actualiza el contador de afiliados deshabilitados.
   */
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
    // ── Lista completa (para export Excel, contadores) ──────────
    afiliados,
    // ── Lista paginada (para tabla/cards en pantalla) ───────────
    afiliadosPaginados,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    itemsPorPagina: ITEMS_POR_PAGINA,
    // ── Estado general ──────────────────────────────────────────
    cargando,
    error,
    filtrosActivos,
    cargar,
    buscarPorTexto,
    ordenarPor,
    limpiarFiltros,
    conexion,
    rubrosDisponibles,
    filtrarPorCantidadPuestos,
    filtrarPorPatente,
    filtrarPorRubro,
    crearAfiliado,
    cargarRubros,
    total,
    rehabilitarAfiliado,
    actualizarContador,
  };
};