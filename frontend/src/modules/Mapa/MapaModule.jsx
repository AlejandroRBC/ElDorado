// src/modules/Mapa/MapaModule.jsx
import React, { useState, useRef, useCallback } from 'react';
import MapaSVG from './components/MapaSVG';
import PuestosOverlay from './components/PuestosOverlay';
import PopupPuesto from './components/PopupPuesto';
import BuscadorMapa from './components/BuscadorMapa';
import { useMapa } from './hooks/useMapa';
import { ModalMostrarHistorial } from '../GestionPatentesPuestos/components/ModalMostrarHistorial';
import Card from '../Afiliados/Components/Card';
import './Styles/mapa-zoom.css';
import './Styles/mapaInteractivo.css';

const MapaModule = () => {
  const mapaSVGRef = useRef(null);
  const [estadoMapa, setEstadoMapa] = useState({
    zoom: 1,
    posicion: { x: 0, y: 0 },
    zoomBase: 1,
    dimensiones: { width: 0, height: 0 },
    contenedorRef: { current: null },
  });

  // Modal historial
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [puestoHistorial, setPuestoHistorial] = useState(null);

  // Card afiliado
  const [cardAbierta, setCardAbierta] = useState(false);
  const [afiliadoCard, setAfiliadoCard] = useState(null);

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
  });

  const handleVerAfiliado = () => {
    if (!puestoSeleccionado) return;
    cerrarPopup();

    // Si tiene afiliado asignado, abrir card
    if (puestoSeleccionado.afiliado) {
      setAfiliadoCard(puestoSeleccionado.afiliado);
      setCardAbierta(true);
    } else {
      // Sin afiliado asignado - puedes mostrar un toast o mensaje
      // Por ahora solo cerramos el popup
    }
  };

  const handleVerHistorial = () => {
    if (!puestoSeleccionado) return;
    cerrarPopup();
    setPuestoHistorial({
      id_puesto: puestoSeleccionado.nroPuesto,
      nroPuesto: puestoSeleccionado.nroPuesto,
      fila: puestoSeleccionado.fila,
      cuadra: puestoSeleccionado.cuadra || '—',
    });
    setHistorialAbierto(true);
  };

  return (
    <div className="mapa-module">
      <h1>Mapa del Sistema</h1>

      {/* Buscador + filtros */}
      <BuscadorMapa
        busqueda={busqueda}
        onBuscar={buscar}
        resultados={resultadosBusqueda}
        mostrarResultados={mostrarResultados}
        onSeleccionar={seleccionarResultado}
        onCerrarResultados={() => setMostrarResultados(false)}
        filtroFila={filtroFila}
        onFiltroChange={setFiltroFila}
      />

      {/* Mapa con overlay */}
      <div style={{ position: 'relative' }}>
        <MapaSVG ref={mapaSVGRef} onEstadoChange={handleEstadoChange}>
          {/* Overlay de puestos interactivos */}
          <PuestosOverlay
            puestos={puestosFiltrados}
            zoom={estadoMapa.zoom}
            posicion={estadoMapa.posicion}
            onClickPuesto={handleClickPuesto}
            puestoSeleccionado={puestoSeleccionado}
          />

          {/* Popup al hacer click */}
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

      {/* Card Afiliado (Modal) */}
      {cardAbierta && afiliadoCard && (
        <div
          className="card-overlay"
          onClick={() => setCardAbierta(false)}
        >
          <div
            className="card-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="card-cerrar"
              onClick={() => setCardAbierta(false)}
            >
              ✕
            </button>
            <Card afiliado={afiliadoCard} />
            <div style={{ padding: '0 16px 16px' }}>
              <button
                onClick={() => {
                  setCardAbierta(false);
                  setPuestoHistorial({
                    id_puesto: puestoSeleccionado?.nroPuesto,
                    nroPuesto: puestoSeleccionado?.nroPuesto,
                    fila: puestoSeleccionado?.fila,
                    cuadra: puestoSeleccionado?.cuadra || '—',
                  });
                  setHistorialAbierto(true);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#EDBE3C',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#0f0f0f',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
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
