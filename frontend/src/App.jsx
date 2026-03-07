// frontend/src/App.jsx

// ============================================
// COMPONENTE RAÍZ DE LA APLICACIÓN
// ============================================

import '@mantine/core/styles.css';
import '@mantine/core/styles.layer.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { LoginProvider } from './context/LoginContext';
import AppContent from './AppContent';
import { theme } from './theme';
import './App.css';

/**
 * Componente raíz que envuelve toda la aplicación con los providers globales.
 * - MantineProvider: tema y estilos de componentes UI
 * - Notifications: sistema de notificaciones toast (top-right)
 * - BrowserRouter: enrutamiento con historial del navegador
 * - LoginProvider: contexto global de autenticación
 */
function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <BrowserRouter>
        <LoginProvider>
          <AppContent />
        </LoginProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;