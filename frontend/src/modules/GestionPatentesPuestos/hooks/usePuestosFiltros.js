// ============================================
// HOOK USE PUESTOS FILTROS
// ============================================

import { useMemo, useState, useEffect } from 'react';

const ITEMS_POR_PAGINA = 50;

/**
 * Hook que maneja los filtros y la paginación del módulo de puestos.
 * Filtra por búsqueda de texto, estado de patente, fila y cuadra.
 * Usa useMemo para evitar recálculos innecesarios.
 *
 * puestos - Lista completa de puestos sin filtrar
 */
export function usePuestosFiltros(puestos) {
  const [search,        setSearch]        = useState('');
  const [filtroPatente, setFiltroPatente] = useState(null);
  const [filtroFila,    setFiltroFila]    = useState(null);
  const [filtroCuadra,  setFiltroCuadra]  = useState(null);

  // ── Paginación ──────────────────────────────────────────────────
  const [paginaActual, setPaginaActual] = useState(1);

  /**
   * Lista de puestos filtrada según todos los criterios activos.
   * El export SIEMPRE debe usar este array, no el paginado.
   */
  const puestosFiltrados = useMemo(() => {
    return puestos.filter((puesto) => {
      const coincideBusqueda =
        search.trim() === '' ||
        String(puesto.nroPuesto).includes(search) ||
        (puesto.apoderado || '').toLowerCase().includes(search.toLowerCase()) ||
        (puesto.ci || '').includes(search);

      const coincidePatente =
        !filtroPatente || filtroPatente === 'Todo'
          ? true
          : filtroPatente === 'si'
            ? Boolean(puesto.tiene_patente)
            : !Boolean(puesto.tiene_patente);

      const coincideFila =
        !filtroFila || filtroFila === 'Todo'
          ? true
          : puesto.fila === filtroFila;

      const coincideCuadra =
        !filtroCuadra || filtroCuadra === 'Todo'
          ? true
          : puesto.cuadra === filtroCuadra;

      return coincideBusqueda && coincidePatente && coincideFila && coincideCuadra;
    });
  }, [puestos, search, filtroPatente, filtroFila, filtroCuadra]);

  /**
   * Vuelve a la página 1 cada vez que cambia el resultado del filtrado.
   * Evita quedar en una página vacía al aplicar un filtro restrictivo.
   */
  useEffect(() => {
    setPaginaActual(1);
  }, [puestosFiltrados.length]);

  /**
   * Slice de puestosFiltrados para la página actual.
   * Usar en la tabla. Para exportar usar puestosFiltrados.
   */
  const puestosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return puestosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [puestosFiltrados, paginaActual]);

  const totalPaginas = useMemo(
    () => Math.ceil(puestosFiltrados.length / ITEMS_POR_PAGINA),
    [puestosFiltrados]
  );

  /**
   * Resetea todos los filtros a su estado inicial.
   */
  const limpiarFiltros = () => {
    setSearch('');
    setFiltroPatente(null);
    setFiltroFila(null);
    setFiltroCuadra(null);
  };

  return {
    search,        setSearch,
    filtroPatente, setFiltroPatente,
    filtroFila,    setFiltroFila,
    filtroCuadra,  setFiltroCuadra,
    // Lista completa filtrada → para exportar
    puestosFiltrados,
    // Lista paginada → para la tabla en pantalla
    puestosPaginados,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    itemsPorPagina: ITEMS_POR_PAGINA,
    limpiarFiltros,
  };
}