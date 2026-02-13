import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const LoginContext = createContext();

// ============================================
// PROVIDER DE AUTENTICACIÓN
// ============================================

/**
 * Proveedor del contexto de autenticación
 * Maneja el estado del usuario y las sesiones
 */
export function LoginProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const response = await api.get('/auth/verificarSesion');

        if (response.data?.usuario) {
          setUser(response.data.usuario);
          setIsLogin(true);
          localStorage.setItem(
            'user_session',
            JSON.stringify(response.data.usuario)
          );
        } else {
          cerrarSesionLocal();
        }

      } catch (error) {
        cerrarSesionLocal();
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, []);

  /**
   * Guardar sesión del usuario
   */
  const login = (userData) => {
    setUser(userData);
    setIsLogin(true);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  /**
   * Cerrar sesión (cliente y servidor)
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Error esperado si no hay conexión
    }

    cerrarSesionLocal();
  };

  /**
   * Limpiar datos de sesión local
   */
  const cerrarSesionLocal = () => {
    setUser(null);
    setIsLogin(false);
    localStorage.removeItem('user_session');
  };

  return (
    <LoginContext.Provider value={{ user, isLogin, loading, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
}

/**
 * Hook para usar el contexto de login
 */
export function useLogin() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within LoginProvider');
  }
  return context;
}