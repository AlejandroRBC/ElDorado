import { TextInput, PasswordInput, Button, Title, Stack } from '@mantine/core';
import logo from '../../../assets/logo.png';
import emperador from '../../../assets/emperador.jpeg';

// ============================================
// COMPONENTE DE FORMULARIO DE LOGIN
// ============================================
export function LoginForm({ form, onSubmit, loading }) {
  return (
    <div className="login-full-container">
      
      <div className="login-left-side">
        <div className="left-top-margin">
          <div className="logo-wrapper">
            <img 
              src={logo} 
              alt="Logo ElDorado" 
              className="logo-image"
            />
          </div>
        </div>

        <div className="gray-container">
          <div className="gray-container-inner">
            <img
              src={emperador}
              alt="Emperador"
              className="emperador-image"
            />
          </div>
        </div>
        
        <div className="left-bottom-margin"></div>
      </div>
      
      <div className="login-right-side">
        <div className="login-form-wrapper">
          <Stack align="center" justify="center" className="login-form-stack">
            <Title 
              order={1} 
              ta="center" 
              c="white" 
              className="login-title"
            >
              BIENVENIDO
            </Title>

            <form onSubmit={form.onSubmit(onSubmit)} className="login-form">
              <Stack className="login-form-fields">
                <TextInput
                  placeholder="Nombre de Usuario"
                  radius="50"
                  size="md"
                  className="login-input-usuario"
                  {...form.getInputProps('usuario')}
                />

                <PasswordInput
                  placeholder="Contraseña"
                  radius="50"
                  size="lg"
                  className="login-input-password"
                  {...form.getInputProps('password')}
                />

                <Button
                  type="submit"
                  loading={loading}
                  radius="50"
                  size="md"
                  className="login-submit-button"
                >
                  Iniciar Sesión
                </Button>
              </Stack>
            </form>
          </Stack>
        </div>
      </div>
    </div>
  );
}