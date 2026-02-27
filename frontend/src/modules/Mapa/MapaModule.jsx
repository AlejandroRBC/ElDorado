// src/modules/Mapa/MapaModule.jsx
import React, { useState, useRef, useCallback } from 'react';
import MapaSVG from './components/MapaSVG';
import PuestosOverlay from './components/PuestosOverlay';
import PopupPuesto from './components/PopupPuesto';
import BuscadorMapa from './components/BuscadorMapa';
import { useMapa } from './hooks/useMapa';
import { useMapaData } from './hooks/useMapaData';
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

  // Datos reales del backend cruzados con coordenadas SVG
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
    // Pasamos los puestos enriquecidos para búsqueda y filtros
    puestosData: puestosEnriquecidos,
  });

  const buildPuestoHistorial = (puesto) => ({
    id_puesto: puesto.id,
    nroPuesto: puesto.nroPuesto,
    fila: puesto.fila,
    cuadra: puesto.cuadra || '—',
  });

  const handleVerAfiliado = () => {
    if (!puestoSeleccionado) return;
    puestoParaHistorialRef.current = puestoSeleccionado;
    cerrarPopup();
    if (puestoSeleccionado.afiliado) {
      setAfiliadoCard(puestoSeleccionado.afiliado);
      setCardAbierta(true);
    }
  };

  const handleVerHistorial = () => {
    if (!puestoSeleccionado) return;
    puestoParaHistorialRef.current = puestoSeleccionado;
    cerrarPopup();
    setPuestoHistorial(buildPuestoHistorial(puestoSeleccionado));
    setHistorialAbierto(true);
  };

  const handleHistorialDesdeCard = () => {
    setCardAbierta(false);
    setAfiliadoCard(null);
    const puesto = puestoParaHistorialRef.current;
    if (puesto) {
      setPuestoHistorial(buildPuestoHistorial(puesto));
      setHistorialAbierto(true);
    }
  };

  const handleCerrarCard = () => {
    setCardAbierta(false);
    setAfiliadoCard(null);
  };

  return (
    <div className="mapa-module">
      <h1>Mapa del Sistema</h1>

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

      <ModalMostrarHistorial
        opened={historialAbierto}
        close={() => setHistorialAbierto(false)}
        puesto={puestoHistorial}
      />

      {cardAbierta && afiliadoCard && (
        <div className="card-overlay" onClick={handleCerrarCard}>
          <div className="card-modal" onClick={(e) => e.stopPropagation()}>

            <div className="card-modal-header">
              <div className="card-modal-puesto-info">
                {puestoParaHistorialRef.current && (
                  <>
                    <span className="card-modal-puesto-badge">
                      Puesto {puestoParaHistorialRef.current.nroPuesto}
                    </span>
                    <span className="card-modal-fila-badge">
                      Fila {puestoParaHistorialRef.current.fila}
                    </span>
                    <span className="card-modal-cuadra">
                      {puestoParaHistorialRef.current.cuadra}
                    </span>
                  </>
                )}
              </div>
              <button className="card-cerrar" onClick={handleCerrarCard}>✕</button>
            </div>

            <Card afiliado={afiliadoCard} />

            <div style={{ padding: '8px 16px 16px' }}>
              <button onClick={handleHistorialDesdeCard} className="card-historial-btn">
                Ver Historial del Puesto
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MapaModule;
