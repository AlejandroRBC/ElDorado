import { Group, Paper, Text, Menu, Avatar } from '@mantine/core';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { useLogin } from '../../../context/LoginContext';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import logo from '../../../assets/logo.png';
import '../styles/navegacion.css';

// ============================================
// COMPONENTE TOPBAR
// ============================================

/**
 * Barra superior fija del sistema.
 * Muestra el logo a la izquierda y el menú de usuario a la derecha.
 * En móvil oculta el nombre de usuario para ahorrar espacio.
 *
 * @returns {JSX.Element}
 */
const Topbar = () => {
  const { user, logout } = useLogin();
  const navigate = useNavigate();

  // ── Breakpoints responsive ──
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const isTablet = useMediaQuery({ minWidth: 641, maxWidth: 1024 });

  /**
   * Cerrar sesión y redirigir al login
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Navegar a la pantalla de configuración de usuarios
   */
  const handleConfiguracion = () => {
    navigate('/admin/usuarios');
  };

  return (
    <Paper className="topbar-paper" shadow="none" radius={0}>
      <div
        className="topbar-inner"
        style={{ padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1.5rem' }}
      >

        {/* ── Logo*/}
        <div style={{
        width:          isMobile ? 'auto' : isTablet ? '60px' : '200px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        position:       'relative',   
      }}>
        <img
          src={logo}
          alt="Logo El Dorado"
          className="topbar-logo"
          style={{
            position:  'absolute',    
            top:       '-80px',         
            left:      '-15px',        
            height:    isMobile ? '30px' : '180px',
            width:     isMobile ? 'auto' : '100%',
            objectFit: 'contain',
          }}
        />
      </div>

        {/* ── Lado derecho: usuario + menú ── */}
        <Group gap="md" className="topbar-right" style={{ paddingTop: '10px' }}>
          {user && (
            <>
              {/* Nombre de usuario (oculto en móvil y tablet) */}
              {!isMobile && !isTablet && (
                <Text className="topbar-username">
                  {user.nom_usuario}
                </Text>
              )}

              {/* Menú desplegable del avatar */}
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Avatar
                    size="md"
                    radius="xl"
                    className="topbar-avatar"
                  >
                    {user.nom_usuario?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label className="topbar-menu-label">
                    Usuario: {user.nom_usuario}
                  </Menu.Label>
                  <Menu.Label className="topbar-menu-label">
                    Rol: {user.rol}
                  </Menu.Label>
                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    onClick={handleConfiguracion}
                    className="topbar-menu-item"
                  >
                    Configuración
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                    color="red"
                    className="topbar-menu-item"
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}
        </Group>
      </div>
    </Paper>
  );
};

export default Topbar;