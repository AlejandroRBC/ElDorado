// src/modules/Mapa/hooks/useMapa.js
import { useState, useCallback } from 'react';
import { TODOS_LOS_PUESTOS, SVG_WIDTH, SVG_HEIGHT } from '../data/puestos';

const ZOOM_AL_PUESTO = 6; // nivel de zoom cuando se navega a un puesto

export const useMapa = ({ zoom, zoomBase, posicion, setZoom, setPosicion, dimensiones, contenedorRef }) => {
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [popupAbierto, setPopupAbierto] = useState(false);
  const [filtroFila, setFiltroFila] = useState('todos'); // 'todos' | 'A' | 'B'
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Navegar y hacer zoom a un puesto específico
  const irAPuesto = useCallback((puesto, hacerZoom = true) => {
    if (!contenedorRef?.current || !dimensiones.width) return;

    const contenedor = contenedorRef.current;
    const containerWidth = contenedor.clientWidth;
    const containerHeight = contenedor.clientHeight;

    if (hacerZoom) {
      const targetZoom = ZOOM_AL_PUESTO * zoomBase;
      const clampedZoom = Math.min(10 * zoomBase, targetZoom);

      // Centro del puesto en coordenadas SVG
      const puestoCentroX = puesto.x + puesto.width / 2;
      const puestoCentroY = puesto.y + puesto.height / 2;

      // Calcular posición para centrar el puesto en pantalla
      const nuevaX = containerWidth / 2 - puestoCentroX * clampedZoom;
      const nuevaY = containerHeight / 2 - puestoCentroY * clampedZoom;

      // Aplicar límites
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

  // Abrir popup sin zoom (para múltiples puestos)
  const abrirPopupSinZoom = useCallback((puesto) => {
    setPuestoSeleccionado(puesto);
    setPopupAbierto(true);
  }, []);

  const cerrarPopup = useCallback(() => {
    setPopupAbierto(false);
    setPuestoSeleccionado(null);
  }, []);

  // Búsqueda por nombre, CI o nroPuesto
  const buscar = useCallback((termino) => {
    setBusqueda(termino);
    if (!termino.trim()) {
      setResultadosBusqueda([]);
      setMostrarResultados(false);
      return;
    }

    const terminoLower = termino.toLowerCase().trim();
    const resultados = TODOS_LOS_PUESTOS.filter(p => {
      // Buscar por nroPuesto
      if (String(p.nroPuesto).includes(terminoLower)) return true;
      // Buscar por nombre del afiliado (cuando tengamos datos reales)
      if (p.afiliado?.nombre?.toLowerCase().includes(terminoLower)) return true;
      // Buscar por CI
      if (String(p.afiliado?.ci || '').includes(terminoLower)) return true;
      return false;
    });

    // Filtrar por fila si hay filtro activo
    const resultadosFiltrados = filtroFila === 'todos'
      ? resultados
      : resultados.filter(p => p.fila === filtroFila);

    setResultadosBusqueda(resultadosFiltrados.slice(0, 10));
    setMostrarResultados(true);
  }, [filtroFila]);

  // Seleccionar resultado de búsqueda
  const seleccionarResultado = useCallback((puesto) => {
    setMostrarResultados(false);
    setBusqueda(`Puesto ${puesto.nroPuesto} - Fila ${puesto.fila}`);
    irAPuesto(puesto, true);
  }, [irAPuesto]);

  // Click en puesto del mapa
  const handleClickPuesto = useCallback((puesto) => {
    setPuestoSeleccionado(puesto);
    setPopupAbierto(true);
  }, []);

  // Puestos filtrados para el overlay
  const puestosFiltrados = filtroFila === 'todos'
    ? TODOS_LOS_PUESTOS
    : TODOS_LOS_PUESTOS.filter(p => p.fila === filtroFila);

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
    irAPuesto,
    abrirPopupSinZoom,
    cerrarPopup,
    handleClickPuesto,
    puestosFiltrados,
  };
};
