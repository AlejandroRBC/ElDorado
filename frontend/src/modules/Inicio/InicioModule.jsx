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
      title: 'Puestos',
      description: 'Control de patentes y puestos',
      icon: IconLicense,
      path: '/gestionPuestos',
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
          maxWidth: '900px',
          textAlign: 'right',
          marginTop: '90px',
        }}>
          <Text
            size="1.8rem"
            fw={700}
            style={{
              color: '#0f0f0f',
              fontStyle: 'italic',
              lineHeight: 1.3,
            }}
          >
            "Trabajando juntos por un mejor mañana para todos los <br />
            miembros de nuestra comunidad"
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

      
    </Container>
  );
};

export default InicioModule;