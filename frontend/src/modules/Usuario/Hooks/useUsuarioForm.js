import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import usuarioService from '../Services/UsuarioService';
import { useLogin } from '../../../context/LoginContext';

// ============================================
// HOOK DE FORMULARIO DE USUARIO
// ============================================

/**
 * Maneja la lógica del formulario de usuario (crear/editar)
 */
const useUsuarioForm = ({ onSuccess, usuarioId = null }) => {
  const { isLogin, loading: authLoading } = useLogin();

  const [loading, setLoading] = useState(false);
  const [loadingAfiliados, setLoadingAfiliados] = useState(false);
  const [afiliados, setAfiliados] = useState([]);
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id_afiliado: '',
    rol: 'usuario',
    nom_usuario: '',
    password: ''
  });

  const esEdicion = !!usuarioId;

  // Cargar afiliados (solo en modo creación)
  useEffect(() => {
    if (!authLoading && isLogin && !esEdicion) {
      const cargarAfiliados = async () => {
        try {
          setLoadingAfiliados(true);
          const response = await usuarioService.obtenerAfiliadosSelect();
          setAfiliados(response.data.data || []);
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'No se pudieron cargar los afiliados',
            color: 'red'
          });
        } finally {
          setLoadingAfiliados(false);
        }
      };

      cargarAfiliados();
    }
  }, [authLoading, isLogin, esEdicion]);

  /**
   * Buscar afiliados por término
   */
  const buscarAfiliados = async (search) => {
    try {
      setLoadingAfiliados(true);
      const response = await usuarioService.obtenerAfiliadosSelect(search);
      setAfiliados(response.data.data || []);
    } finally {
      setLoadingAfiliados(false);
    }
  };

  // Cargar usuario en modo edición
  useEffect(() => {
    if (!authLoading && isLogin && usuarioId) {
      const cargarUsuario = async () => {
        try {
          setLoading(true);
          
          const responseUsuario = await usuarioService.obtener(usuarioId);
          const usuario = responseUsuario.data.data;

          const responseAfiliado = await usuarioService.obtenerAfiliadoPorId(usuario.id_afiliado);
          const afiliadoData = responseAfiliado.data.data;

          setFormData({
            id_afiliado: usuario.id_afiliado || '',
            id_afiliado_data: afiliadoData,
            rol: usuario.rol,
            nom_usuario: usuario.nom_usuario,
            password: ''
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Error al cargar datos del usuario',
            color: 'red'
          });
        } finally {
          setLoading(false);
        }
      };

      cargarUsuario();
    }
  }, [usuarioId, authLoading, isLogin]);

  /**
   * Actualizar campo del formulario
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const dataToSend = { 
        id_afiliado: formData.id_afiliado,
        rol: formData.rol,
        nom_usuario: formData.nom_usuario
      };
      
      // Solo agregar password si corresponde
      if (!esEdicion) {
        dataToSend.password = formData.password;
      } else if (esEdicion && cambiarPassword && formData.password) {
        dataToSend.password = formData.password;
      }

      let response;
      if (esEdicion) {
        response = await usuarioService.actualizar(usuarioId, dataToSend);
      } else {
        response = await usuarioService.crear(dataToSend);
      }

      notifications.show({
        title: 'Éxito',
        message: esEdicion
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente',
        color: 'green'
      });

      if (onSuccess) onSuccess(response.data);

    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Error al guardar usuario',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetear formulario
   */
  const resetForm = () => {
    setFormData({
      id_afiliado: '',
      rol: 'usuario',
      nom_usuario: '',
      password: ''
    });
    setCambiarPassword(false);
    setSearchTerm('');
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    resetForm,
    loading,
    loadingAfiliados,
    afiliados,
    esEdicion,
    cambiarPassword,
    setCambiarPassword,
    searchTerm,
    setSearchTerm,
    buscarAfiliados
  };
};

export default useUsuarioForm;