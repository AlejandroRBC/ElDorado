import React, { createContext, useContext, useState, useEffect } from 'react';

const LoginContext = createContext();

export function LoginProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const checkLogin = () => {
      const savedUser = localStorage.getItem('user_session');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsLogin(true);
        } catch (error) {
          console.error('Error parsing user session:', error);
          localStorage.removeItem('user_session');
        }
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  // Iniciar sesión
  const login = (userData) => {
    setUser(userData);
    setIsLogin(true);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  // Cerrar sesión
  const logout = () => {
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

export function useLogin() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
}
