// frontend/src/main.jsx

// ============================================
// PUNTO DE ENTRADA DE LA APLICACIÓN
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Monta la aplicación React en el elemento root del HTML.
 * StrictMode activa advertencias adicionales en desarrollo.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);