import { Text, Paper, Container, TextInput, Button, Group, Stack, Title, Switch } from '@mantine/core';
import ModuleHeader from '../Navegacion/components/ModuleHeader';
import { IconSearch, IconPlus, IconFileExport, IconLayoutGrid, IconTable } from '@tabler/icons-react';
import { useState } from 'react';
import ListaCards from './components/ListaCards';
import TablaAfiliados from './components/TablaAfiliados';

const AfiliadosModule = () => {
  const [vistaTabla, setVistaTabla] = useState(false); // false = cards, true = tabla

  return (
    <Container fluid p="md">
      {/* Encabezado del módulo */}
      <ModuleHeader title="Afiliados" />
      
      <Paper 
        p="xl" 
        radius="lg" 
        style={{ 
          backgroundColor: 'white',
          minHeight: '70vh',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Primera fila - Buscador y filtros */}
        <Stack gap="xl" mb="xl">
          {/* Fila 1: Buscador y filtros */}
          <Group gap="md" wrap="nowrap">
            <TextInput
              placeholder="Busca por nombre/ci/rubro/patente"
              leftSection={<IconSearch size={18} />}
              size="md"
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  borderRadius: '0',
                  height: '45px',
                  fontSize: '15px',
                  '&:focus': {
                    borderColor: '#0f0f0f',
                  },
                },
              }}
            />
            
            <Group gap="xs" style={{ flexShrink: 0 }}>
              <Button
                size="md"
                variant="outline"
                style={{
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  color: '#0f0f0f',
                  borderRadius: '0',
                  height: '45px',
                  fontWeight: 400,
                  minWidth: '120px',
                }}
              >
                Mostrar Todos
              </Button>
              
              <Button
                size="md"
                variant="outline"
                style={{
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  color: '#0f0f0f',
                  borderRadius: '0',
                  height: '45px',
                  fontWeight: 400,
                  minWidth: '120px',
                }}
              >
                Orden Alfabético
              </Button>
              
              <Button
                size="md"
                variant="outline"
                style={{
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  color: '#0f0f0f',
                  borderRadius: '0',
                  height: '45px',
                  fontWeight: 400,
                  minWidth: '120px',
                }}
              >
                +3 Patentes
              </Button>
              
              <Button
                size="md"
                variant="outline"
                style={{
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  color: '#0f0f0f',
                  borderRadius: '0',
                  height: '45px',
                  fontWeight: 400,
                  minWidth: '120px',
                }}
              >
                Todos Los rubros
              </Button>
            </Group>
          </Group>

          {/* Fila 2: Botones de acción y toggle switch de vista */}
          <Group justify="space-between">

            {/* Botones de acción */}
            <Group gap="md">
              <Button
                leftSection={<IconPlus size={18} />}
                size="md"
                style={{
                  backgroundColor: '#0f0f0f',
                  color: 'white',
                  borderRadius: '100px',
                  height: '40px',
                  fontWeight: 300,
                  padding: '0 25px',
                }}
              >
                Añadir Afiliado
              </Button>
              
              <Button
                leftSection={<IconFileExport size={18} />}
                size="md"
                style={{
                  backgroundColor: '#0f0f0f',
                  color: 'white',
                  borderRadius: '100px',
                  height: '40px',
                  fontWeight: 300,
                  padding: '0 25px',
                }}
              >
                Exportar lista actual
              </Button>
            </Group>

            {/* Toggle Switch para cambiar vista */}
            <Group gap="md" align="center">
              <Text size="sm" style={{ color: '#666', fontWeight: 500 }}>
                Vista:
              </Text>
              
              <Group gap="xs" align="center">
                <IconLayoutGrid 
                  size={18} 
                  style={{ 
                    color: !vistaTabla ? '#0f0f0f' : '#999',
                  }} 
                />
                
                <Switch
                  checked={vistaTabla}
                  onChange={(event) => setVistaTabla(event.currentTarget.checked)}
                  size="lg"
                  styles={{
                    track: {
                      backgroundColor: vistaTabla ? '#0f0f0f' : '#e0e0e0',
                      borderColor: vistaTabla ? '#0f0f0f' : '#e0e0e0',
                      width: '50px',
                      height: '26px',
                    },
                    thumb: {
                      backgroundColor: 'white',
                      borderColor: '#0f0f0f',
                      width: '22px',
                      height: '22px',
                    },
                  }}
                />
                
                <IconTable 
                  size={18} 
                  style={{ 
                    color: vistaTabla ? '#0f0f0f' : '#999',
                  }} 
                />
              </Group>
              
              {/* Labels de texto */}
              <Group gap="xs">
                <Text 
                  size="sm" 
                  style={{ 
                    color: !vistaTabla ? '#0f0f0f' : '#999',
                    fontWeight: !vistaTabla ? 600 : 400,
                  }}
                >
                  Cards
                </Text>
                <Text size="sm" style={{ color: '#999' }}>/</Text>
                <Text 
                  size="sm" 
                  style={{ 
                    color: vistaTabla ? '#0f0f0f' : '#999',
                    fontWeight: vistaTabla ? 600 : 400,
                  }}
                >
                  Tabla
                </Text>
              </Group>
            </Group>
          </Group>
        </Stack>

        {/* Renderizar la vista seleccionada */}
        {!vistaTabla ? <ListaCards /> : <TablaAfiliados />}
      </Paper>
    </Container>
  );
};

export default AfiliadosModule;