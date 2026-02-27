// src/modules/Mapa/hooks/useMapa.js
import { useState, useCallback, useMemo } from 'react';
import { TODOS_LOS_PUESTOS } from '../data/puestos';

const ZOOM_AL_PUESTO = 6;

export const useMapa = ({
  zoom, zoomBase, posicion, setZoom, setPosicion,
  dimensiones, contenedorRef,
  puestosData, // puestos enriquecidos desde useMapaData (opcional)
}) => {
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [popupAbierto, setPopupAbierto] = useState(false);
  const [filtroFila, setFiltroFila] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Usar puestos enriquecidos si están disponibles, si no los base
  const puestosBase = puestosData || TODOS_LOS_PUESTOS;

  // Zoom a un puesto específico
  const irAPuesto = useCallback((puesto, hacerZoom = true) => {
    if (!contenedorRef?.current || !dimensiones.width) return;

    const contenedor = contenedorRef.current;
    const containerWidth = contenedor.clientWidth;
    const containerHeight = contenedor.clientHeight;

    if (hacerZoom) {
      const targetZoom = ZOOM_AL_PUESTO * zoomBase;
      const clampedZoom = Math.min(10 * zoomBase, targetZoom);

      const puestoCentroX = puesto.x + puesto.width / 2;
      const puestoCentroY = puesto.y + puesto.height / 2;

      const nuevaX = containerWidth / 2 - puestoCentroX * clampedZoom;
      const nuevaY = containerHeight / 2 - puestoCentroY * clampedZoom;

      const imgWidth = dimensiones.width * clampedZoom;
      const imgHeight = dimensiones.height * clampedZoom;
      const minX = containerWidth - imgWidth;
      const minY = containerHeight - imgHeight;

      setZoom(clampedZoom);
      setPosicion({
        x: Math.max(minX, Math.min(0, nuevaX)),
        y: Math.max(minY, Math.min(0, nuevaY)),
      });
    }

    setPuestoSeleccionado(puesto);
    setPopupAbierto(true);
  }, [contenedorRef, dimensiones, zoomBase, setZoom, setPosicion]);

  const cerrarPopup = useCallback(() => {
    setPopupAbierto(false);
    setPuestoSeleccionado(null);
  }, []);

  // Búsqueda por nombre, CI, nroPuesto o id
  const buscar = useCallback((termino) => {
    setBusqueda(termino);
    if (!termino.trim()) {
      setResultadosBusqueda([]);
      setMostrarResultados(false);
      return;
    }

    const t = termino.toLowerCase().trim();

    const base = filtroFila === 'todos'
      ? puestosBase
      : filtroFila === 'Callejon'
        ? puestosBase.filter(p => p.cuadra === 'Callejón')
        : puestosBase.filter(p => p.fila === filtroFila);

    const resultados = base.filter(p => {
      if (String(p.nroPuesto).includes(t)) return true;
      if (p.afiliado?.nombre?.toLowerCase().includes(t)) return true;
      if (p.afiliado?.paterno?.toLowerCase().includes(t)) return true;
      if (p.afiliado?.materno?.toLowerCase().includes(t)) return true;
      if (String(p.afiliado?.ci || '').toLowerCase().includes(t)) return true;
      return false;
    }).sort((a, b) => {
      if (a.nroPuesto !== b.nroPuesto) return a.nroPuesto - b.nroPuesto;
      return a.fila.localeCompare(b.fila);
    });

    setResultadosBusqueda(resultados.slice(0, 10));
    setMostrarResultados(true);
  }, [filtroFila, puestosBase]);

  const seleccionarResultado = useCallback((puesto) => {
    setMostrarResultados(false);
    const label = puesto.cuadra === 'Callejón'
      ? `Puesto ${puesto.nroPuesto} — Fila A - Callejón`
      : `Puesto ${puesto.nroPuesto} — Fila ${puesto.fila} (${puesto.cuadra})`;
    setBusqueda(label);
    irAPuesto(puesto, true);
  }, [irAPuesto]);

  const handleClickPuesto = useCallback((puesto) => {
    setPuestoSeleccionado(puesto);
    setPopupAbierto(true);
  }, []);

  // Puestos filtrados para el overlay
  const puestosFiltrados = useMemo(() => {
    if (filtroFila === 'todos') return puestosBase;
    if (filtroFila === 'Callejon') return puestosBase.filter(p => p.cuadra === 'Callejón');
    return puestosBase.filter(p => p.fila === filtroFila);
  }, [filtroFila, puestosBase]);

  return {
    puestoSeleccionado,
    popupAbierto,
    filtroFila,
    setFiltroFila,
    busqueda,
    buscar,
    resultadosBusqueda,
    mostrarResultados,
    setMostrarResultados,
    seleccionarResultado,
    cerrarPopup,
    handleClickPuesto,
    puestosFiltrados,
  };
};
