// src/modules/Mapa/MapaModule.jsx
import React, { useState, useRef, useCallback } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { useMediaQuery } from 'react-responsive';
import MapaSVG from './components/MapaSVG';
import PuestosOverlay from './components/PuestosOverlay';
import PopupPuesto from './components/PopupPuesto';
import BuscadorMapa from './components/BuscadorMapa';
import ModuleHeader from '../Navegacion/components/ModuleHeader';
import { useMapa } from './hooks/useMapa';
import { useMapaData, obtenerAfiliadoCompleto } from './hooks/useMapaData';
import { ModalMostrarHistorial } from '../GestionPatentesPuestos/components/ModalMostrarHistorial';
import { ModalAsignarPuesto } from '../GestionPatentesPuestos/components/ModalAsignarPuesto';
import Card from '../Afiliados/Components/Card';
import './Styles/mapa.css';

// ============================================
// MÓDULO MAPA
// ============================================

/**
 * Módulo principal del mapa interactivo de puestos.
 * Permite visualizar, buscar, filtrar y gestionar puestos del mercado.
 * Integra zoom, popups, historial y asignación de afiliados.
 */
const MapaModule = () => {
  const mapaSVGRef             = useRef(null);
  const puestoParaHistorialRef = useRef(null);

  // ── Responsive ──
  const isMobile = useMediaQuery({ maxWidth: 640 });

  // ── Estado del mapa (zoom, posición, dimensiones) ──
  const [estadoMapa, setEstadoMapa] = useState({
    zoom:         1,
    posicion:     { x: 0, y: 0 },
    zoomBase:     1,
    dimensiones:  { width: 0, height: 0 },
    contenedorRef: { current: null },
  });

  // ── Estado de modales y card ──
  const [historialAbierto,    setHistorialAbierto]    = useState(false);
  const [puestoHistorial,     setPuestoHistorial]     = useState(null);
  const [cardAbierta,         setCardAbierta]         = useState(false);
  const [afiliadoCard,        setAfiliadoCard]        = useState(null);
  const [cargandoAfiliado,    setCargandoAfiliado]    = useState(false);
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [puestoParaAsignar,   setPuestoParaAsignar]   = useState(null);

  // ── Datos enriquecidos desde BD ──
  const { puestosEnriquecidos, loading } = useMapaData();

  /**
   * Actualiza el estado del mapa cuando cambia zoom/posición.
   * @param {Object} nuevoEstado
   */
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
    zoom:          estadoMapa.zoom,
    zoomBase:      estadoMapa.zoomBase,
    posicion:      estadoMapa.posicion,
    setZoom:       (z) => mapaSVGRef.current?.setZoom(z),
    setPosicion:   (p) => mapaSVGRef.current?.setPosicion(p),
    dimensiones:   estadoMapa.dimensiones,
    contenedorRef: estadoMapa.contenedorRef,
    puestosData:   puestosEnriquecidos,
  });

  /**
   * Construye el objeto de puesto para el modal de historial.
   * @param {Object} puesto
   * @returns {Object}
   */
  const buildPuestoHistorial = (puesto) => ({
    id_puesto: puesto.id_puesto_bd || puesto.id,
    nroPuesto: puesto.nroPuesto,
    fila:      puesto.fila,
    cuadra:    puesto.cuadra || '—',
  });

  /**
   * Abre el modal de asignación de afiliado al puesto seleccionado.
   */
  const handleAsignarAfiliado = () => {
    if (!puestoSeleccionado) return;
    puestoParaHistorialRef.current = puestoSeleccionado;
    cerrarPopup();
    setPuestoParaAsignar({
      id_puesto:    puestoSeleccionado.id_puesto_bd,
      nroPuesto:    puestoSeleccionado.nroPuesto,
      fila:         puestoSeleccionado.fila,
      cuadra:       puestoSeleccionado.cuadra,
      rubro:        puestoSeleccionado.rubro || '',
      tiene_patente: puestoSeleccionado.tiene_patente || false,
    });
    setModalAsignarAbierto(true);
  };

  /**
   * Carga el afiliado completo y abre la card.
   */
  const handleVerAfiliado = async () => {
    if (!puestoSeleccionado?.id_afiliado) return;
    puestoParaHistorialRef.current = puestoSeleccionado;
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

  /**
   * Abre el modal de historial del puesto seleccionado.
   */
  const handleVerHistorial = () => {
    if (!puestoSeleccionado) return;
    puestoParaHistorialRef.current = puestoSeleccionado;
    cerrarPopup();
    setPuestoHistorial(buildPuestoHistorial(puestoSeleccionado));
    setHistorialAbierto(true);
  };

  /**
   * Desde la card del afiliado, abre el historial del puesto.
   */
  const handleHistorialDesdeCard = () => {
    setCardAbierta(false);
    setAfiliadoCard(null);
    const puesto = puestoParaHistorialRef.current;
    if (puesto) {
      setPuestoHistorial(buildPuestoHistorial(puesto));
      setHistorialAbierto(true);
    }
  };

  /** Cierra la card del afiliado. */
  const handleCerrarCard = () => {
    setCardAbierta(false);
    setAfiliadoCard(null);
  };

  return (
    <div
      className="mapa-module"
      style={{ padding: isMobile ? '0.5rem' : '1rem' }}
    >
      {/* ── Título del módulo ── */}
      <ModuleHeader title="Mapa de los Puestos" />

      {/* ── Loading al fetchear afiliado ── */}
      <LoadingOverlay
        visible={cargandoAfiliado}
        zIndex={9999}
        overlayProps={{ blur: 2 }}
        loaderProps={{ color: '#EDBE3C', size: 'lg' }}
      />

      {/* ── Buscador y filtros ── */}
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

      {/* ── Mapa interactivo ── */}
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
            onAsignarAfiliado={handleAsignarAfiliado}
            zoom={estadoMapa.zoom}
            posicion={estadoMapa.posicion}
          />
        </MapaSVG>
      </div>

      {/* ── Modal Historial ── */}
      <ModalMostrarHistorial
        opened={historialAbierto}
        close={() => setHistorialAbierto(false)}
        puesto={puestoHistorial}
      />

      {/* ── Modal Asignar Puesto ── */}
      <ModalAsignarPuesto
        opened={modalAsignarAbierto}
        close={() => setModalAsignarAbierto(false)}
        puesto={puestoParaAsignar}
        onAsignado={() => {
          setModalAsignarAbierto(false);
          window.location.reload();
        }}
      />

      {/* ── Card Afiliado ── */}
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