import { Text, Paper, Container, TextInput, Button, Group, Stack, Title, Switch, LoadingOverlay, Alert } from '@mantine/core';
import ModuleHeader from '../Navegacion/components/ModuleHeader';
import { IconSearch, IconPlus, IconFileExport, IconLayoutGrid, IconTable, IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import ListaCards from './components/ListaCards';
import TablaAfiliados from './components/TablaAfiliados';
import { useAfiliados } from './hooks/useAfiliados';
import ModalAfiliado from './components/ModalAfiliado'; // Importar el modal

const AfiliadosModule = () => {
  const [vistaTabla, setVistaTabla] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false); // Estado para el modal
  
  // Usar nuestro hook personalizado para datos reales
  const { 
    afiliados, 
    cargando, 
    error, 
    conexion,
    buscarAfiliados,
    cargarAfiliados,
    crearAfiliado // Agregar esta función del hook
  } = useAfiliados();

  // Manejar búsqueda
  const handleSearch = async () => {
    if (searchValue.trim()) {
      await buscarAfiliados(searchValue);
    } else {
      await cargarAfiliados();
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = async () => {
    setSearchValue('');
    await cargarAfiliados();
  };

  // Abrir modal para añadir afiliado
  const abrirModalAfiliado = () => {
    setModalAbierto(true);
  };

  // Manejar envío del formulario del modal
  const handleCrearAfiliado = async (afiliadoData) => {
    try {
      const resultado = await crearAfiliado(afiliadoData);
      
      if (resultado.exito) {
        alert('Afiliado creado exitosamente');
        await cargarAfiliados(); // Recargar la lista
      } else {
        alert(`Error: ${resultado.error}`);
      }
    } catch (error) {
      console.error('Error al crear afiliado:', error);
      alert('Error al crear afiliado');
    }
  };

  // Mostrar estado de conexión
  const renderConexionStatus = () => {
    if (!conexion) return null;
    
    if (conexion.error) {
      return (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Modo sin conexión" 
          color="yellow" 
          mb="md"
        >
          Usando datos locales. Para datos reales, inicia el servidor backend.
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Ejecuta: <code>cd backend && npm start</code>
          </div>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <Container fluid p="md">
      {/* Encabezado del módulo */}
      <ModuleHeader title="Afiliados" />
      
      {/* Estado de conexión */}
      {renderConexionStatus()}
      
      {/* Modal para añadir afiliado */}
      <ModalAfiliado 
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSubmit={handleCrearAfiliado}
      />
      
      <Paper 
        p="xl" 
        radius="lg" 
        style={{ 
          backgroundColor: 'white',
          minHeight: '70vh',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        <LoadingOverlay 
          visible={cargando} 
          zIndex={1000}
          overlayProps={{ blur: 2 }}
        />
        
        {/* Mostrar error si existe */}
        {error && !cargando && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error" 
            color="red" 
            mb="md"
          >
            {error}
            <Button 
              variant="subtle" 
              size="xs" 
              onClick={cargarAfiliados}
              style={{ marginLeft: '10px' }}
            >
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Primera fila - Buscador y filtros */}
        <Stack gap="xl" mb="xl">
          {/* Fila 1: Buscador y filtros */}
          <Group gap="md" wrap="nowrap">
            <TextInput
              placeholder="Busca por nombre/ci/rubro/patente"
              leftSection={<IconSearch size={18} />}
              size="md"
              style={{ flex: 1 }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              rightSection={
                searchValue && (
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={handleClearSearch}
                    style={{ padding: 0, minWidth: 'auto' }}
                  >
                    ×
                  </Button>
                )
              }
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
                onClick={handleSearch}
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
                Buscar
              </Button>
              
              <Button
                size="md"
                variant="outline"
                onClick={() => cargarAfiliados()}
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
                onClick={() => alert('Funcionalidad en desarrollo')}
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
                onClick={() => alert('Funcionalidad en desarrollo')}
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
                onClick={abrirModalAfiliado} // Cambiado para abrir el modal
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
                onClick={() => alert('Funcionalidad en desarrollo')}
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

        {/* Renderizar la vista seleccionada con datos reales */}
        {!cargando && !error && (
          vistaTabla ? (
            <TablaAfiliados afiliados={afiliados} />
          ) : (
            <ListaCards afiliados={afiliados} />
          )
        )}

        {/* Mensaje cuando no hay resultados */}
        {!cargando && !error && afiliados.length === 0 && (
          <Stack align="center" justify="center" style={{ height: '200px' }}>
            <IconSearch size={48} style={{ color: '#ccc' }} />
            <Title order={4} style={{ color: '#999' }}>
              No se encontraron afiliados
            </Title>
            <Text style={{ color: '#999' }}>
              {searchValue ? `No hay resultados para "${searchValue}"` : 'No hay afiliados registrados'}
            </Text>
            {searchValue && (
              <Button 
                variant="subtle" 
                onClick={handleClearSearch}
                style={{ color: '#0f0f0f' }}
              >
                Limpiar búsqueda
              </Button>
            )}
          </Stack>
        )}

        {/* Contador de resultados */}
        {!cargando && !error && afiliados.length > 0 && (
          <Text size="sm" style={{ color: '#666', marginTop: '20px', textAlign: 'center' }}>
            Mostrando {afiliados.length} afiliado{afiliados.length !== 1 ? 's' : ''}
          </Text>
        )}
      </Paper>
    </Container>
  );
};

export default AfiliadosModule;