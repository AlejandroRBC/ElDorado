import { MantineProvider, createTheme, Button} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider, useAuth } from './context/AuthContext'; // Importamos el contexto
import LoginModule from './modules/Login/LoginModule';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const elDoradoTheme = createTheme({
  colors: {
    dorado: ['#fdf9e2', '#f9f1c5', '#f2e28d', '#eabd51', '#e49f22', '#d4af37', '#b38f2a', '#917120', '#71561a', '#523e14'],
  },
  primaryColor: 'dorado',
  primaryShade: 5,
});

// Componente para decidir qué mostrar
function RootContent() {
  const { isAuth, user, logout} = useAuth();

  if (!isAuth) {
    return <LoginModule />;
  }

  return (
    <div >
      <h1>Bienvenido a ElDorado, {user.nombre}</h1>
      <p>Has iniciado sesión exitosamente. Pronto configuraremos el Dashboard.</p>
      {/* Aquí es donde luego irá nuestro Dashboard */}
      <Button 
        variant="outline" 
        color="dorado.5" 
        onClick={logout}
        size="md"
      >
        Cerrar Sesión
      </Button>
    </div>
  );
}

function App() {
  return (
    <MantineProvider theme={elDoradoTheme}>
      <AuthProvider>
        <Notifications position="top-right" />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RootContent />
        </div>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;