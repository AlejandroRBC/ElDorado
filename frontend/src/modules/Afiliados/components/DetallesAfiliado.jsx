import { Paper, Container, Title, Text, Button, Group, Stack, Box, Badge } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconFileReport, IconEdit, IconPlus, IconTransfer } from '@tabler/icons-react';
import { mockAfiliados } from '../mockAfiliados';
import TablaPuestos from './TablaPuestos';

const DetallesAfiliado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Buscar afiliado por ID
  const afiliado = mockAfiliados.find(a => a.id === parseInt(id)) || mockAfiliados[0];

  return (
    <Container fluid p="md">
      {/* Header con botón de volver */}
      <Group justify="space-between" mb="xl">
        <Title order={1} style={{ color: '#0f0f0f' }}>
          Detalle Afiliado
        </Title>
        <Button
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate('/afiliados')}
          style={{
            backgroundColor: '#0f0f0f',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 500,
          }}
        >
          Volver a la lista
        </Button>
      </Group>

      <Paper 
        p="xl" 
        radius="lg" 
        style={{ 
          backgroundColor: 'white',
          minHeight: '70vh',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Botones de acción superiores */}
        <Group justify="flex-starts" mb="xl">
          <Group gap="md">
            <Button
              leftSection={<IconFileReport size={18} />}
              style={{
                backgroundColor: '#0f0f0f',
                color: 'white',
                borderRadius: '100px',
                fontWeight: 500,
                padding: '10px 20px',
              }}
            >
              Generar Reporte Total del Afiliado
            </Button>
            
            <Button
              leftSection={<IconEdit size={18} />}
              style={{
                backgroundColor: '#0f0f0f',
                color: 'white',
                borderRadius: '100px',
                fontWeight: 500,
                padding: '10px 20px',
              }}
            >
              Editar Perfil de Afiliado
            </Button>
          </Group>
        </Group>

        {/* Información del afiliado (estilo card sin botones) */}
        <Paper
          p="lg"
          mb="xl"
          
        >
          <Group align="flex-start" gap="lg">
            {/* Foto de perfil */}
            <Box
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: 'white',
                
                flexShrink: 0,
              }}
            >
              <img
                src="/assets/perfiles/sinPerfil.png"
                alt={`Perfil de ${afiliado.nombre}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div style="
                      width: 100%;
                      height: 100%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background: #f5f5f5;
                    ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#999">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  `;
                }}
              />
            </Box>

            {/* Información del afiliado */}
            <Stack gap={8} style={{ flex: 1 }}>
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Text fw={700} size="xl" style={{ color: '#0f0f0f' }}>
                    {afiliado.nombre}
                  </Text>
                  
                  <Text >
                    CI: {afiliado.ci}
                  </Text>
                </Box>
              
              </Group>

                
              {/* Puestos y rubro */}
              <Group gap="xl" mt="md">
                <Box>
                  <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginBottom: '6px' }}>
                    Puestos Actuales:
                  </Text>
                  <Group gap={6} wrap="wrap">
                    {afiliado.patentes.map((puesto, index) => (
                      <Badge
                        key={index}
                        size="sm"
                        style={{
                          backgroundColor: '#EDBE3C',
                          color: '#0f0f0f',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '4px',
                        }}
                      >
                        {puesto}
                      </Badge>
                    ))}
                  </Group>
                </Box>
                
                <Box>
                  <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginBottom: '2px' }}>
                    Rubro:
                  </Text>
                  <Text size="sm" style={{ color: '#666' }}>
                    {afiliado.rubro}
                  </Text>
                </Box>
              </Group>
              {/* Información adicional */}
              <Group gap="xl" mt="md">
                <Stack gap={4}>
                  <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>
                    Contacto:
                  </Text>
                  <Text size="sm" style={{ color: '#666' }}>
                    📞 {afiliado.telefono}
                  </Text>
                  <Text size="sm" style={{ color: '#666' }}>
                    ✉️ {afiliado.email}
                  </Text>
                </Stack>
                
                <Stack gap={4}>
                  <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>
                    Dirección:
                  </Text>
                  <Text size="sm" style={{ color: '#666' }}>
                    {afiliado.direccion}
                  </Text>
                </Stack>
                
                <Stack gap={4}>
                  <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>
                    Registro:
                  </Text>
                  <Text size="sm" style={{ color: '#666' }}>
                    {new Date(afiliado.fechaRegistro).toLocaleDateString('es-ES')}
                  </Text>
                </Stack>
              </Group>

            </Stack>
          </Group>
        </Paper>

        {/* Sección de Puestos del Afiliado */}
        <Box>
          <Group justify="space-between" align="center" mb="md">
            <Title order={2} style={{ color: '#0f0f0f', fontSize: '1.5rem' }}>
              Detalles de Puestos de Afiliado
            </Title>
            
            {/* Botones para puestos */}
            <Group gap="md">
              <Button
                leftSection={<IconPlus size={18} />}
                style={{
                  backgroundColor: '#0f0f0f',
                  color: 'white',
                  borderRadius: '100px',
                  fontWeight: 500,
                  border: '2px solid #0f0f0f',
                  padding: '8px 16px',
                }}
              >
                Añadir Puesto
              </Button>
              
              <Button
                leftSection={<IconTransfer size={18} />}
                style={{
                  backgroundColor: '#0f0f0f',
                  color: 'white',
                  borderRadius: '100px',
                  fontWeight: 500,
                  border: '2px solid #0f0f0f',
                  padding: '8px 16px',
                }}
              >
                Realizar Traspaso
              </Button>
            </Group>
          </Group>

          {/* Tabla de puestos */}
          <TablaPuestos puestos={afiliado.puestos} />
        </Box>
      </Paper>
    </Container>
  );
};

export default DetallesAfiliado;