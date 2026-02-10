import { useLogin } from './context/LoginContext';
import LoginModule from './modules/Login/LoginModule';
import NavegacionModule from './modules/Navegacion/NavegacionModule';

function AppContent() {
  const { isLogin, loading } = useLogin();

  // Mostrar cargando mientras verifica autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f0f0f',
        color: '#edbe3c'
      }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  // Si no está autenticado, mostrar el login
  if (!isLogin) {
    return <LoginModule />;
  }

  // Si está autenticado, mostrar la navegación con módulos
  return <NavegacionModule />;
}

export default AppContent;