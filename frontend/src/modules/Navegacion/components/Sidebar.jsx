import { NavLink } from 'react-router-dom';
import { Stack, Text, Group } from '@mantine/core';
import { 
  IconHome,
  IconUsers,
  IconLicense,
  IconMap
} from '@tabler/icons-react';

// Configuración de módulos
const modules = [
  {
    name: 'Inicio',
    path: '/inicio',
    icon: IconHome,
    component: 'InicioModule',
  },
  {
    name: 'Afiliados',
    path: '/afiliados',
    icon: IconUsers,
    component: 'AfiliacionModule',
  },
  {
    name: 'Gestion Puestos',
    path: '/gestionPuestos',
    icon: IconLicense,
    component: 'GestionPatentesPuestosModule',
  },
  {
    name: 'Mapa',
    path: '/mapa',
    icon: IconMap,
    component: 'MapaModule',
  },
];

const SidebarItem = ({ module, isActive, onMouseEnter, onMouseLeave }) => {
  const backgroundColor = isActive ? '#edbe3c' : 'transparent';
  const iconColor = isActive ? '#0f0f0f' : '#edbe3c';
  const textColor = isActive ? '#0f0f0f' : '#edbe3c';

  return (
    <div
      style={{
        backgroundColor,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Group p="md">
        <module.icon
          size={24}
          style={{
            color: iconColor,
            transition: 'color 0.2s ease',
          }}
        />
        <Text
          style={{
            color: textColor,
            fontWeight: isActive ? 600 : 500,
            transition: 'color 0.2s ease',
          }}
        >
          {module.name}
        </Text>
      </Group>
    </div>
  );
};

const Sidebar = () => {
  return (
    <Stack
      gap={0}
      style={{
        backgroundColor: '#0f0f0f',
        width: '200px',
        position: 'fixed',
        left: 0,
        top: '20%',
        overflowY: 'auto',
      }}
    >
      {modules.map((module) => (
        <div key={module.path}>
          <NavLink
            to={module.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <SidebarItem 
                module={module} 
                isActive={isActive}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#edbe3c';
                  const icon = e.currentTarget.querySelector('svg');
                  const text = e.currentTarget.querySelector('p');
                  if (icon) icon.style.color = '#0f0f0f';
                  if (text) text.style.color = '#0f0f0f';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    const icon = e.currentTarget.querySelector('svg');
                    const text = e.currentTarget.querySelector('p');
                    if (icon) icon.style.color = '#edbe3c';
                    if (text) text.style.color = '#edbe3c';
                  }
                }}
              />
            )}
          </NavLink>
        </div>
      ))}
    </Stack>
  );
};

export default Sidebar;