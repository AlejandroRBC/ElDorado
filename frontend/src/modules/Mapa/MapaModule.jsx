// src/modules/Mapa/MapaModule.jsx
import React, { useState, useRef, useCallback } from 'react';
import { LoadingOverlay } from '@mantine/core';
import MapaSVG from './components/MapaSVG';
import PuestosOverlay from './components/PuestosOverlay';
import PopupPuesto from './components/PopupPuesto';
import BuscadorMapa from './components/BuscadorMapa';
import { useMapa } from './hooks/useMapa';
import { useMapaData, obtenerAfiliadoCompleto } from './hooks/useMapaData';
import { ModalMostrarHistorial } from '../GestionPatentesPuestos/components/ModalMostrarHistorial';
import Card from '../Afiliados/Components/Card';
import './Styles/mapa-zoom.css';
import './Styles/mapaInteractivo.css';

const MapaModule = () => {
  const mapaSVGRef = useRef(null);
  const puestoParaHistorialRef = useRef(null);

  const [estadoMapa, setEstadoMapa] = useState({
    zoom: 1,
    posicion: { x: 0, y: 0 },
    zoomBase: 1,
    dimensiones: { width: 0, height: 0 },
    contenedorRef: { current: null },
  });

  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [puestoHistorial, setPuestoHistorial] = useState(null);

  const [cardAbierta, setCardAbierta] = useState(false);
  const [afiliadoCard, setAfiliadoCard] = useState(null);
  const [cargandoAfiliado, setCargandoAfiliado] = useState(false);

  const { puestosEnriquecidos, loading } = useMapaData();

  const handleEstadoChange = useCallback((nuevoEstado) => {
    setEstadoMapa(nuevoEstado);
  }, []);

  const {
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
  } = useMapa({
    zoom: estadoMapa.zoom,
    zoomBase: estadoMapa.zoomBase,
    posicion: estadoMapa.posicion,
    setZoom: (z) => mapaSVGRef.current?.setZoom(z),
    setPosicion: (p) => mapaSVGRef.current?.setPosicion(p),
    dimensiones: estadoMapa.dimensiones,
    contenedorRef: estadoMapa.contenedorRef,
    puestosData: puestosEnriquecidos,
  });

  const buildPuestoHistorial = (puesto) => ({
    id_puesto: puesto.id_puesto_bd || puesto.id,
    nroPuesto: puesto.nroPuesto,
    fila: puesto.fila,
    cuadra: puesto.cuadra || '—',
  });

  // Al clickear "Afiliado" en el popup: fetchea el afiliado completo
  const handleVerAfiliado = async () => {
    if (!puestoSeleccionado) return;
    puestoParaHistorialRef.current = puestoSeleccionado;

    if (!puestoSeleccionado.id_afiliado) return; // sin afiliado asignado

    cerrarPopup();
    setCargandoAfiliado(true);

    try {
      const afiliadoCompleto = await obtenerAfiliadoCompleto(puestoSeleccionado.id_afiliado);
      setAfiliadoCard(afiliadoCompleto);
      setCardAbierta(true);
    } catch (err) {
      console.error('Error cargando afiliado:', err);
    } finally {
      setCargandoAfiliado(false);
    }
  };

  const handleVerHistorial = () => {
    if (!puestoSeleccionado) return;
    puestoParaHistorialRef.current = puestoSeleccionado;
    cerrarPopup();
    setPuestoHistorial(buildPuestoHistorial(puestoSeleccionado));
    setHistorialAbierto(true);
  };


  const handleCerrarCard = () => {
    setCardAbierta(false);
    setAfiliadoCard(null);
  };

  return (
    <div className="mapa-module" style={{ position: 'relative' }}>
      <h1>Mapa del Sistema</h1>

      {/* Loading global al fetchear afiliado */}
      <LoadingOverlay
        visible={cargandoAfiliado}
        zIndex={9999}
        overlayProps={{ blur: 2 }}
        loaderProps={{ color: '#EDBE3C', size: 'lg' }}
      />

      <BuscadorMapa
        busqueda={busqueda}
        onBuscar={buscar}
        resultados={resultadosBusqueda}
        mostrarResultados={mostrarResultados}
        onSeleccionar={seleccionarResultado}
        onCerrarResultados={() => setMostrarResultados(false)}
        filtroFila={filtroFila}
        onFiltroChange={setFiltroFila}
        cargando={loading}
      />

      <div style={{ position: 'relative' }}>
        <MapaSVG ref={mapaSVGRef} onEstadoChange={handleEstadoChange}>
          <PuestosOverlay
            puestos={puestosFiltrados}
            zoom={estadoMapa.zoom}
            posicion={estadoMapa.posicion}
            onClickPuesto={handleClickPuesto}
            puestoSeleccionado={puestoSeleccionado}
          />
          <PopupPuesto
            puesto={puestoSeleccionado}
            opened={popupAbierto}
            onClose={cerrarPopup}
            onVerAfiliado={handleVerAfiliado}
            onVerHistorial={handleVerHistorial}
            zoom={estadoMapa.zoom}
            posicion={estadoMapa.posicion}
          />
        </MapaSVG>
      </div>

      {/* Modal Historial */}
      <ModalMostrarHistorial
        opened={historialAbierto}
        close={() => setHistorialAbierto(false)}
        puesto={puestoHistorial}
      />

      {/* Modal Card Afiliado */}
      {cardAbierta && afiliadoCard && (
        <div className="card-overlay" onClick={handleCerrarCard}>
          <div className="card-modal" onClick={(e) => e.stopPropagation()}>
            <Card afiliado={afiliadoCard} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaModule;
