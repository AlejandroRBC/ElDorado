import { TextInput, PasswordInput, Button, Paper, Title, Text, Stack } from '@mantine/core';

export function LoginForm({ form, onSubmit, loading }) {
  return (
    <Paper radius="md" p="xl" withBorder shadow="md" w={400}>
      <Title order={2} ta="center" mb="md" c="dorado.5">ElDorado</Title>
      <Text size="sm" ta="center" mb="lg" c="dimmed">Sistema de Gestión Local</Text>
      
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput 
            label="Usuario" 
            placeholder="Introduce tu usuario" 
            {...form.getInputProps('usuario')} 
          />
          <PasswordInput 
            label="Contraseña" 
            placeholder="****" 
            {...form.getInputProps('password')} 
          />
          <Button type="submit" loading={loading} color="dorado.5" fullWidth mt="md">
            Ingresar al Sistema
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}