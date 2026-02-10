import { useState } from 'react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { LoginService } from '../services/LoginService';
import { useLogin } from '../../../context/LoginContext';

export function useLoginForm() {
  const [loading, setLoading] = useState(false);
  const { login } = useLogin(); // ← LOGIN CONTEXT

  // Formulario sin validaciones (backend manda)
  const form = useForm({
    initialValues: {
      usuario: '',
      password: '',
    },
  });

  const handleLogin = async (values) => {
    setLoading(true);

    try {
      // Llamada al backend
      const data = await LoginService.login(values);

      if (data.success) {
        notifications.show({
          title: '¡Acceso Correcto!',
          message: data.message || `Bienvenido, ${data.user.usuario}`,
          color: 'green',
          autoClose: 3000,
        });

        // Guardar sesión
        login(data.user);

        return { success: true, user: data.user };
      } else {
        notifications.show({
          title: 'Error de Login',
          message: data.message || 'Credenciales incorrectas',
          color: 'red',
          autoClose: 5000,
        });

        return { success: false, error: data.message };
      }
    } catch (err) {
      notifications.show({
        title: 'Error de Conexión',
        message: err.message || 'No se pudo conectar con el servidor',
        color: 'red',
      });

      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { form, handleLogin, loading };
}
