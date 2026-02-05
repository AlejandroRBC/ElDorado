import { Paper, Title, Text, Button, Group, Stack, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconUsers, IconLicense } from '@tabler/icons-react';
import ModuleHeader from '../Navegacion/components/ModuleHeader';

const InicioModule = () => {
  const navigate = useNavigate();

  return (

      <Container fluid p="md">
      {/* Encabezado del módulo */}
      <Group justify="space-between" mb="xl">
        <ModuleHeader title="Inicio" />
      </Group>

      {/* Contenido principal */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{ 
          backgroundColor: 'white',
          minHeight: '70vh',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Frase inspiradora */}
        <Stack align="flex-end" mb={50}>
          <Text
            size="2.5rem"
            fw={700}
            ta="right"
            style={{
              color: '#edbe3c',
              fontStyle: 'italic',
              maxWidth: '600px',
              lineHeight: 1.2,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            "Unidos por la excelencia,<br />construyendo el futuro del<br />comercio y la innovación"
          </Text>
            {/* Botones de navegación */}
            <Stack gap="lg" align="flex-end" style={{ maxWidth: '500px' }}>
                <Text size="xl" fw={600} style={{ color: '#0f0f0f' }} >
                    Accesos rápidos
                </Text>
                
                <Group gap="md" >
                    <Button
                        leftSection={<IconUsers size={24} color={"white"}/>}
                        size="lg"
                        onClick={() => navigate('/afiliados')}
                        style={{
                            backgroundColor: '#0f0f0f',
                            color: 'white',
                            borderRadius: '10px'
                        }}
                    >
                        Lista de Afiliados
                    </Button>

                    <Button
                        leftSection={<IconLicense size={24} color={"white"}/>}
                        size="lg"
                        onClick={() => navigate('/patentes')}
                        style={{
                            backgroundColor: '#0f0f0f',
                            color: 'white',
                            borderRadius: '10px',
                            
                        }}
                    >
                    Gestión de Patentes
                    </Button>
                </Group>
            </Stack>
        </Stack>

      </Paper>
    </Container>
  );
};

export default InicioModule;