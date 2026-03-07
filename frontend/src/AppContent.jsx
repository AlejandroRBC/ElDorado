// frontend/src/AppContent.jsx

// ============================================
// CONTENIDO PRINCIPAL DE LA APLICACIÓN
// ============================================

import { useLogin } from './context/LoginContext';
import LoginModule from './modules/Login/LoginModule';
import NavegacionModule from './modules/Navegacion/NavegacionModule';

/**
 * Decide qué renderizar según el estado de autenticación.
 * - Cargando: pantalla negra con texto amarillo mientras verifica sesión
 * - No autenticado: módulo de login
 * - Autenticado: módulo de navegación con todos los módulos del sistema
 */
function AppContent() {
  const { isLogin, loading } = useLogin();

  if (loading) {
    return (
      <div style={{
        display:         'flex',
        justifyContent:  'center',
        alignItems:      'center',
        height:          '100vh',
        backgroundColor: '#0f0f0f',
        color:           '#edbe3c'
      }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  if (!isLogin) return <LoginModule />;

  return <NavegacionModule />;
}

export default AppContent;