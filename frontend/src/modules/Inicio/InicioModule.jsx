import { Paper, Title, Text, Button, Group, Stack, Container, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconUsers, IconLicense, IconArrowRight } from '@tabler/icons-react';
import { useState } from 'react';

const InicioModule = () => {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);

  const modulesData = [
    {
      id: 1,
      title: 'Afiliados',
      description: 'Gestión completa de afiliados',
      icon: IconUsers,
      path: '/afiliados',
    },
    {
      id: 2,
      title: 'Patentes',
      description: 'Control de patentes y puestos',
      icon: IconLicense,
      path: '/patentes',
    },
  ];

  return (
    <Container fluid p="md">
      {/* Encabezado del módulo */}
      <Group justify="space-between" mb="xl">
        <Title order={1} style={{ color: '#0f0f0f', fontSize: '2rem' }}>
          Panel Principal
        </Title>
      </Group>

      {/* Contenido principal - Todo en una columna alineado a la derecha */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{ 
          backgroundColor: 'white',
          minHeight: '400px',
          border: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {/* Frase inspiradora alineada a la derecha */}
        <Box style={{ 
          maxWidth: '600px',
          textAlign: 'right',
          marginBottom: '40px',
        }}>
          <Text
            size="2.5rem"
            fw={700}
            style={{
              color: '#0f0f0f',
              fontStyle: 'italic',
              lineHeight: 1.3,
            }}
          >
            "Donde cada conexión<br />
            construye un futuro<br />
            más próspero"
          </Text>
        </Box>

        {/* Botones en la misma fila, alineados a la derecha */}
        <Group 
          gap="md" 
          style={{ 
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          {modulesData.map((module) => {
            const isHovered = hoveredButton === module.id;
            
            return (
              <Button
                key={module.id}
                leftSection={<module.icon size={22} />}
                rightSection={<IconArrowRight size={20} />}
                size="lg"
                onClick={() => navigate(module.path)}
                onMouseEnter={() => setHoveredButton(module.id)}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  backgroundColor: isHovered ? '#0f0f0f' : '#edbe3c',
                  color: isHovered ? 'white' : '#0f0f0f',
                  justifyContent: 'space-between',
                  borderRadius: '100px',
                  height: '65px',
                  minWidth: '200px',
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 4px 15px rgba(15, 15, 15, 0.2)' : 'none',
                }}
              >
                <Text fw={600} size="lg">{module.title}</Text>
              </Button>
            );
          })}
        </Group>
      </Paper>

      {/* Estadísticas - Mantengo el Grid import */}
      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '30px' }}>
        <Paper p="lg" radius="md" style={{ backgroundColor: 'white', border: '1px solid #eee' }}>
          <Stack gap="xs" align="center">
            <div style={{ 
              width: '50px', 
              height: '50px', 
              backgroundColor: 'rgba(237, 190, 60, 0.1)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconUsers size={24} color="#edbe3c" />
            </div>
            <Title order={2} style={{ color: '#0f0f0f' }}>24</Title>
            <Text size="sm" style={{ color: '#666' }}>Afiliados Activos</Text>
          </Stack>
        </Paper>
        
        <Paper p="lg" radius="md" style={{ backgroundColor: 'white', border: '1px solid #eee' }}>
          <Stack gap="xs" align="center">
            <div style={{ 
              width: '50px', 
              height: '50px', 
              backgroundColor: 'rgba(108, 154, 255, 0.1)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconLicense size={24} color="#374567" />
            </div>
            <Title order={2} style={{ color: '#0f0f0f' }}>42</Title>
            <Text size="sm" style={{ color: '#666' }}>Puestos Registrados</Text>
          </Stack>
        </Paper>
        
        <Paper p="lg" radius="md" style={{ backgroundColor: 'white', border: '1px solid #eee' }}>
          <Stack gap="xs" align="center">
            <div style={{ 
              width: '50px', 
              height: '50px', 
              backgroundColor: 'rgba(76, 175, 80, 0.1)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text fw={700} size="xl" style={{ color: '#4CAF50' }}>✓</Text>
            </div>
            <Title order={2} style={{ color: '#0f0f0f' }}>95%</Title>
            <Text size="sm" style={{ color: '#666' }}>Satisfacción</Text>
          </Stack>
        </Paper>
        
        <Paper p="lg" radius="md" style={{ backgroundColor: 'white', border: '1px solid #eee' }}>
          <Stack gap="xs" align="center">
            <div style={{ 
              width: '50px', 
              height: '50px', 
              backgroundColor: 'rgba(255, 152, 0, 0.1)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text fw={700} size="xl" style={{ color: '#FF9800' }}>↻</Text>
            </div>
            <Title order={2} style={{ color: '#0f0f0f' }}>7</Title>
            <Text size="sm" style={{ color: '#666' }}>Traspasos Este Mes</Text>
          </Stack>
        </Paper>
      </div>
    </Container>
  );
};

export default InicioModule;