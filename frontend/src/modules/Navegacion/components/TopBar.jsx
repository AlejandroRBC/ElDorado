import { Group, TextInput, Button, Paper, Text, Menu, Avatar } from '@mantine/core';
import { IconSearch, IconLogout, IconUser, IconSettings } from '@tabler/icons-react';
import { useState } from 'react';
import { useLogin } from '../../../context/LoginContext';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const [searchValue, setSearchValue] = useState('');
  const { user, logout } = useLogin();
  const navigate = useNavigate();

  const handleSearch = () => {
    console.log('Buscando:', searchValue);
    // Aquí iría la lógica de búsqueda
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirigir al login
  };

  const handleProfile = () => {
    console.log('Ver perfil');
    // Navegar a perfil del usuario
  };

  return (
    <Paper
      p="md"
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
      }}
    >
      <Group justify="space-between">
        {/* Lado izquierdo - Logo y búsqueda */}
        <Group gap="lg">
          {/* Logo */}
          <Text
            fw={700}
            size="xl"
            style={{
              color: '#0f0f0f',
              letterSpacing: '2px',
              fontFamily: 'sans-serif',
            }}
          >
            EL DORADO
          </Text>

          {/* Botón de búsqueda */}
          <Button
            onClick={handleSearch}
            variant="filled"
            color="#0f0f0f"
            style={{
              backgroundColor: '#0f0f0f',
              color: 'white',
              borderRadius: '4px',
              width: '40px',
              height: '40px',
              padding: 0,
            }}
          >
            <IconSearch size={20} />
          </Button>

          {/* Input de búsqueda */}
          <TextInput
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              width: '300px',
            }}
            styles={{
              input: {
                backgroundColor: '#0f0f0f',
                color: 'white',
                border: 'none',
                '&::placeholder': {
                  color: '#999',
                },
              },
            }}
          />
        </Group>

        {/* Lado derecho - Información del usuario y logout */}
        <Group gap="md">
          {user && (
            <>
              <Text size="sm" style={{ color: '#0f0f0f' }}>
                {user.usuario}
              </Text>
              
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Avatar 
                    size="md" 
                    radius="xl" 
                    color="black"
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: '#edbe3c',
                      color: '#0f0f0f',
                      fontWeight: 'bold'
                    }}
                  >
                    {user.usuario?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Usuario: {user.usuario}</Menu.Label>
                  <Menu.Label>Rol: {user.rol}</Menu.Label>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                  >
                    Configuración
                  </Menu.Item>
                  
                  <Menu.Divider />
                  
                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                    color="red"
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}
        </Group>
      </Group>
    </Paper>
  );
};

export default Topbar;