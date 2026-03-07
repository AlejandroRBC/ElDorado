// frontend/src/context/LoginContext.jsx

// ============================================
// CONTEXTO GLOBAL DE AUTENTICACIÓN
// ============================================

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const LoginContext = createContext();

/** Tiempo de inactividad antes de cerrar sesión automáticamente (5 minutos) */
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

/**
 * Provider global de autenticación.
 * Verifica la sesión al montar, gestiona el temporizador de inactividad
 * y expone login, logout y updateUser al resto de la aplicación.
 */
export function LoginProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  const inactivityTimer = useRef(null);

  // ── Verificar sesión activa al iniciar ──
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

  /**
   * Inicia o reinicia el temporizador de inactividad.
   * Al expirar cierra la sesión automáticamente.
   */
  const iniciarTemporizadorInactividad = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => logout(), INACTIVITY_TIMEOUT);
  };

  /**
   * Reinicia el temporizador si el usuario está autenticado.
   * Se llama en cada evento de actividad del usuario.
   */
  const reiniciarTemporizador = () => {
    if (isLogin) iniciarTemporizadorInactividad();
  };

  // ── Escuchar eventos de actividad para reiniciar el temporizador ──
  useEffect(() => {
    if (!isLogin) return;

    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    eventos.forEach(evento => window.addEventListener(evento, reiniciarTemporizador));

    return () => {
      eventos.forEach(evento => window.removeEventListener(evento, reiniciarTemporizador));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isLogin]);

  /**
   * Inicia sesión guardando los datos del usuario en estado y localStorage.
   */
  const login = (userData) => {
    setUser(userData);
    setIsLogin(true);
    localStorage.setItem('user_session', JSON.stringify(userData));
    iniciarTemporizadorInactividad();
  };

  /**
   * Actualiza parcialmente los datos del usuario en estado y localStorage.
   */
  const updateUser = (nuevosDatos) => {
    setUser(prev => {
      const updated = { ...prev, ...nuevosDatos };
      localStorage.setItem('user_session', JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Cierra sesión llamando al backend y luego limpiando el estado local.
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
   * Limpia el estado local de sesión sin llamar al backend.
   */
  const cerrarSesionLocal = () => {
    setUser(null);
    setIsLogin(false);
    localStorage.removeItem('user_session');
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  };

  return (
    <LoginContext.Provider value={{ user, isLogin, loading, login, logout, updateUser }}>
      {children}
    </LoginContext.Provider>
  );
}

/**
 * Hook para consumir el contexto de autenticación.
 * Lanza error si se usa fuera del LoginProvider.
 */
export function useLogin() {
  const context = useContext(LoginContext);
  if (!context) throw new Error('useLogin must be used within LoginProvider');
  return context;
}