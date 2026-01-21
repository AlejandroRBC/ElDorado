import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider, useAuth } from './context/AuthContext';
import { elDoradoTheme } from './theme';
import LoginModule from './modules/Login/LoginModule';
import { Button, Stack, Title, Text, Paper } from '@mantine/core';

// Importación obligatoria de estilos de Mantine
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function RootContent() {
  const { isAuth, user, logout } = useAuth(); 

  if (!isAuth) {
    return <LoginModule />;
  }

  return (
    <Paper p="xl" radius="md" withBorder shadow="md">
      <Stack align="center">
        <Title order={1} c="dorado.5">Bienvenido a ElDorado</Title>
        <Text size="lg">Hola, <b>{user.nombre}</b>.</Text>
        <Button variant="outline" color="dorado.5" onClick={logout}>
          Cerrar Sesión
        </Button> 
      </Stack>
    </Paper>
  );
}

function App() {
  return (
    <MantineProvider theme={elDoradoTheme} defaultColorScheme="light">
      <AuthProvider>
        {/* Las notificaciones deben estar FUERA del div de layout para flotar bien */}
        <Notifications position="top-right" zIndex={9999} />
        
        <main className="root-container">
          <RootContent />
        </main>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;