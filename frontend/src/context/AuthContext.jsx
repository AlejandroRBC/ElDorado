import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user_session');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuth(true);
        } catch (error) {
          console.error('Error parsing user session:', error);
          localStorage.removeItem('user_session');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
    setIsAuth(true);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    setIsAuth(false);
    localStorage.removeItem('user_session');
  };

  return (
    <AuthContext.Provider value={{ user, isAuth, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}