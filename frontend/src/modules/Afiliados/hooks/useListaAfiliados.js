// frontend/src/modules/Afiliados/hooks/useListaAfiliados.js

import { useState, useEffect, useCallback } from 'react';
import { afiliadosService } from '../services/afiliadosService';

// ── Filtros iniciales — referencias estables fuera del hook ──
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

// ============================================================
// HOOK useListaAfiliados
// ============================================================
export const useListaAfiliados = ({ soloDeshabilitados = false } = {}) => {

  const [afiliados,      setAfiliados]      = useState([]);
  const [error,          setError]          = useState(null);
  const [cargando,       setCargando]       = useState(!soloDeshabilitados);
  const [filtrosActivos, setFiltrosActivos] = useState(
    soloDeshabilitados
      ? { ...FILTROS_DESHABILITADOS_INICIALES }
      : { ...FILTROS_ACTIVOS_INICIALES }
  );

  // Solo modo activos
  const [conexion,          setConexion]          = useState(null);
  const [rubrosDisponibles, setRubrosDisponibles] = useState([]);

  // Solo modo deshabilitados
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!soloDeshabilitados) {
      cargar();
      probarConexion();
      cargarRubros();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Función principal de carga ────────────────────────────
  const cargar = useCallback(async (nuevosFiltros = null) => {
    try {
      setCargando(true);
      setError(null);

      const filtrosAUsar = nuevosFiltros !== null
        ? { ...filtrosActivos, ...nuevosFiltros }
        : filtrosActivos;

      if (nuevosFiltros !== null) {
        setFiltrosActivos(filtrosAUsar);
      }

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

  // ── Filtros comunes ───────────────────────────────────────
  const buscarPorTexto = (termino) => {
    const resetEspecificos = soloDeshabilitados
      ? {}
      : { puestoCount: null, rubro: null, conPatente: null };
    return cargar({ search: termino, ...resetEspecificos });
  };

  const ordenarPor = (tipoOrden) => cargar({ orden: tipoOrden });

  const limpiarFiltros = () => {
    const filtrosLimpios = soloDeshabilitados
      ? { ...FILTROS_DESHABILITADOS_INICIALES }
      : { ...FILTROS_ACTIVOS_INICIALES };
    setFiltrosActivos(filtrosLimpios);
    return cargar(filtrosLimpios);
  };

  // ── Solo modo activos ─────────────────────────────────────
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

  const filtrarPorCantidadPuestos = (cantidad) =>
    cargar({ puestoCount: cantidad, search: '' });

  const filtrarPorPatente = (tienePatente) =>
    cargar({ conPatente: tienePatente, search: '' });

  const filtrarPorRubro = (rubro) =>
    cargar({ rubro });

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

  // ── Solo modo deshabilitados ──────────────────────────────
  // useCallback es necesario aquí porque esta función se pasa
  // como prop `onRehabilitar` a ListaCards y TablaAfiliados,
  // que están envueltos en React.memo (Tarea 8).
  // Sin useCallback, cada render del hook crea una referencia
  // nueva → memo detecta cambio de prop → re-render innecesario.
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
    // Común
    afiliados,
    cargando,
    error,
    filtrosActivos,
    cargar,
    buscarPorTexto,
    ordenarPor,
    limpiarFiltros,
    // Solo activos
    conexion,
    rubrosDisponibles,
    filtrarPorCantidadPuestos,
    filtrarPorPatente,
    filtrarPorRubro,
    crearAfiliado,
    cargarRubros,
    // Solo deshabilitados
    total,
    rehabilitarAfiliado,
    actualizarContador,
  };
};