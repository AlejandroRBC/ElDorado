import { useState, useEffect, useCallback, useMemo } from 'react';
import { afiliadosApi } from '../services/afiliados.api';

const ITEMS_POR_PAGINA = 50;

// ─────────────────────────────────────────────────────────────
// useAfiliados  — listado + paginación + rubros
// ─────────────────────────────────────────────────────────────

/**
 * Gestiona la lista de afiliados (activos o deshabilitados).
 * Recibe los filtrosActivos desde useFiltrosAfiliados y los aplica
 * cuando cambia debouncedSearch u otros valores.
 *
 * @param {{ soloDeshabilitados?: boolean }} opciones
 */
export const useAfiliados = ({ soloDeshabilitados = false } = {}) => {
  const [afiliados,         setAfiliados]         = useState([]);
  const [cargando,          setCargando]          = useState(!soloDeshabilitados);
  const [error,             setError]             = useState(null);
  const [conexion,          setConexion]          = useState(null);
  const [rubrosDisponibles, setRubrosDisponibles] = useState([]);
  const [totalDeshabilitados, setTotalDeshabilitados] = useState(0);
  const [paginaActual,      setPaginaActual]      = useState(1);

  // Restablecer página al recibir nueva lista
  useEffect(() => { setPaginaActual(1); }, [afiliados]);

  const afiliadosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return afiliados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [afiliados, paginaActual]);

  const totalPaginas = useMemo(
    () => Math.ceil(afiliados.length / ITEMS_POR_PAGINA),
    [afiliados]
  );

  // ── Carga ────────────────────────────────────────────────────

  /**
   * Carga la lista aplicando los filtros dados.
   * @param {object} filtros - desde filtrosActivos de useFiltrosAfiliados
   */
  const cargar = useCallback(async (filtros = {}) => {
    try {
      setCargando(true);
      setError(null);
      let datos;
      if (soloDeshabilitados) {
        datos = await afiliadosApi.obtenerDeshabilitados(filtros);
        const count = await afiliadosApi.contarDeshabilitados();
        setTotalDeshabilitados(count);
      } else {
        datos = await afiliadosApi.obtenerTodos(filtros);
      }
      setAfiliados(datos);
      return datos;
    } catch (err) {
      setError(err.message || 'Error al cargar afiliados');
      return [];
    } finally {
      setCargando(false);
    }
  }, [soloDeshabilitados]);

  // ── Inicialización (solo activos) ────────────────────────────
  useEffect(() => {
    if (!soloDeshabilitados) {
      cargar();
      afiliadosApi.probarConexion().then(setConexion).catch(() => {});
      afiliadosApi.obtenerRubros()
        .then(setRubrosDisponibles)
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Rehabilita un afiliado y recarga la lista. */
  const rehabilitarAfiliado = useCallback(async (id) => {
    try {
      setCargando(true);
      const resultado = await afiliadosApi.rehabilitarAfiliado(id);
      await cargar();
      return { exito: true, datos: resultado };
    } catch (err) {
      setError(err.message);
      return { exito: false, error: err.message };
    } finally {
      setCargando(false);
    }
  }, [cargar]);

  return {
    // Lista completa (para export)
    afiliados,
    // Lista paginada (para UI)
    afiliadosPaginados,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    itemsPorPagina: ITEMS_POR_PAGINA,
    // Estado
    cargando,
    error,
    conexion,
    rubrosDisponibles,
    totalDeshabilitados,
    // Acciones
    cargar,
    rehabilitarAfiliado,
  };
};

// ─────────────────────────────────────────────────────────────
// useAfiliado  — detalle de un único afiliado
// ─────────────────────────────────────────────────────────────

/**
 * Carga y expone los datos de un afiliado por ID.
 * Se recarga automáticamente si el ID cambia.
 *
 * @param {string|number} id
 */
export const useAfiliado = (id) => {
  const [afiliado, setAfiliado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  const cargarAfiliado = useCallback(async () => {
    if (!id) return;
    try {
      setCargando(true);
      setError(null);
      const datos = await afiliadosApi.obtenerPorId(id);
      setAfiliado(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar afiliado');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargarAfiliado(); }, [cargarAfiliado]);

  return { afiliado, cargando, error, cargarAfiliado };
};

// ─────────────────────────────────────────────────────────────
// useHistorialAfiliado  — carga lazy del historial
// ─────────────────────────────────────────────────────────────

/**
 * Gestiona la carga lazy del historial completo de un afiliado.
 * Se llama desde el handler al abrir el modal para evitar
 * peticiones innecesarias mientras el modal está cerrado.
 */
export const useHistorialAfiliado = () => {
  const [historial, setHistorial] = useState([]);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState(null);

  const cargarHistorial = useCallback(async (idAfiliado) => {
    if (!idAfiliado) return;
    try {
      setCargando(true);
      setError(null);
      setHistorial([]);
      const datos = await afiliadosApi.obtenerHistorialCompleto(idAfiliado);
      setHistorial(datos);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  }, []);

  const limpiarHistorial = useCallback(() => {
    setHistorial([]);
    setError(null);
  }, []);

  return { historial, cargando, error, cargarHistorial, limpiarHistorial };
};