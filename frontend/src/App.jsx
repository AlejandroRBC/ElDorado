import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { LoginProvider } from './context/LoginContext';
import AppContent from './AppContent';
import { theme } from './theme';
import './App.css';

// Importación obligatoria de estilos de Mantine
import '@mantine/core/styles.layer.css';
import '@mantine/notifications/styles.css';

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