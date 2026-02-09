import { useState, useEffect, useMemo } from "react";
import { 
  TextInput, Select, Button, Table, 
  Group, Stack, Title, Badge, ActionIcon, 
  Menu, Paper, Loader, Alert, Text
} from '@mantine/core';
import { Badge as MantineBadge, Box } from '@mantine/core';
import { 
  IconSearch, IconPlus, IconFileExport, IconDotsVertical, 
  IconEye, IconHistory, IconArrowsExchange, IconX
} from '@tabler/icons-react';

import { ModalMostrarHistorial } from "./components/ModalMostrarHistorial";
import { ModalTraspaso } from "./components/ModalTraspaso";
import { useDisclosure } from "@mantine/hooks";
import { puestosService } from "./service/puestosService";

function GestionPatentesPuestosModule() {
  // Estados principales
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  
  // Estados de búsqueda y filtros
  const [search, setSearch] = useState('');
  const [filtroPatente, setFiltroPatente] = useState(null);
  const [filtroFila, setFiltroFila] = useState(null);
  const [filtroCuadra, setFiltroCuadra] = useState(null);
  
  // Estados para modales
  const [opened, {open, close}] = useDisclosure(false);
  const [historialOpened, { open: openHistorial, close: closeHistorial }] = useDisclosure(false);
  const [traspasoOpened, { open: openTraspaso, close: closeTraspaso }] = useDisclosure(false);
  
  // Estados para selección
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [puestoParaTraspaso, setPuestoParaTraspaso] = useState(null);

  // Función de filtrado
  const puestosFiltrados = useMemo(() => {
    return puestos.filter((puesto) => {
      const coincideBusqueda =
        search === '' ||
        String(puesto.nroPuesto || '').includes(search) ||
        (puesto.apoderado || '').toLowerCase().includes(search.toLowerCase()) ||
        (puesto.ci || '').includes(search);

      let coincidePatente = true;
      if (filtroPatente && filtroPatente !== 'Todo') {
        if (filtroPatente === 'si') {
          coincidePatente = Boolean(puesto.tiene_patente);
        } else {
          coincidePatente = !Boolean(puesto.tiene_patente);
        }
      }

      const coincideFila =
         !filtroFila || filtroFila === 'Todo' || 
         String(puesto.fila || '') === filtroFila;

      const coincideCuadra =
        !filtroCuadra || filtroCuadra === 'Todo' || 
        String(puesto.cuadra || '') === filtroCuadra;

      return coincideBusqueda && coincidePatente && coincideFila && coincideCuadra;
    });
  }, [puestos, search, filtroPatente, filtroFila, filtroCuadra]);

  const handleAbrirTraspaso = (puesto = null) => {
    setPuestoParaTraspaso(puesto);
    openTraspaso();
  };


  const handleEjecutarTraspaso = async ({ desde, para, puestos, motivoDetallado }) => {
    try {
      setLoading(true);
      // Usar el endpoint de traspaso múltiple
      const resultado = await puestosService.traspasoMultiple({
        desdeAfiliado: desde,
        paraAfiliado: para,
        puestos: puestos,
        motivo: motivoDetallado || 'Traspaso desde sistema'
      });

      if (resultado.success) {
        // Recargar lista de puestos
        await cargarPuestos();
        closeTraspaso();
      } else {
        setError("Error en traspaso: " + resultado.errores?.map(e => e.error).join(', '));
      }
    } catch (error) {
      console.error('Error en traspaso:', error);
      setError("Error al realizar traspaso");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPuestos();
  }, []);

  const cargarPuestos = async () => {
    try {
      setLoading(true); // ← AQUÍ ES DONDE SE USA setLoading
      setError(null);
      const data = await puestosService.listar();
      setPuestos(data);
    } catch (e) {
      console.error("Error al cargar puestos", e);
      setError("No se pudieron cargar los puestos");
    } finally {
      setLoading(false); // ← Y AQUÍ TAMBIÉN
    }
  };

  const limpiarFiltros = () => {
    setSearch('');
    setFiltroPatente(null);
    setFiltroFila(null);
    setFiltroCuadra(null);
  };

  // Si está cargando inicialmente, mostrar loader
  if (loading && puestos.length === 0) {
    return (
      <Stack align="center" justify="center" style={{ height: '50vh' }}>
        <Loader size="xl" />
        <Text>Cargando puestos...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" p="xl" style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      <ModalMostrarHistorial 
        opened={historialOpened} 
        close={closeHistorial} 
        puesto={puestoSeleccionado} 
      />
      
      <ModalTraspaso
        opened={traspasoOpened}
        close={closeTraspaso}
        puestoSeleccionado={puestoParaTraspaso}
        onTraspaso={handleEjecutarTraspaso}
      />
      
      {/* TÍTULO CON LÍNEA ESTILO HISTORIAL */}
      <Group align="center" gap="xs">
        <Title order={2} fw={800} style={{ letterSpacing: '1px' }}>GESTIÓN DE PUESTOS</Title>
        <Box style={{ borderBottom: '2px solid black', width: '150px', marginBottom: '8px' }} />
      </Group>

      {/* PANEL DE FILTROS */}
      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group grow>
            <TextInput 
              placeholder="Buscar por ID, Apoderado o CI..." 
              leftSection={<IconSearch size={18} />} 
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="sm"
              radius="md"
            />
            <Select 
              placeholder="Estado Patente"
              data={[
                { value: 'Todo', label: 'Todo'},
                { value: 'si', label: 'Con Patente' },
                { value: 'no', label: 'Sin Patente' }
              ]}
              value={filtroPatente}
              onChange={setFiltroPatente}
              radius="md"
            />
            <Select 
              placeholder="Fila"
              data={['Todo', 'A', 'B', 'C']}
              value={filtroFila}
              onChange={setFiltroFila}
              radius="md"
            />
            <Select 
              placeholder="Cuadra"
              data={['Todo', '1', '2', '3']}
              value={filtroCuadra}
              onChange={setFiltroCuadra}
              radius="md"
            />
          </Group>

          <Group justify="space-between">
            <Group>
              <Button 
                leftSection={<IconArrowsExchange size={18} />} 
                onClick={() => handleAbrirTraspaso()}
                variant="filled" 
                color="dark"
                radius="xl"
                style={{ backgroundColor: '#0f0f0f' }}
              >
                Realizar Traspaso
              </Button>
              <Button 
                leftSection={<IconFileExport size={18} />} 
                variant="filled" 
                radius="xl"
                style={{ backgroundColor: '#EDBE3C', color: 'black' }}
              >
                Generar Reporte General
              </Button>
            </Group>
            
            {/* BOTÓN LIMPIAR SI HAY FILTROS */}
            {(search || filtroPatente || filtroFila || filtroCuadra) && (
              <Button variant="subtle" color="gray" size="xs" onClick={limpiarFiltros} leftSection={<IconX size={14}/>}>
                Limpiar Filtros
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>

      {/* TABLA ESTILO HISTORIAL */}
      <Paper shadow="xs" radius="md" withBorder p="md">
        {loading ? (
          <Stack align="center" p="xl"><Loader color="yellow" /><Text size="sm">Actualizando datos...</Text></Stack>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table verticalSpacing="md" horizontalSpacing="sm" variant="unstyled">
              <Table.Thead> 
                <Table.Tr>
                  {[
                    'ID Puesto', 'Fila/Cuadra', 'Apoderado', 'C.I.', 
                    'Adquisición', 'Rubros', 'Estado Patente', 'Acciones'
                  ].map((header) => (
                    <Table.Th key={header}>
                      <MantineBadge 
                        variant="light" 
                        color="gray" 
                        size="lg" 
                        radius="sm" 
                        fullWidth 
                        style={{ backgroundColor: '#f1f3f5', color: '#495057', fontWeight: 700 }}
                      >
                        {header}
                      </MantineBadge>
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {puestosFiltrados.map((puesto) => (
                  <Table.Tr key={puesto.id_puesto || puesto.id} style={{ textAlign: 'center' }}>
                    <Table.Td><Text size="sm" fw={700}>{puesto.nroPuesto}</Text></Table.Td>
                    <Table.Td><Text size="sm">{`${puesto.fila} - ${puesto.cuadra}`}</Text></Table.Td>
                    <Table.Td>
                       <Text size="sm" fw={500}>{puesto.apoderado || 'VACANTE'}</Text>
                    </Table.Td>
                    <Table.Td><Text size="sm">{puesto.ci || '-'}</Text></Table.Td>
                    <Table.Td><Text size="sm">{puesto.fecha_adquisicion || '-'}</Text></Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed" style={{ maxWidth: '150px' }} truncate>{puesto.rubro || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      {puesto.tiene_patente ? (
                        <MantineBadge color="green" variant="dot" size="sm">CON PATENTE</MantineBadge>
                      ) : (
                        <MantineBadge color="yellow" variant="dot" size="sm">SIN PATENTE</MantineBadge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200} position="left-start">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" radius="xl">
                            <IconDotsVertical size={18} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Label>Gestión</Menu.Label>
                          <Menu.Item 
                            leftSection={<IconEye size={14} />}
                            onClick={() => { setPuestoSeleccionado(puesto); openHistorial(); }}
                          >
                            Ver Historial
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconArrowsExchange size={14} />} 
                            color="orange"
                            onClick={() => handleAbrirTraspaso(puesto)}
                          >
                            Hacer Traspaso
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<IconHistory size={14} />}>
                            Reporte Individual
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            {puestosFiltrados.length === 0 && (
              <Text ta="center" py="xl" c="dimmed">No se encontraron resultados para la búsqueda.</Text>
            )}
          </Box>
        )}
      </Paper>

      <Text size="xs" c="dimmed" ta="right">
        Registros totales: {puestos.length} | Filtrados: {puestosFiltrados.length}
      </Text>
    </Stack>
  );
}

export default GestionPatentesPuestosModule;