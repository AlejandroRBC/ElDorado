import { useState } from 'react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { authService } from '../services/authService';
import { useAuth } from '../../../context/AuthContext';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Formulario SIN validaciones (solo inicialización)
  const form = useForm({
    initialValues: { usuario: '', password: '' }
    // NO hay validate aquí - todo lo valida el backend
  });

  const handleLogin = async (values) => {
    setLoading(true);
    
    try {
      // Enviar al backend (sin validar en frontend)
      const data = await authService.login(values);
      
      if (data.success) {
        // ÉXITO - Mostrar mensaje del backend o uno genérico
        notifications.show({
          title: '¡Acceso Correcto!',
          message: data.message || `Bienvenido, ${data.user.usuario}`,
          color: 'green',
          autoClose: 3000,
        });
        
        // Guardar usuario en contexto
        login(data.user);
        
        return { 
          success: true, 
          user: data.user
        };
        
      } else {
        // ERROR del backend - Mostrar mensaje exacto que viene del backend
        notifications.show({
          title: 'Error de Autenticación',
          message: data.message || 'Error desconocido',
          color: 'red',
          autoClose: 5000,
        });
        
        return { 
          success: false, 
          error: data.message 
        };
      }
      
    } catch (err) {
      // ERROR de conexión/red (no llegó al backend)
      notifications.show({
        title: 'Error de Conexión',
        message: err.message || 'No se pudo conectar con el servidor',
        color: 'red',
      });
      
      return { 
        success: false, 
        error: err.message 
      };
      
    } finally {
      setLoading(false);
    }
  };

  return { form, handleLogin, loading };
}