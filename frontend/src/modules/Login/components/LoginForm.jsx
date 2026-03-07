import { TextInput, PasswordInput, Button, Title, Stack } from '@mantine/core';
import { useMediaQuery } from 'react-responsive';
import logo from '../../../assets/logo.png';
import emperador from '../../../assets/emperador.jpeg';
import '../styles/login.css';

// ============================================
// COMPONENTE DE FORMULARIO DE LOGIN
// ============================================

/**
 * Formulario de autenticación con diseño dividido en dos mitades.
 * Izquierda: imagen del emperador con logo.
 * Derecha: formulario de usuario y contraseña sobre fondo negro.
 *
 * @param {Object}   form     - Instancia del formulario de Mantine
 * @param {Function} onSubmit - Callback al enviar el formulario
 * @param {boolean}  loading  - Estado de carga del botón submit
 */
export function LoginForm({ form, onSubmit, loading }) {
  // ── Breakpoints responsive ──
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const isTablet = useMediaQuery({ minWidth: 641, maxWidth: 1024 });

  return (
    <div
      className="login-full-container"
      style={{
        flexDirection: isMobile ? 'column' : 'row',
        height:        isMobile ? 'auto' : '100vh',
        minHeight:     isMobile ? '100vh' : 'unset',
        overflowY:     isMobile ? 'auto' : 'hidden',
      }}
    >

      {/* ── Lado izquierdo: logo + imagen ── */}
      <div
        className="login-left-side"
        style={{
          flex:   isMobile ? 'none' : 1,
          height: isMobile ? '200px' : 'auto',
        }}
      >
        <div
          className="left-top-margin"
          style={{
            height:  isMobile ? 'auto' : '120px',
            padding: isMobile
              ? '24px 24px 0 24px'
              : isTablet
              ? '50px 30px 0 60px'
              : '70px 40px 0 100px',
          }}
        >
          <div className="logo-wrapper">
            <img
              src={logo}
              alt="Logo ElDorado"
              className="logo-image"
              style={{
                width:     isMobile ? '110px' : '150px',
                marginTop: isMobile ? '0' : '-85px',
              }}
            />
          </div>
        </div>

        <div
          className="gray-container"
          style={{
            marginLeft:   isMobile ? '0' : isTablet ? '60px' : '100px',
            borderRadius: isMobile ? '0' : '20px 0 0 20px',
            height:       isMobile ? '140px' : 'auto',
            margin:       isMobile ? '12px 0 0 0' : undefined,
          }}
        >
          <div
            className="gray-container-inner"
            style={{ borderRadius: isMobile ? '0' : '20px 0 0 20px' }}
          >
            <img
              src={emperador}
              alt="Emperador"
              className="emperador-image"
            />
          </div>
        </div>

        {/* Margen inferior oculto en móvil */}
        {!isMobile && (
          <div
            className="left-bottom-margin"
            style={{
              height:     isTablet ? '80px' : '120px',
              marginLeft: isTablet ? '60px' : '40px',
            }}
          />
        )}
      </div>

      {/* ── Lado derecho: formulario ── */}
      <div
        className="login-right-side"
        style={{
          alignItems: isMobile ? 'flex-start' : 'center',
          padding:    isMobile ? '3rem 1.5rem 2.5rem' : '0',
        }}
      >
        <div
          className="login-form-wrapper"
          style={{ maxWidth: isMobile ? '100%' : '450px' }}
        >
          <Stack align="center" justify="center" className="login-form-stack"
            style={{ marginTop: isMobile ? '0' : '-40px' }}
          >

            {/* Título de bienvenida */}
            <Title
              order={1}
              ta="center"
              c="white"
              className="login-title"
              style={{ fontSize: isMobile ? '36px' : isTablet ? '38px' : '45px' }}
            >
              BIENVENIDO
            </Title>

            <form onSubmit={form.onSubmit(onSubmit)} className="login-form">
              <Stack className="login-form-fields">

                {/* Campo usuario */}
                <TextInput
                  placeholder="Nombre de Usuario"
                  radius="50"
                  size="md"
                  className="login-input-usuario"
                  {...form.getInputProps('usuario')}
                />

                {/* Campo contraseña */}
                <PasswordInput
                  placeholder="Contraseña"
                  radius="50"
                  size="lg"
                  className="login-input-password"
                  {...form.getInputProps('password')}
                />

                {/* Botón submit */}
                <Button
                  type="submit"
                  loading={loading}
                  radius="50"
                  size="md"
                  className="login-submit-button"
                  style={{ width: isMobile ? '80%' : '60%' }}
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