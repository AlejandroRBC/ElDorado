import { useState } from 'react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { loginService } from './loginService';

import { useAuth } from '../../context/AuthContext'; // Importamos el hook de auth

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Extraemos la función login del contexto global

  const form = useForm({
    initialValues: { usuario: '', password: '' },
    validate: {
      usuario: (val) => (val.length < 1 ? 'Requerido' : null),
      password: (val) => (val.length < 1 ? 'Requerido' : null),
    },
  });

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const data = await loginService.login(values);
      if (data.success) {
        notifications.show({
          title: '¡Acceso Correcto!',
          message: `Bienvenido, ${data.user.nombre}`,
          color: 'green',
        });
        localStorage.setItem('user_session', JSON.stringify(data.user));
        login(data.user)
        // Aquí podrías disparar una redirección
      }
    } catch (err) {
      notifications.show({
        title: 'Error de Autenticación',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Retornamos solo lo que la UI necesita
  return { form, handleLogin, loading };
}