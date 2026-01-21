import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { loginService } from './loginService'; // <--- Importamos el servicio

export default function LoginModule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: { usuario: '', password: '' },
    validate: {
      usuario: (val) => (val.length < 1 ? 'Campo requerido' : null),
      password: (val) => (val.length < 1 ? 'Campo requerido' : null),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      // USANDO EL SERVICIO
      const data = await loginService.login(values);
      
      if (data.success) {
        // Guardamos la sesión (opcional por ahora)
        localStorage.setItem('user_session', JSON.stringify(data.user));
        alert(`¡Bienvenido al sistema ElDorado, ${data.user.nombre}!`);
      }
    } catch (err) {
      // El error que lanzamos en el servicio llega aquí
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder shadow="md">
      <Title order={2} ta="center" mb="md" c="dorado.5">ElDorado</Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput 
            label="Usuario" 
            placeholder="admin" 
            {...form.getInputProps('usuario')} 
          />
          <PasswordInput 
            label="Contraseña" 
            placeholder="****" 
            {...form.getInputProps('password')} 
          />

          {error && <Text c="red" size="sm">{error}</Text>}

          <Button type="submit" loading={loading} color="dorado.5" fullWidth mt="md">
            Ingresar
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}