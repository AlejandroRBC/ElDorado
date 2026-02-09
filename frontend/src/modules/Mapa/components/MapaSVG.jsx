// src/modules/Mapa/components/MapaSVG.jsx
import React, { useState, useRef, useEffect } from 'react';
import mapaImg from '../Mapa.svg';
import '../Styles/mapa.css';

const MapaSVG = () => {
  const [zoom, setZoom] = useState(1);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });
  const [zoomBase, setZoomBase] = useState(1);
  const [dimensiones, setDimensiones] = useState({ width: 0, height: 0 });
  const contenedorRef = useRef(null);
  const svgRef = useRef(null);

  // Calcular dimensiones del SVG
  useEffect(() => {
    const svg = svgRef.current;
    const contenedor = contenedorRef.current;
    
    if (!svg || !contenedor) return;

    const calcularDimensiones = () => {
      const svgDoc = svg.contentDocument;
      if (!svgDoc) return;

      const svgElement = svgDoc.querySelector('svg');
      if (!svgElement) return;

      // Obtener viewBox o dimensiones del SVG
      const viewBox = svgElement.getAttribute('viewBox');
      let svgWidth, svgHeight;

      if (viewBox) {
        const [, , width, height] = viewBox.split(' ').map(Number);
        svgWidth = width;
        svgHeight = height;
      } else {
        svgWidth = parseFloat(svgElement.getAttribute('width')) || 800;
        svgHeight = parseFloat(svgElement.getAttribute('height')) || 600;
      }

      setDimensiones({ width: svgWidth, height: svgHeight });

      // Calcular zoom base
      const containerWidth = contenedor.clientWidth;
      const containerHeight = contenedor.clientHeight;
      
      const zoomWidth = containerWidth / svgWidth;
      const zoomHeight = containerHeight / svgHeight;
      
      const nuevoZoomBase = Math.min(zoomWidth, zoomHeight);
      setZoomBase(nuevoZoomBase);
      setZoom(nuevoZoomBase);

      // Centrar
      const imgWidth = svgWidth * nuevoZoomBase;
      const imgHeight = svgHeight * nuevoZoomBase;
      const centroX = (containerWidth - imgWidth) / 2;
      const centroY = (containerHeight - imgHeight) / 2;
      setPosicion({ x: centroX, y: centroY });
    };

    // Esperar a que el SVG cargue
    const handleLoad = () => {
      setTimeout(calcularDimensiones, 100);
    };

    svg.addEventListener('load', handleLoad);
    
    // Intentar calcular inmediatamente por si ya está cargado
    if (svg.contentDocument) {
      setTimeout(calcularDimensiones, 100);
    }

    return () => svg.removeEventListener('load', handleLoad);
  }, []);

  // Prevenir zoom del navegador
  useEffect(() => {
    const prevenirZoomNavegador = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const contenedor = contenedorRef.current;
    if (contenedor) {
      contenedor.addEventListener('wheel', prevenirZoomNavegador, { passive: false });
      return () => contenedor.removeEventListener('wheel', prevenirZoomNavegador);
    }
  }, []);

  // Zoom con scroll del mouse
  const manejarScroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = contenedorRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const factorZoom = e.deltaY > 0 ? 0.9 : 1.1;
    let nuevoZoom = zoom * factorZoom;
    
    nuevoZoom = Math.max(zoomBase, Math.min(5 * zoomBase, nuevoZoom));
    
    if (nuevoZoom === zoom) return;
    
    const escalaCambio = nuevoZoom / zoom;
    const nuevaX = mouseX - (mouseX - posicion.x) * escalaCambio;
    const nuevaY = mouseY - (mouseY - posicion.y) * escalaCambio;
    
    setPosicion({
      x: nuevaX,
      y: nuevaY
    });
    
    setZoom(nuevoZoom);
  };

  // Iniciar arrastre
  const manejarMouseAbajo = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setArrastrando(true);
    setInicioArrastre({
      x: e.clientX - posicion.x,
      y: e.clientY - posicion.y
    });
  };

  // Mover mapa con límites
  const manejarMouseMovimiento = (e) => {
    if (!arrastrando) return;
    e.preventDefault();
    
    const nuevaX = e.clientX - inicioArrastre.x;
    const nuevaY = e.clientY - inicioArrastre.y;
    
    const contenedor = contenedorRef.current;
    
    if (contenedor && dimensiones.width > 0) {
      const imgWidth = dimensiones.width * zoom;
      const imgHeight = dimensiones.height * zoom;
      const containerWidth = contenedor.clientWidth;
      const containerHeight = contenedor.clientHeight;
      
      const minX = containerWidth - imgWidth;
      const maxX = 0;
      const minY = containerHeight - imgHeight;
      const maxY = 0;
      
      if (imgWidth <= containerWidth && imgHeight <= containerHeight) {
        const centroX = (containerWidth - imgWidth) / 2;
        const centroY = (containerHeight - imgHeight) / 2;
        setPosicion({ x: centroX, y: centroY });
      } else {
        setPosicion({
          x: Math.max(minX, Math.min(maxX, nuevaX)),
          y: Math.max(minY, Math.min(maxY, nuevaY))
        });
      }
    } else {
      setPosicion({
        x: nuevaX,
        y: nuevaY
      });
    }
  };

  // Terminar arrastre
  const manejarMouseArriba = () => {
    setArrastrando(false);
  };

  // Doble clic para resetear
  const manejarDobleClic = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const contenedor = contenedorRef.current;
    
    if (contenedor && dimensiones.width > 0) {
      setZoom(zoomBase);
      
      const imgWidth = dimensiones.width * zoomBase;
      const imgHeight = dimensiones.height * zoomBase;
      const containerWidth = contenedor.clientWidth;
      const containerHeight = contenedor.clientHeight;
      
      const centroX = (containerWidth - imgWidth) / 2;
      const centroY = (containerHeight - imgHeight) / 2;
      
      setPosicion({ x: centroX, y: centroY });
    }
  };

  const porcentajeZoom = Math.round((zoom / zoomBase) * 100);

  return (
    <div className="mapa-contenedor">
      <div 
        ref={contenedorRef}
        className="contenedor-zoom"
        onWheel={manejarScroll}
        onMouseDown={manejarMouseAbajo}
        onMouseMove={manejarMouseMovimiento}
        onMouseUp={manejarMouseArriba}
        onMouseLeave={manejarMouseArriba}
        onDoubleClick={manejarDobleClic}
        style={{ 
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        <object 
          ref={svgRef}
          data={mapaImg} 
          type="image/svg+xml"
          className="imagen-mapa"
          style={{
            transform: `translate(${posicion.x}px, ${posicion.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            pointerEvents: 'none',
            width: dimensiones.width || '100%',
            height: dimensiones.height || '100%'
          }}
        >
          Tu navegador no soporta SVG
        </object>
      </div>

      <div className="indicador-zoom">
        Zoom: {porcentajeZoom}% 
        {zoom === zoomBase && <span className="zoom-minimo"> (Base)</span>}
      </div>
    </div>
  );
};

export default MapaSVG;