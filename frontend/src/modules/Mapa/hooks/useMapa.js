// src/modules/Mapa/hooks/useMapa.js
import { useState, useCallback, useMemo } from 'react';
import { TODOS_LOS_PUESTOS } from '../data/puestos';

// ============================================
// HOOK USE MAPA
// ============================================

/** Nivel de zoom al navegar a un puesto específico */
const ZOOM_AL_PUESTO = 6;

/**
 * Hook principal del mapa interactivo.
 * Gestiona la selección de puestos, popup, búsqueda y filtros por fila.
 *
 * @param {Object}        params
 * @param {number}        params.zoom          - Zoom actual del mapa
 * @param {number}        params.zoomBase      - Zoom base calculado al inicio
 * @param {Object}        params.posicion      - Posición actual {x, y}
 * @param {Function}      params.setZoom       - Setter del zoom en MapaSVG
 * @param {Function}      params.setPosicion   - Setter de posición en MapaSVG
 * @param {Object}        params.dimensiones   - Dimensiones del SVG {width, height}
 * @param {Object}        params.contenedorRef - Ref del contenedor del mapa
 * @param {Array}         params.puestosData   - Puestos enriquecidos desde useMapaData
 *
 * @returns {Object} Estado y handlers del mapa
 */
export const useMapa = ({
  zoom, zoomBase, posicion, setZoom, setPosicion,
  dimensiones, contenedorRef,
  puestosData,
}) => {
  const [puestoSeleccionado,  setPuestoSeleccionado]  = useState(null);
  const [popupAbierto,        setPopupAbierto]        = useState(false);
  const [filtroFila,          setFiltroFila]          = useState('todos');
  const [busqueda,            setBusqueda]            = useState('');
  const [resultadosBusqueda,  setResultadosBusqueda]  = useState([]);
  const [mostrarResultados,   setMostrarResultados]   = useState(false);

  // ── Usar puestos enriquecidos si están disponibles ──
  const puestosBase = puestosData || TODOS_LOS_PUESTOS;

  /**
   * Hace zoom y centra el mapa en un puesto específico.
   *
   * @param {Object}  puesto    - Puesto destino con coordenadas x, y, width, height
   * @param {boolean} hacerZoom - Si debe aplicar zoom al navegar
   */
  const irAPuesto = useCallback((puesto, hacerZoom = true) => {
    if (!contenedorRef?.current || !dimensiones.width) return;

    const contenedor      = contenedorRef.current;
    const containerWidth  = contenedor.clientWidth;
    const containerHeight = contenedor.clientHeight;

    if (hacerZoom) {
      const targetZoom  = ZOOM_AL_PUESTO * zoomBase;
      const clampedZoom = Math.min(10 * zoomBase, targetZoom);

      const puestoCentroX = puesto.x + puesto.width / 2;
      const puestoCentroY = puesto.y + puesto.height / 2;

      const nuevaX = containerWidth  / 2 - puestoCentroX * clampedZoom;
      const nuevaY = containerHeight / 2 - puestoCentroY * clampedZoom;

      const imgWidth  = dimensiones.width  * clampedZoom;
      const imgHeight = dimensiones.height * clampedZoom;
      const minX      = containerWidth  - imgWidth;
      const minY      = containerHeight - imgHeight;

      setZoom(clampedZoom);
      setPosicion({
        x: Math.max(minX, Math.min(0, nuevaX)),
        y: Math.max(minY, Math.min(0, nuevaY)),
      });
    }

    setPuestoSeleccionado(puesto);
    setPopupAbierto(true);
  }, [contenedorRef, dimensiones, zoomBase, setZoom, setPosicion]);

  /**
   * Cierra el popup y deselecciona el puesto.
   */
  const cerrarPopup = useCallback(() => {
    setPopupAbierto(false);
    setPuestoSeleccionado(null);
  }, []);

  /**
   * Busca puestos por nombre, CI o número de puesto.
   * Respeta el filtro de fila activo.
   *
   * @param {string} termino - Texto a buscar
   */
  const buscar = useCallback((termino) => {
    setBusqueda(termino);
    if (!termino.trim()) {
      setResultadosBusqueda([]);
      setMostrarResultados(false);
      return;
    }

    const t = termino.toLowerCase().trim();

    // ── Filtrar por fila activa ──
    const base = filtroFila === 'todos'
      ? puestosBase
      : filtroFila === 'Callejon'
        ? puestosBase.filter(p => p.cuadra === 'Callejón')
        : puestosBase.filter(p => p.fila === filtroFila);

    const resultados = base.filter(p => {
      if (String(p.nroPuesto).includes(t))                          return true;
      if (p.afiliadoInfo?.nombre?.toLowerCase().includes(t))        return true;
      if (String(p.afiliadoInfo?.ci || '').toLowerCase().includes(t)) return true;
      return false;
    }).sort((a, b) => {
      if (a.nroPuesto !== b.nroPuesto) return a.nroPuesto - b.nroPuesto;
      return a.fila.localeCompare(b.fila);
    });

    setResultadosBusqueda(resultados.slice(0, 10));
    setMostrarResultados(true);
  }, [filtroFila, puestosBase]);

  /**
   * Selecciona un resultado del dropdown y navega al puesto.
   *
   * @param {Object} puesto - Puesto seleccionado del dropdown
   */
  const seleccionarResultado = useCallback((puesto) => {
    setMostrarResultados(false);
    const label = puesto.cuadra === 'Callejón'
      ? `Puesto ${puesto.nroPuesto} — Fila A - Callejón`
      : `Puesto ${puesto.nroPuesto} — Fila ${puesto.fila} (${puesto.cuadra})`;
    setBusqueda(label);
    irAPuesto(puesto, true);
  }, [irAPuesto]);

  /**
   * Handler al hacer click directo sobre un puesto en el overlay SVG.
   *
   * @param {Object} puesto - Puesto clickeado
   */
  const handleClickPuesto = useCallback((puesto) => {
    setPuestoSeleccionado(puesto);
    setPopupAbierto(true);
  }, []);

  // ── Puestos filtrados por fila para el overlay ──
  const puestosFiltrados = useMemo(() => {
    if (filtroFila === 'todos')    return puestosBase;
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