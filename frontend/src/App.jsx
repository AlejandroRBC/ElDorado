import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider, useAuth } from './context/AuthContext';
import { elDoradoTheme } from './theme';
import LoginModule from './modules/Login/LoginModule';
import LayoutPrincipal from './modules/Navegacion/components/LayoutPrincipal';

// Importación obligatoria de estilos de Mantine
import '@mantine/core/styles.css';
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
    <MantineProvider theme={elDoradoTheme} defaultColorScheme="light">
      <AuthProvider>
        <Notifications position="top-right" zIndex={9999} />
        <main className="root-container">
          <RootContent />
        </main>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;