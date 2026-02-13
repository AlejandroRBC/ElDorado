import { useState, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import usuarioService from '../Services/UsuarioService';
import { useLogin } from '../../../context/LoginContext';

// ============================================
// HOOK DE LISTA DE USUARIOS
// ============================================

/**
 * Maneja la lógica de la lista de usuarios e historial
 */
const useUsuarioList = () => {
  const { isLogin, loading: authLoading } = useLogin();

  const [usuarios, setUsuarios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [filtroHistorial, setFiltroHistorial] = useState({
    id_usuario: '',
    desde: '',
    hasta: ''
  });

  /**
   * Cargar lista de usuarios
   */
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usuarioService.listar(filtro);
      setUsuarios(response.data.data || []);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Error al cargar usuarios',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  /**
   * Cargar historial de cambios
   */
  const cargarHistorial = useCallback(async () => {
    try {
      setLoadingHistorial(true);
      const response = await usuarioService.historial(filtroHistorial);
      setHistorial(response.data.data || []);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Error al cargar historial',
        color: 'red'
      });
    } finally {
      setLoadingHistorial(false);
    }
  }, [filtroHistorial]);

  // Cargar usuarios al montar o cambiar filtro
  useEffect(() => {
    if (!authLoading && isLogin) {
      cargarUsuarios();
    }
  }, [cargarUsuarios, authLoading, isLogin]);

  // Cargar historial al montar o cambiar filtros
  useEffect(() => {
    if (!authLoading && isLogin) {
      cargarHistorial();
    }
  }, [cargarHistorial, authLoading, isLogin]);

  /**
   * Desactivar usuario
   */
  const desactivar = async (id) => {
    try {
      await usuarioService.desactivar(id);
      notifications.show({
        title: 'Éxito',
        message: 'Usuario desactivado correctamente',
        color: 'green'
      });
      cargarUsuarios();
      cargarHistorial();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Error al desactivar',
        color: 'red'
      });
    }
  };

  /**
   * Reactivar usuario
   */
  const reactivar = async (id) => {
    try {
      await usuarioService.reactivar(id);
      notifications.show({
        title: 'Éxito',
        message: 'Usuario reactivado correctamente',
        color: 'green'
      });
      cargarUsuarios();
      cargarHistorial();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Error al reactivar',
        color: 'red'
      });
    }
  };

  return {
    usuarios,
    loading,
    filtro,
    setFiltro,
    desactivar,
    reactivar,
    recargar: cargarUsuarios,
    historial,
    loadingHistorial,
    filtroHistorial,
    setFiltroHistorial,
    recargarHistorial: cargarHistorial
  };
};

export default useUsuarioList;