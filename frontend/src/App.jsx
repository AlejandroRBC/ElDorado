import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavegacionModule from './modules/Navegacion/NavegacionModule';
import { theme } from './theme';
import './App.css';

// Importación obligatoria de estilos de Mantine
import '@mantine/core/styles.layer.css';

import '@mantine/notifications/styles.css';

function RootContent() {
  const { isAuth, user, logout } = useAuth(); 

  if (!isAuth) {
    return <LoginModule />;
  }

  return <LayoutPrincipal />;
}

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <BrowserRouter>
        <AuthProvider>
          <NavegacionModule />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;