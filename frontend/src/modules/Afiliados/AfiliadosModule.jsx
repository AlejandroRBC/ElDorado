import { Text, Paper, Container, TextInput, Button, Group, Stack, Title, Switch, LoadingOverlay, Alert, Select, Badge, Box, Affix, Transition } from '@mantine/core';
import ModuleHeader from '../Navegacion/components/ModuleHeader';
import { IconSearch, IconPlus, IconFileExport, IconLayoutGrid, IconTable, IconAlertCircle, IconX, IconArrowUp } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import ListaCards from './components/ListaCards';
import TablaAfiliados from './components/TablaAfiliados';
import { useAfiliados } from './hooks/useAfiliados';
import ModalAfiliado from './components/ModalAfiliado';
import { useDebouncedValue } from '@mantine/hooks';

const AfiliadosModule = () => {
  const [vistaTabla, setVistaTabla] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Estados locales para los selects
  const [selectPatente, setSelectPatente] = useState(null);
  const [selectOrden, setSelectOrden] = useState('alfabetico');
  const [selectPuestoCount, setSelectPuestoCount] = useState(null);
  const [selectRubro, setSelectRubro] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  
  // Debounce para búsqueda automática (300ms)
  const [debouncedSearch] = useDebouncedValue(searchValue, 100);
  
  // Usar nuestro hook personalizado
  const { 
    afiliados, 
    cargando, 
    error, 
    conexion,
    filtrosActivos,
    rubrosDisponibles,
    buscarPorTexto,
    ordenarPor,
    filtrarPorCantidadPuestos,
    filtrarPorPatente,
    filtrarPorRubro,
    limpiarFiltros,
    cargarAfiliados,
    cargarEstadisticas
  } = useAfiliados();

  // Cargar estadísticas al inicio
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // Sincronizar selects con filtros activos cuando cambian
  useEffect(() => {
    setSelectOrden(filtrosActivos.orden);
    setSelectPatente(filtrosActivos.conPatente);
    setSelectPuestoCount(filtrosActivos.puestoCount);
    setSelectRubro(filtrosActivos.rubro);
    setSearchValue(filtrosActivos.search);
  }, [filtrosActivos]);

  // BÚSQUEDA AUTOMÁTICA - Se ejecuta cuando cambia el valor debounced
  useEffect(() => {
    buscarPorTexto(debouncedSearch);
  }, [debouncedSearch]);

  // Manejadores de filtros
  const handleClearSearch = async () => {
    setSearchValue('');
    // La búsqueda se ejecutará automáticamente por el useEffect
  };

  const handleOrdenChange = async (value) => {
    setSelectOrden(value);
    await ordenarPor(value);
  };

  const handlePatenteChange = async (value) => {
    setSelectPatente(value);
    await filtrarPorPatente(value);
  };

  const handlePuestoCountChange = async (value) => {
    setSelectPuestoCount(value);
    await filtrarPorCantidadPuestos(value ? parseInt(value) : null);
  };

  const handleRubroChange = async (value) => {
    setSelectRubro(value);
    await filtrarPorRubro(value);
  };

  const handleLimpiarFiltros = async () => {
    setSelectPatente(null);
    setSelectOrden('alfabetico');
    setSelectPuestoCount(null);
    setSelectRubro(null);
    setSearchValue('');
    await limpiarFiltros();
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = () => {
    return (
      filtrosActivos.search !== '' ||
      filtrosActivos.conPatente !== null ||
      filtrosActivos.puestoCount !== null ||
      filtrosActivos.rubro !== null ||
      filtrosActivos.orden !== 'alfabetico'
    );
  };

  // Función para volver al inicio
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Opciones para selects
  const opcionesPatente = [
    { value: 'true', label: 'Con Patente' },
    { value: 'false', label: 'Sin Patente' }
  ];

  const opcionesOrden = [
    { value: 'alfabetico', label: 'Orden Alfabético' },
    { value: 'registro', label: 'Fecha de Registro' }
  ];

  const opcionesPuestoCount = [
    { value: '1', label: '1 puesto' },
    { value: '2', label: '2 puestos' },
    { value: '3', label: '3 puestos' },
    { value: '4', label: '4 puestos' },
    { value: '5', label: '5 o más puestos' }
  ];

  // Preparar opciones de rubros
  const opcionesRubros = [
    ...rubrosDisponibles.map(rubro => ({ 
      value: rubro, 
      label: ` ${rubro}` 
    }))
  ];

  return (
    <Container fluid p="md">
      <ModuleHeader title="Afiliados" />
      
      {/* Estado de conexión */}
      {conexion?.error && (
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
      )}
      
      {/* Modal para añadir afiliado */}
      <ModalAfiliado 
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onAfiliadoCreado={() => cargarAfiliados()}
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
        <LoadingOverlay visible={cargando} zIndex={1000} overlayProps={{ blur: 2 }} />
        
        {error && !cargando && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {error}
            <Button variant="subtle" size="xs" onClick={() => cargarAfiliados()} style={{ marginLeft: '10px' }}>
              Reintentar
            </Button>
          </Alert>
        )}

        {/* === PANEL DE FILTROS - UNA SOLA FILA (SIN BOTÓN BUSCAR) === */}
        <Group gap="md" wrap="wrap" align="flex-end" mb="xl">
          {/* Buscador - AHORA SIN BOTÓN */}
          <Box style={{ flex: 2, minWidth: '250px' }}>
            <Text size="sm" fw={600} mb={4}>Buscar</Text>
            <TextInput
              placeholder="Nombre, CI, rubro, puesto... (búsqueda automática)"
              leftSection={<IconSearch size={18} />}
              size="md"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              rightSection={
                searchValue && (
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={handleClearSearch}
                    style={{ padding: 0, minWidth: 'auto' }}
                  >
                    <IconX size={16} />
                  </Button>
                )
              }
              styles={{
                input: {
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  borderRadius: '8px',
                  height: '45px',
                  '&:focus': { borderColor: '#0f0f0f' },
                  '&::placeholder': {
                    color: '#999',
                    fontSize: '14px'
                  }
                }
              }}
            />
          </Box>

          {/* Select - Estado de Patente */}
          <Box style={{ flex: 1, minWidth: '160px' }}>
            <Text size="sm" fw={600} mb={4}>Patente</Text>
            <Select
              placeholder="Filtrar por patente"
              data={opcionesPatente}
              value={selectPatente}
              onChange={handlePatenteChange}
              clearable
              size="md"
              styles={{
                input: {
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  borderRadius: '8px',
                  height: '45px'
                }
              }}
            />
          </Box>

          {/* Select - Ordenar por */}
          <Box style={{ flex: 1, minWidth: '160px' }}>
            <Text size="sm" fw={600} mb={4}>Ordenar</Text>
            <Select
              placeholder="Ordenar por..."
              data={opcionesOrden}
              value={selectOrden}
              onChange={handleOrdenChange}
              size="md"
              styles={{
                input: {
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  borderRadius: '8px',
                  height: '45px'
                }
              }}
            />
          </Box>

          {/* Select - Cantidad de Puestos */}
          <Box style={{ flex: 1, minWidth: '160px' }}>
            <Text size="sm" fw={600} mb={4}># Puestos</Text>
            <Select
              placeholder="Cantidad de puestos"
              data={opcionesPuestoCount}
              value={selectPuestoCount}
              onChange={handlePuestoCountChange}
              clearable
              size="md"
              styles={{
                input: {
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  borderRadius: '8px',
                  height: '45px'
                }
              }}
            />
          </Box>

          {/* Select - Rubro */}
          <Box style={{ flex: 1, minWidth: '160px' }}>
            <Text size="sm" fw={600} mb={4}>Rubro</Text>
            <Select
              placeholder="Filtrar por rubro"
              data={opcionesRubros}
              value={selectRubro}
              onChange={handleRubroChange}
              clearable
              searchable
              size="md"
              styles={{
                input: {
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  borderRadius: '8px',
                  height: '45px'
                }
              }}
            />
          </Box>
        </Group>

        {/* Indicador de búsqueda automática */}
        {searchValue && (
          <Text size="xs" style={{ color: '#666', marginTop: '-10px', marginBottom: '10px' }}>
            Buscando: "{searchValue}" {cargando ? '(buscando...)' : ''}
          </Text>
        )}

        {/* Filtros activos (si hay) */}
        {hayFiltrosActivos() && (
          <Group mb="lg" gap="xs" align="center">
            <Text size="sm" fw={600} style={{ color: '#666' }}>
              Filtros activos:
            </Text>
            {filtrosActivos.search && (
              <Badge size="sm" variant="outline" rightSection={<IconX size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchValue('')} />}>
                Búsqueda: {filtrosActivos.search}
              </Badge>
            )}
            {filtrosActivos.conPatente !== null && (
              <Badge size="sm" variant="outline" rightSection={<IconX size={12} style={{ cursor: 'pointer' }} onClick={() => filtrarPorPatente(null)} />}>
                {filtrosActivos.conPatente === 'true' ? 'Con patente' : 'Sin patente'}
              </Badge>
            )}
            {filtrosActivos.puestoCount && (
              <Badge size="sm" variant="outline" rightSection={<IconX size={12} style={{ cursor: 'pointer' }} onClick={() => filtrarPorCantidadPuestos(null)} />}>
                {filtrosActivos.puestoCount === '5' ? '5+ puestos' : `${filtrosActivos.puestoCount} puesto${filtrosActivos.puestoCount !== '1' ? 's' : ''}`}
              </Badge>
            )}
            {filtrosActivos.rubro && (
              <Badge size="sm" variant="outline" rightSection={<IconX size={12} style={{ cursor: 'pointer' }} onClick={() => filtrarPorRubro(null)} />}>
                Rubro: {filtrosActivos.rubro}
              </Badge>
            )}
            {filtrosActivos.orden !== 'alfabetico' && (
              <Badge size="sm" variant="outline" rightSection={<IconX size={12} style={{ cursor: 'pointer' }} onClick={() => ordenarPor('alfabetico')} />}>
                Orden: {filtrosActivos.orden === 'registro' ? 'Fecha registro' : 'Alfabético'}
              </Badge>
            )}
          </Group>
        )}

        {/* Botones de acción */}
        <Group justify="space-between" align="center" mb="xl">
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
              onClick={() => setModalAbierto(true)}
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

            {hayFiltrosActivos() && (
              <Button
                leftSection={<IconX size={16} />}
                variant="subtle"
                color="gray"
                onClick={handleLimpiarFiltros}
                size="md"
                style={{ height: '40px' }}
              >
                Limpiar filtros
              </Button>
            )}
          </Group>

          {/* Toggle Switch para cambiar vista */}
          <Group gap="md" align="center">
            <Group gap="xs" align="center">
              <IconLayoutGrid size={18} style={{ color: !vistaTabla ? '#0f0f0f' : '#999' }} />
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
                  }
                }}
              />
              <IconTable size={18} style={{ color: vistaTabla ? '#0f0f0f' : '#999' }} />
            </Group>
            
            <Group gap="xs">
              <Text size="sm" style={{ color: !vistaTabla ? '#0f0f0f' : '#999', fontWeight: !vistaTabla ? 600 : 400 }}>
                Cards
              </Text>
              <Text size="sm" style={{ color: '#999' }}>/</Text>
              <Text size="sm" style={{ color: vistaTabla ? '#0f0f0f' : '#999', fontWeight: vistaTabla ? 600 : 400 }}>
                Tabla
              </Text>
            </Group>
          </Group>
        </Group>

        {/* Renderizar la vista seleccionada */}
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
              {hayFiltrosActivos() 
                ? 'No hay resultados para los filtros aplicados' 
                : 'No hay afiliados registrados'}
            </Text>
            {hayFiltrosActivos() && (
              <Button variant="subtle" onClick={handleLimpiarFiltros} style={{ color: '#0f0f0f' }}>
                Limpiar todos los filtros
              </Button>
            )}
          </Stack>
        )}

        {/* Contador de resultados */}
        {!cargando && !error && afiliados.length > 0 && (
          <Text size="sm" style={{ color: '#666', marginTop: '20px', textAlign: 'center' }}>
            Mostrando {afiliados.length} afiliado{afiliados.length !== 1 ? 's' : ''}
            {hayFiltrosActivos() ? ' (filtrados)' : ''}
          </Text>
        )}
      </Paper>

      {/* Botón flotante para volver al inicio */}
      <Affix position={{ bottom: 30, right: 30 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button
              leftSection={<IconArrowUp size={18} />}
              style={{
                ...transitionStyles,
                backgroundColor: '#0f0f0f',
                color: 'white',
                borderRadius: '50px',
                height: '50px',
                padding: '0 25px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                border: '2px solid #edbe3c',
                fontWeight: 600
              }}
              onClick={scrollToTop}
            >
              Volver arriba
            </Button>
          )}
        </Transition>
      </Affix>
    </Container>
  );
};

export default AfiliadosModule;