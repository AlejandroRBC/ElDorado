// frontend/src/modules/GestionPatentesPuestos/hooks/usePuestosFiltros.js

// ============================================
// HOOK USE PUESTOS FILTROS
// ============================================

import { useMemo, useState } from 'react';

/**
 * Hook que maneja los filtros del módulo de puestos.
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

  /**
   * Lista de puestos filtrada según todos los criterios activos.
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
    puestosFiltrados,
    limpiarFiltros,
  };
}