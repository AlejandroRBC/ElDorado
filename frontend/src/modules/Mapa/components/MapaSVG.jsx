// src/modules/Mapa/components/MapaSVG.jsx
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import mapaImg from '../Mapa.svg';
import '../Styles/mapa.css';

// ============================================
// COMPONENTE MAPA SVG
// ============================================

/**
 * Componente base del mapa interactivo con soporte de zoom y arrastre.
 * Expone métodos al padre via ref para control externo del zoom/posición.
 * Renderiza el SVG del mapa y acepta children para overlays (puestos, popups).
 *
 * Controles:
 * - Scroll: zoom in/out centrado en el cursor
 * - Click + arrastre: mover el mapa
 * - Doble click: resetear zoom al estado base
 *
 * @param {Function} onEstadoChange - Callback al cambiar zoom/posición/dimensiones
 * @param {ReactNode} children      - Overlays a renderizar sobre el mapa
 * @param {Object}   ref            - Ref para exponer setZoom, setPosicion, getEstado
 */
const MapaSVG = forwardRef(({ onEstadoChange, children }, ref) => {
  const [zoom,           setZoomState]    = useState(1);
  const [posicion,       setPosicionState] = useState({ x: 0, y: 0 });
  const [arrastrando,    setArrastrando]   = useState(false);
  const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });
  const [zoomBase,       setZoomBase]      = useState(1);
  const [dimensiones,    setDimensiones]   = useState({ width: 0, height: 0 });

  const contenedorRef = useRef(null);
  const svgRef        = useRef(null);

  // ── Wrappers internos con notificación al padre ──
  const setZoom     = (nuevoZoom) => setZoomState(nuevoZoom);
  const setPosicion = (nuevaPos)  => setPosicionState(nuevaPos);

  // ── Notificar al padre cuando cambia el estado ──
  useEffect(() => {
    if (onEstadoChange) {
      onEstadoChange({ zoom, posicion, zoomBase, dimensiones, contenedorRef });
    }
  }, [zoom, posicion, zoomBase, dimensiones]);

  // ── Exponer métodos al padre via ref ──
  useImperativeHandle(ref, () => ({
    setZoom,
    setPosicion,
    getContenedorRef: () => contenedorRef,
    getEstado:        () => ({ zoom, posicion, zoomBase, dimensiones, contenedorRef }),
  }));

  /**
   * Calcula las dimensiones del SVG y centra el mapa al cargar.
   */
  useEffect(() => {
    const svg       = svgRef.current;
    const contenedor = contenedorRef.current;
    if (!svg || !contenedor) return;

    const calcularDimensiones = () => {
      const svgDoc = svg.contentDocument;
      if (!svgDoc) return;

      const svgElement = svgDoc.querySelector('svg');
      if (!svgElement) return;

      const viewBox = svgElement.getAttribute('viewBox');
      let svgWidth, svgHeight;

      if (viewBox) {
        const [, , width, height] = viewBox.split(' ').map(Number);
        svgWidth  = width;
        svgHeight = height;
      } else {
        svgWidth  = parseFloat(svgElement.getAttribute('width'))  || 800;
        svgHeight = parseFloat(svgElement.getAttribute('height')) || 600;
      }

      setDimensiones({ width: svgWidth, height: svgHeight });

      const containerWidth  = contenedor.clientWidth;
      const containerHeight = contenedor.clientHeight;
      const zoomWidth       = containerWidth  / svgWidth;
      const zoomHeight      = containerHeight / svgHeight;
      const nuevoZoomBase   = Math.min(zoomWidth, zoomHeight);

      setZoomBase(nuevoZoomBase);
      setZoom(nuevoZoomBase);

      const imgWidth  = svgWidth  * nuevoZoomBase;
      const imgHeight = svgHeight * nuevoZoomBase;
      setPosicion({
        x: (containerWidth  - imgWidth)  / 2,
        y: (containerHeight - imgHeight) / 2,
      });
    };

    const handleLoad = () => setTimeout(calcularDimensiones, 100);
    svg.addEventListener('load', handleLoad);
    if (svg.contentDocument) setTimeout(calcularDimensiones, 100);
    return () => svg.removeEventListener('load', handleLoad);
  }, []);

  // ── Registrar wheel con passive: false para poder llamar preventDefault ──
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    contenedor.addEventListener('wheel', manejarScroll, { passive: false });
    return () => contenedor.removeEventListener('wheel', manejarScroll);
  }, [zoom, posicion, zoomBase, dimensiones]);

  /**
   * Maneja el zoom con la rueda del mouse, centrado en la posición del cursor.
   * @param {WheelEvent} e
   */
  const manejarScroll = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect   = contenedorRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const factorZoom = e.deltaY > 0 ? 0.9 : 1.1;
    let nuevoZoom    = Math.max(zoomBase, Math.min(10 * zoomBase, zoom * factorZoom));

    if (nuevoZoom === zoom) return;

    const escalaCambio = nuevoZoom / zoom;
    let nuevaX = mouseX - (mouseX - posicion.x) * escalaCambio;
    let nuevaY = mouseY - (mouseY - posicion.y) * escalaCambio;

    const contenedor = contenedorRef.current;
    if (contenedor && dimensiones.width > 0) {
      const imgWidth       = dimensiones.width  * nuevoZoom;
      const imgHeight      = dimensiones.height * nuevoZoom;
      const containerWidth = contenedor.clientWidth;
      const containerHeight = contenedor.clientHeight;

      if (imgWidth <= containerWidth && imgHeight <= containerHeight) {
        nuevaX = (containerWidth  - imgWidth)  / 2;
        nuevaY = (containerHeight - imgHeight) / 2;
      } else {
        nuevaX = Math.max(containerWidth  - imgWidth,  Math.min(0, nuevaX));
        nuevaY = Math.max(containerHeight - imgHeight, Math.min(0, nuevaY));
      }
    }

    setPosicion({ x: nuevaX, y: nuevaY });
    setZoom(nuevoZoom);
  };

  /**
   * Inicia el arrastre del mapa.
   * @param {MouseEvent} e
   */
  const manejarMouseAbajo = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setArrastrando(true);
    setInicioArrastre({ x: e.clientX - posicion.x, y: e.clientY - posicion.y });
  };

  /**
   * Mueve el mapa mientras se arrastra, respetando los límites.
   * @param {MouseEvent} e
   */
  const manejarMouseMovimiento = (e) => {
    if (!arrastrando) return;
    e.preventDefault();

    const nuevaX = e.clientX - inicioArrastre.x;
    const nuevaY = e.clientY - inicioArrastre.y;

    const contenedor = contenedorRef.current;
    if (contenedor && dimensiones.width > 0) {
      const imgWidth        = dimensiones.width  * zoom;
      const imgHeight       = dimensiones.height * zoom;
      const containerWidth  = contenedor.clientWidth;
      const containerHeight = contenedor.clientHeight;

      if (imgWidth <= containerWidth && imgHeight <= containerHeight) {
        setPosicion({
          x: (containerWidth  - imgWidth)  / 2,
          y: (containerHeight - imgHeight) / 2,
        });
      } else {
        setPosicion({
          x: Math.max(containerWidth  - imgWidth,  Math.min(0, nuevaX)),
          y: Math.max(containerHeight - imgHeight, Math.min(0, nuevaY)),
        });
      }
    } else {
      setPosicion({ x: nuevaX, y: nuevaY });
    }
  };

  /** Detiene el arrastre. */
  const manejarMouseArriba = () => setArrastrando(false);

  /**
   * Resetea el zoom al estado base y centra el mapa.
   * @param {MouseEvent} e
   */
  const manejarDobleClic = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const contenedor = contenedorRef.current;
    if (contenedor && dimensiones.width > 0) {
      const imgWidth  = dimensiones.width  * zoomBase;
      const imgHeight = dimensiones.height * zoomBase;
      setZoom(zoomBase);
      setPosicion({
        x: (contenedor.clientWidth  - imgWidth)  / 2,
        y: (contenedor.clientHeight - imgHeight) / 2,
      });
    }
  };

  const porcentajeZoom = Math.round((zoom / zoomBase) * 100);

  return (
    <div className="mapa-contenedor">
      <div
        ref={contenedorRef}
        className="contenedor-zoom"
        onMouseDown={manejarMouseAbajo}
        onMouseMove={manejarMouseMovimiento}
        onMouseUp={manejarMouseArriba}
        onMouseLeave={manejarMouseArriba}
        onDoubleClick={manejarDobleClic}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {/* ── SVG base del mapa ── */}
        <object
          ref={svgRef}
          data={mapaImg}
          type="image/svg+xml"
          className="imagen-mapa"
          style={{
            transform:       `translate(${posicion.x}px, ${posicion.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            pointerEvents:   'none',
            width:           dimensiones.width  || '100%',
            height:          dimensiones.height || '100%',
          }}
        >
          Tu navegador no soporta SVG
        </object>

        {/* ── Overlay interactivo (PuestosOverlay + PopupPuesto) ── */}
        {children}
      </div>

      {/* ── Indicador de zoom ── */}
      <div className="indicador-zoom">
        Zoom: {porcentajeZoom}%
        {zoom === zoomBase && <span className="zoom-minimo"> (Base)</span>}
      </div>
    </div>
  );
});

MapaSVG.displayName = 'MapaSVG';

export default MapaSVG;