import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const LoginContext = createContext();

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

// ============================================
// PROVIDER DE AUTENTICACIÓN
// ============================================
export function LoginProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  
  const inactivityTimer = useRef(null);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const response = await api.get('/auth/verificarSesion');

        if (response.data?.success && response.data?.user) {
          setUser(response.data.user);
          setIsLogin(true);
          localStorage.setItem('user_session', JSON.stringify(response.data.user));
          iniciarTemporizadorInactividad();
        } else {
          cerrarSesionLocal();
        }

      } catch (error) {
        if (error.response?.status !== 401) {
          console.error('Error inesperado verificando sesión:', error);
        }
        cerrarSesionLocal();
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, []);

  const iniciarTemporizadorInactividad = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    inactivityTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  };

  const reiniciarTemporizador = () => {
    if (isLogin) {
      iniciarTemporizadorInactividad();
    }
  };

  useEffect(() => {
    if (!isLogin) return;

    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    eventos.forEach(evento => {
      window.addEventListener(evento, reiniciarTemporizador);
    });

    return () => {
      eventos.forEach(evento => {
        window.removeEventListener(evento, reiniciarTemporizador);
      });
      
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [isLogin]);

  const login = (userData) => {
    setUser(userData);
    setIsLogin(true);
    localStorage.setItem('user_session', JSON.stringify(userData));
    iniciarTemporizadorInactividad();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Error esperado si no hay conexión
    }

    cerrarSesionLocal();
  };

  const cerrarSesionLocal = () => {
    setUser(null);
    setIsLogin(false);
    localStorage.removeItem('user_session');
    
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  };

  return (
    <LoginContext.Provider value={{ user, isLogin, loading, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLogin() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within LoginProvider');
  }
  return context;
}