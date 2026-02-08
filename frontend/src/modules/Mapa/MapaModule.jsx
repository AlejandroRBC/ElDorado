// src/modules/mapa/MapaModule.jsx
import React from 'react';
import MapaSVG from './components/MapaSVG';
import './Styles/mapa.css';

const MapaModule = () => {
  return (
    <div className="mapa-module">
      <h1>Mapa del Sistema</h1>
      <MapaSVG />
    </div>
  );
};

export default MapaModule;