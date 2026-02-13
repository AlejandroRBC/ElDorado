import { Paper, Modal, Box, Group, Stack, Text, Button, Select, TextInput, Checkbox, LoadingOverlay, Badge, Table, ScrollArea, Pagination, CloseButton, Alert } from '@mantine/core';
import { IconSearch, IconX, IconAlertCircle, IconCheck, IconMapPin } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useAsignarPuesto } from '../hooks/useAsignarPuesto';

const ModalAsignarPuesto = ({ opened, onClose, idAfiliado, onPuestoAsignado }) => {
  const { 
    puestosDisponibles, 
    puestosCargando, 
    loading, 
    cargarPuestosDisponibles, 
    asignarPuesto 
  } = useAsignarPuesto(idAfiliado);

  // Estados del formulario
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [rubro, setRubro] = useState('');
  const [tienePatente, setTienePatente] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  
  const itemsPorPagina = 15;

  // Cargar puestos al abrir el modal
  useEffect(() => {
    if (opened) {
      cargarPuestosDisponibles();
      // Resetear estado
      setPuestoSeleccionado(null);
      setRubro('');
      setTienePatente(false);
      setBusqueda('');
      setError('');
      setPaginaActual(1);
    }
  }, [opened]);

  // Filtrar puestos por búsqueda
  const puestosFiltrados = puestosDisponibles.filter(puesto => {
    if (!busqueda) return true;
    
    const searchTerm = busqueda.toLowerCase();
    return (
      puesto.nroPuesto.toString().includes(searchTerm) ||
      puesto.fila.toLowerCase().includes(searchTerm) ||
      puesto.cuadra.toLowerCase().includes(searchTerm) ||
      `${puesto.nroPuesto}-${puesto.fila}-${puesto.cuadra}`.toLowerCase().includes(searchTerm)
    );
  });

  // Paginación
  const totalPaginas = Math.ceil(puestosFiltrados.length / itemsPorPagina);
  const puestosPaginados = puestosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const handleSeleccionarPuesto = (puesto) => {
    setPuestoSeleccionado(puesto);
    setRubro(puesto.rubro || '');
    setTienePatente(puesto.tiene_patente === 1 || puesto.tiene_patente === true);
  };

  const handleAsignar = async () => {
    if (!puestoSeleccionado) {
      setError('Debe seleccionar un puesto');
      return;
    }

    setError('');
    
    const resultado = await asignarPuesto({
      id_puesto: puestoSeleccionado.id_puesto,
      fila: puestoSeleccionado.fila,
      cuadra: puestoSeleccionado.cuadra,
      nroPuesto: puestoSeleccionado.nroPuesto,
      rubro: rubro,
      tiene_patente: tienePatente
    });

    if (resultado.exito) {
      setTimeout(() => {
        onClose();
        if (onPuestoAsignado) onPuestoAsignado();
      }, 1000);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="90%"
      title={
        <Group align="center" gap="xs">
          <IconMapPin size={24} color="#edbe3c" />
          <Text fw={700} size="xl">Asignar Puesto a Afiliado</Text>
        </Group>
      }
      centered
      styles={{
        header: {
          padding: '20px 25px',
          borderBottom: '2px solid #edbe3c',
        },
        body: {
          padding: '0'
        }
      }}
    >
      <Box style={{ position: 'relative', minHeight: '600px' }}>
        <LoadingOverlay visible={puestosCargando || loading} overlayProps={{ blur: 2 }} />

        <Group align="flex-start" gap={0} style={{ minHeight: '600px' }}>
          
          {/* ===== LADO IZQUIERDO - LISTA DE PUESTOS ===== */}
          <Box style={{ flex: 1.5, borderRight: '1px solid #eee', padding: '20px' }}>
            <Stack gap="md">
              {/* Buscador */}
              <TextInput
                placeholder="Buscar por número, fila o cuadra..."
                leftSection={<IconSearch size={16} />}
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                rightSection={busqueda && <CloseButton onClick={() => setBusqueda('')} />}
                size="md"
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    borderRadius: '8px',
                  }
                }}
              />

              {/* Contador de resultados */}
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Puestos Disponibles: {puestosFiltrados.length}
                </Text>
                {puestoSeleccionado && (
                  <Badge color="green" variant="filled">
                    1 seleccionado
                  </Badge>
                )}
              </Group>

              {/* Tabla de puestos */}
              <ScrollArea style={{ height: '450px' }} offsetScrollbars>
                <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead style={{ backgroundColor: '#f1f3f5', position: 'sticky', top: 0, zIndex: 10 }}>
                    <Table.Tr>
                      <Table.Th style={{ width: '40px' }}></Table.Th>
                      <Table.Th>N° Puesto</Table.Th>
                      <Table.Th>Fila</Table.Th>
                      <Table.Th>Cuadra</Table.Th>
                      <Table.Th>Estado</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {puestosPaginados.length > 0 ? (
                      puestosPaginados.map((puesto) => {
                        const isSelected = puestoSeleccionado?.id_puesto === puesto.id_puesto;
                        const codigoPuesto = `${puesto.nroPuesto}-${puesto.fila}-${puesto.cuadra}`;
                        
                        return (
                          <Table.Tr
                            key={puesto.id_puesto}
                            style={{
                              backgroundColor: isSelected ? '#fff3bf' : undefined,
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: isSelected ? '#fff3bf' : '#f8f9fa'
                              }
                            }}
                            onClick={() => handleSeleccionarPuesto(puesto)}
                          >
                            <Table.Td>
                              {isSelected && <IconCheck size={18} color="#0f0f0f" />}
                            </Table.Td>
                            <Table.Td>
                              <Text fw={isSelected ? 700 : 400}>
                                {puesto.nroPuesto}
                              </Text>
                            </Table.Td>
                            <Table.Td>{puesto.fila}</Table.Td>
                            <Table.Td>{puesto.cuadra}</Table.Td>
                            <Table.Td>
                              <Badge 
                                color={puesto.disponible ? "green" : "red"} 
                                variant="light"
                                size="sm"
                              >
                                {puesto.disponible ? 'Disponible' : 'Ocupado'}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Stack align="center" py="xl">
                            <IconSearch size={40} style={{ color: '#ccc' }} />
                            <Text c="dimmed">No se encontraron puestos disponibles</Text>
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <Group justify="center" mt="md">
                  <Pagination
                    total={totalPaginas}
                    value={paginaActual}
                    onChange={setPaginaActual}
                    color="dark"
                    size="sm"
                    radius="xl"
                  />
                </Group>
              )}
            </Stack>
          </Box>

          {/* ===== LADO DERECHO - FORMULARIO DE ASIGNACIÓN ===== */}
          <Box style={{ flex: 1, padding: '30px', backgroundColor: '#fafafa' }}>
            <Stack gap="xl">
              <Box>
                <Text fw={700} size="lg" mb="xs" style={{ color: '#0f0f0f' }}>
                  Detalles del Puesto
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                  Complete la información para la asignación
                </Text>
              </Box>

              {puestoSeleccionado ? (
                <>
                  {/* Resumen del puesto seleccionado */}
                  <Paper p="md" withBorder bg="white">
                    <Group justify="space-between">
                      <Box>
                        <Text size="xs" c="dimmed">Puesto seleccionado</Text>
                        <Text fw={800} size="xl" style={{ color: '#0f0f0f', letterSpacing: '1px' }}>
                          {puestoSeleccionado.nroPuesto}-{puestoSeleccionado.fila}-{puestoSeleccionado.cuadra}
                        </Text>
                      </Box>
                      <Button 
                        variant="subtle" 
                        color="gray" 
                        size="xs"
                        onClick={() => setPuestoSeleccionado(null)}
                      >
                        Cambiar
                      </Button>
                    </Group>
                  </Paper>

                  {/* Campo Rubro */}
                  <TextInput
                    label="Rubro(s) del Puesto"
                    description="Ej: Verduras, Ropa, Electrónicos, etc."
                    placeholder="Ingrese el rubro o actividad"
                    value={rubro}
                    onChange={(e) => setRubro(e.target.value)}
                    size="md"
                    styles={{
                      label: { fontWeight: 600, marginBottom: '4px' },
                      input: { 
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        height: '45px'
                      }
                    }}
                  />

                  {/* Checkbox Patente */}
                  <Box mt="xs">
                    <Checkbox
                      label="¿El puesto cuenta con patente?"
                      description="Marque esta opción si el puesto tiene patente municipal"
                      checked={tienePatente}
                      onChange={(e) => setTienePatente(e.target.checked)}
                      size="md"
                      styles={{
                        label: { fontWeight: 600 }
                      }}
                    />
                  </Box>

                  {/* Mensaje informativo */}
                  <Alert 
                    icon={<IconAlertCircle size={16} />}
                    color="blue"
                    variant="light"
                    mt="md"
                  >
                    <Text size="sm">
                      El puesto será asignado con razón <strong>"ASIGNADO"</strong> y quedará 
                      marcado como no disponible hasta que sea liberado o traspasado.
                    </Text>
                  </Alert>

                  {/* Error */}
                  {error && (
                    <Alert color="red" variant="light" icon={<IconX size={16} />}>
                      {error}
                    </Alert>
                  )}

                  {/* Botones de acción */}
                  <Group justify="flex-end" gap="md" mt="xl">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={loading}
                      style={{
                        borderColor: '#0f0f0f',
                        color: '#0f0f0f',
                        borderRadius: '100px',
                        padding: '0 30px',
                        height: '45px'
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAsignar}
                      loading={loading}
                      style={{
                        backgroundColor: '#edbe3c',
                        color: '#0f0f0f',
                        borderRadius: '100px',
                        padding: '0 30px',
                        height: '45px',
                        fontWeight: 600
                      }}
                    >
                      Asignar Puesto
                    </Button>
                  </Group>
                </>
              ) : (
                // Mensaje cuando no hay puesto seleccionado
                <Stack align="center" justify="center" style={{ height: '300px' }}>
                  <IconMapPin size={48} style={{ color: '#ccc' }} />
                  <Text size="lg" fw={500} c="dimmed" ta="center">
                    Seleccione un puesto<br />de la lista para continuar
                  </Text>
                </Stack>
              )}
            </Stack>
          </Box>
        </Group>
      </Box>
    </Modal>
  );
};

export default ModalAsignarPuesto;