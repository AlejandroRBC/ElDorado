import { TextInput, PasswordInput, Button, Title, Stack } from '@mantine/core';
import logo from '../../../assets/logo.png';
import emperador from '../../../assets/emperador.jpeg';

// ============================================
// COMPONENTE DE FORMULARIO DE LOGIN
// ============================================

/**
 * Formulario visual de login con diseño dividido
 */
export function LoginForm({ form, onSubmit, loading }) {
  return (
    <div className="login-full-container">
      
      {/* Lado izquierdo - Imagen */}
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
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '20px 0 0 20px',
            overflow: 'hidden',
          }}>
            <img
              src={emperador}
              alt="Emperador"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
        
        <div className="left-bottom-margin"></div>
      </div>
      
      {/* Lado derecho - Formulario */}
      <div className="login-right-side">
        <div className="login-form-wrapper">
          <Stack align="center" justify="center" style={{ height: '100%', marginTop: '-40px' }}>
            <Title 
              order={1} 
              ta="center" 
              c="white" 
              style={{ 
                marginBottom: '15px',
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: '45px',
                lineHeight: '100%',
                transform: 'scaleX(0.9)',    
                transformOrigin: 'center',   
              }}
            >
              BIENVENIDO
            </Title>

            <form onSubmit={form.onSubmit(onSubmit)} style={{ width: '100%', maxWidth: 520 }}>
              <Stack gap="lg">
                <TextInput
                  placeholder="Nombre de Usuario"
                  radius="50"
                  size="md"
                  styles={{
                    input: {
                      backgroundColor: '#FFFFFF',
                      color: '#0F0F0F',
                      borderRadius: '50px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      height: '52px',
                      fontSize: '15px',
                      width: '100%',
                      '&::placeholder': {
                        color: '#C4C4C4',
                      }
                    },
                  }}
                  {...form.getInputProps('usuario')}
                />

                <PasswordInput
                  placeholder="Contraseña"
                  radius="50"
                  size="md"
                  styles={{
                    input: {
                      backgroundColor: '#FFFFFF',
                      color: '#0F0F0F',
                      borderRadius: '50px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      height: '52px',
                      fontSize: '15px',
                      width: '100%',
                      '&::placeholder': {
                        color: '#C4C4C4',
                      }
                    },
                    innerInput: {
                      paddingLeft: '25px', 
                      color: '#0F0F0F',
                      '&::placeholder': {
                        color: '#C4C4C4',
                      }
                    }
                  }}
                  {...form.getInputProps('password')}
                />

                <Button
                  type="submit"
                  loading={loading}
                  radius="50"
                  size="md"
                  mt="10px"
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    width: '60%',
                    alignSelf: 'center',
                    borderRadius: '50px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    height: '52px',
                    backgroundColor: '#EDBE3C',
                    color: '#0F0F0F',
                  }}
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