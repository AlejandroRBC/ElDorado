import { useMemo, useState } from "react";

export function usePuestosFiltros(puestos) {

  const [search, setSearch] = useState('');
  const [filtroPatente, setFiltroPatente] = useState(null);
  const [filtroFila, setFiltroFila] = useState(null);
  const [filtroCuadra, setFiltroCuadra] = useState(null);

  const puestosFiltrados = useMemo(() => {
    return puestos.filter(puesto => {

      const coincideBusqueda =
        search.trim() === '' ||
        String(puesto.id_puesto).includes(search) ||
        (puesto.apoderado || '').toLowerCase().includes(search.toLowerCase()) ||
        (puesto.ci || '').includes(search);

      const coincidePatente =
        filtroPatente === null || filtroPatente === 'Todo'
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

  const limpiarFiltros = () => {
    setSearch('');
    setFiltroPatente(null);
    setFiltroFila(null);
    setFiltroCuadra(null);
  };

  return {
    search, setSearch,
    filtroPatente, setFiltroPatente,
    filtroFila, setFiltroFila,
    filtroCuadra, setFiltroCuadra,
    puestosFiltrados,
    limpiarFiltros
  };
}
