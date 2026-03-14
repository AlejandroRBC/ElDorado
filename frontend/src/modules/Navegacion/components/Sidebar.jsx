import { NavLink } from 'react-router-dom';
import { Stack } from '@mantine/core';
import { useMediaQuery } from 'react-responsive';
import {
  IconBuildingCommunity,
  IconHome,
  IconUsers,
  IconLicense,
  IconMap
} from '@tabler/icons-react';
import '../styles/navegacion.css';

/**
 * Configuración de módulos disponibles en la sidebar.
 * Cada módulo tiene nombre, ruta e ícono.
 */
const modules = [
  { name: 'Inicio',          path: '/inicio',        icon: IconHome    },
  { name: 'Afiliados',       path: '/afiliados',      icon: IconUsers   },
  { name: 'Gestion Puestos', path: '/gestionPuestos', icon: IconLicense },
  { name: 'Mapa',            path: '/mapa',           icon: IconMap     },
];
const modulesBottom = [
  { name: 'Directorio', path: '/directorio', icon: IconBuildingCommunity },
];

// ============================================
// SUB-COMPONENTE: ÍTEM DE SIDEBAR
// ============================================

/**
 * Ítem individual de la sidebar con estilos activo/hover.
 *
 * @param {Object}   module       - Datos del módulo (name, icon)
 * @param {boolean}  isActive     - Si la ruta actual coincide
 * @param {boolean}  soloIconos   - Si solo se muestran íconos (tablet)
 * @param {Function} onMouseEnter - Handler hover entrada
 * @param {Function} onMouseLeave - Handler hover salida
 */
const SidebarItem = ({ module, isActive, soloIconos, onMouseEnter, onMouseLeave }) => {
  const bgColor    = isActive ? '#edbe3c' : 'transparent';
  const iconColor  = isActive ? '#0f0f0f' : '#edbe3c';
  const textColor  = isActive ? '#0f0f0f' : '#edbe3c';
  const fontWeight = isActive ? 600 : 500;

  return (
    <div
      style={{ backgroundColor: bgColor, cursor: 'pointer', transition: 'all 0.2s ease' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="sidebar-item-inner"
        style={{ justifyContent: soloIconos ? 'center' : 'flex-start' }}
      >
        <module.icon
          size={20}
          className="sidebar-icon"
          style={{ color: iconColor }}
        />
        {!soloIconos && (
          <span
            className="sidebar-label"
            style={{ color: textColor, fontWeight }}
          >
            {module.name}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: SIDEBAR
// ============================================

/**
 * Barra lateral de navegación fija.
 * - Fondo negro cubre toda la altura (100vh)
 * - Items con margen superior para bajarlos
 * - En tablet muestra solo íconos (60px), en desktop texto + ícono (200px)
 */
const Sidebar = () => {
  const isTablet = useMediaQuery({ minWidth: 641, maxWidth: 1024 });
  const sidebarWidth = isTablet ? 60 : 200;

  return (
    <div
      style={{
        width:           sidebarWidth,
        backgroundColor: '#0f0f0f',
        height:          '100vh',
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'space-between',
      }}
    >
      {/* ── Items principales (arriba) ── */}
      <Stack gap={0} style={{ marginTop: '0.3rem' }}>
        {modules.map((module) => (
          <NavLink
            key={module.path}
            to={module.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <SidebarItem
                module={module}
                isActive={isActive}
                soloIconos={isTablet}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#edbe3c';
                  const icon = e.currentTarget.querySelector('svg');
                  const text = e.currentTarget.querySelector('span');
                  if (icon) icon.style.color = '#0f0f0f';
                  if (text) text.style.color = '#0f0f0f';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    const icon = e.currentTarget.querySelector('svg');
                    const text = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#edbe3c';
                    if (text) text.style.color = '#edbe3c';
                  }
                }}
              />
            )}
          </NavLink>
        ))}
      </Stack>
 
      {/* ── Items inferiores (pegados al fondo) ── */}
      <Stack gap={0} style={{ marginBottom: '1rem' }}>
        {modulesBottom.map((module) => (
          <NavLink
            key={module.path}
            to={module.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <SidebarItem
                module={module}
                isActive={isActive}
                soloIconos={isTablet}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#edbe3c';
                  const icon = e.currentTarget.querySelector('svg');
                  const text = e.currentTarget.querySelector('span');
                  if (icon) icon.style.color = '#0f0f0f';
                  if (text) text.style.color = '#0f0f0f';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    const icon = e.currentTarget.querySelector('svg');
                    const text = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#edbe3c';
                    if (text) text.style.color = '#edbe3c';
                  }
                }}
              />
            )}
          </NavLink>
        ))}
      </Stack>
    </div>
  );
};

export default Sidebar;