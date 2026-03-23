import { useState, useCallback, useMemo } from 'react';
import { useDebouncedValue }              from '@mantine/hooks';

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

export const FILTROS_INICIALES = {
  search:      '',
  orden:       'alfabetico',
  conPatente:  null,
  puestoCount: null,
  rubro:       null,
};

export const FILTROS_DESHABILITADOS_INICIALES = {
  search: '',
  orden:  'alfabetico',
};

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

/**
 * Gestiona el estado de todos los filtros del listado de afiliados.
 * Expone valores locales para los controles UI y filtros reales
 * que se envían al backend.
 *
 * @param {boolean} soloDeshabilitados - Cambia el conjunto de filtros disponibles
 */
export const useFiltrosAfiliados = ({ soloDeshabilitados = false } = {}) => {

  // ── Valores locales de los controles (lo que ve el usuario) ──
  const [searchValue,       setSearchValue]       = useState('');
  const [selectOrden,       setSelectOrden]       = useState('alfabetico');
  const [selectPatente,     setSelectPatente]     = useState(null);
  const [selectPuestoCount, setSelectPuestoCount] = useState(null);
  const [selectRubro,       setSelectRubro]       = useState(null);

  // Debounce para búsqueda por texto (evita un fetch por cada tecla)
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  // ── Filtros normalizados listos para enviar al backend ───────
  const filtrosActivos = useMemo(() => {
    if (soloDeshabilitados) {
      return {
        search: debouncedSearch,
        orden:  selectOrden,
      };
    }
    return {
      search:      debouncedSearch,
      orden:       selectOrden,
      conPatente:  selectPatente,
      puestoCount: selectPuestoCount !== null ? parseInt(selectPuestoCount) : null,
      rubro:       selectRubro,
    };
  }, [debouncedSearch, selectOrden, selectPatente, selectPuestoCount, selectRubro, soloDeshabilitados]);

  // ── ¿Hay algún filtro no-predeterminado activo? ───────────────
  const hayFiltrosActivos = useMemo(() =>
    debouncedSearch !== '' ||
    selectPatente   !== null ||
    selectPuestoCount !== null ||
    selectRubro     !== null ||
    selectOrden     !== 'alfabetico'
  , [debouncedSearch, selectPatente, selectPuestoCount, selectRubro, selectOrden]);

  // ── Setters individuales ──────────────────────────────────────

  const setCambiarBusqueda    = useCallback((v) => setSearchValue(v),          []);
  const setLimpiarBusqueda    = useCallback(()  => setSearchValue(''),         []);
  const setCambiarOrden       = useCallback((v) => setSelectOrden(v || 'alfabetico'), []);
  const setCambiarPatente     = useCallback((v) => setSelectPatente(v),        []);
  const setCambiarPuestoCount = useCallback((v) => setSelectPuestoCount(v),    []);
  const setCambiarRubro       = useCallback((v) => setSelectRubro(v),          []);

  /** Limpia un filtro individual por tipo. */
  const limpiarFiltroIndividual = useCallback((tipo) => {
    switch (tipo) {
      case 'search':      setSearchValue('');                  break;
      case 'conPatente':  setSelectPatente(null);              break;
      case 'puestoCount': setSelectPuestoCount(null);          break;
      case 'rubro':       setSelectRubro(null);                break;
      case 'orden':       setSelectOrden('alfabetico');        break;
      default: break;
    }
  }, []);

  /** Reinicia todos los filtros a sus valores predeterminados. */
  const limpiarTodosFiltros = useCallback(() => {
    setSearchValue('');
    setSelectOrden('alfabetico');
    setSelectPatente(null);
    setSelectPuestoCount(null);
    setSelectRubro(null);
  }, []);

  // ── Sincronizar desde filtrosActivos externos (si el backend
  //    vuelve con un estado canónico diferente al local)
  const sincronizarDesde = useCallback((filtros) => {
    setSelectOrden(filtros.orden ?? 'alfabetico');
    setSelectPatente(filtros.conPatente ?? null);
    setSelectPuestoCount(
      filtros.puestoCount != null ? String(filtros.puestoCount) : null
    );
    setSelectRubro(filtros.rubro ?? null);
    setSearchValue(filtros.search ?? '');
  }, []);

  return {
    // Valores de los controles UI
    searchValue,
    selectOrden,
    selectPatente,
    selectPuestoCount,
    selectRubro,
    debouncedSearch,

    // Objeto listo para el backend
    filtrosActivos,
    hayFiltrosActivos,

    // Setters
    setCambiarBusqueda,
    setLimpiarBusqueda,
    setCambiarOrden,
    setCambiarPatente,
    setCambiarPuestoCount,
    setCambiarRubro,
    limpiarFiltroIndividual,
    limpiarTodosFiltros,
    sincronizarDesde,
  };
};