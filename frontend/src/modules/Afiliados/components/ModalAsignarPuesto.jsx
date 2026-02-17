// frontend/src/modules/Afiliados/components/ModalAsignarPuesto.jsx
import { Paper, Modal, Box, Group, Stack, Text, Button, Select, TextInput, Checkbox, LoadingOverlay, Badge, Table, ScrollArea, Pagination, CloseButton, Alert, SimpleGrid, NumberInput } from '@mantine/core';
import { IconSearch, IconX, IconAlertCircle, IconCheck, IconMapPin, IconFilter, IconFilterOff } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useAsignarPuesto } from '../hooks/useAsignarPuesto';

const ModalAsignarPuesto = ({ opened, onClose, idAfiliado, onPuestoAsignado }) => {
  const { 
    puestosFiltrados,
    puestosCargando, 
    loading, 
    filtros,
    opcionesFiltros,
    cargarPuestosDisponibles, 
    aplicarFiltros,
    limpiarFiltros,
    asignarPuesto 
  } = useAsignarPuesto(idAfiliado);

  // Estados del formulario
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [rubro, setRubro] = useState('');
  const [tienePatente, setTienePatente] = useState(false);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  
  const itemsPorPagina = 10;

  // Cargar puestos al abrir el modal
  useEffect(() => {
    if (opened) {
      cargarPuestosDisponibles();
      // Resetear estado
      setPuestoSeleccionado(null);
      setRubro('');
      setTienePatente(false);
      setError('');
      setPaginaActual(1);
    }
  }, [opened]);

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
      if (onPuestoAsignado) {
        onPuestoAsignado();
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = () => {
    return filtros.fila || filtros.cuadra || filtros.nroPuesto || filtros.rubro;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="95%"
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
          <Box style={{ flex: 1.8, borderRight: '1px solid #eee', padding: '20px' }}>
            <Stack gap="md">
              
              {/* Panel de filtros */}
              <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconFilter size={18} color="#666" />
                    <Text fw={600}>Filtros</Text>
                  </Group>
                  {hayFiltrosActivos() && (
                    <Button 
                      variant="subtle" 
                      size="xs" 
                      leftSection={<IconFilterOff size={14} />}
                      onClick={() => {
                        limpiarFiltros();
                        setPaginaActual(1);
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xs">
                  <Select
                    placeholder="Fila"
                    data={[
                      { value: '', label: 'Todas las filas' },
                      ...opcionesFiltros.filas.map(f => ({ value: f, label: `Fila ${f}` }))
                    ]}
                    value={filtros.fila}
                    onChange={(val) => {
                      aplicarFiltros({ fila: val });
                      setPaginaActual(1);
                    }}
                    clearable
                    size="sm"
                    styles={{
                      input: { backgroundColor: 'white' }
                    }}
                  />
                  
                  <Select
                    placeholder="Cuadra"
                    data={[
                      { value: '', label: 'Todas las cuadras' },
                      ...opcionesFiltros.cuadras.map(c => ({ value: c, label: c }))
                    ]}
                    value={filtros.cuadra}
                    onChange={(val) => {
                      aplicarFiltros({ cuadra: val });
                      setPaginaActual(1);
                    }}
                    clearable
                    size="sm"
                    searchable
                    styles={{
                      input: { backgroundColor: 'white' }
                    }}
                  />
                  
                  <NumberInput
                    placeholder="N° de puesto"
                    value={filtros.nroPuesto}
                    onChange={(val) => {
                      aplicarFiltros({ nroPuesto: val?.toString() || '' });
                      setPaginaActual(1);
                    }}
                    min={opcionesFiltros.rango_numeros.min}
                    max={opcionesFiltros.rango_numeros.max}
                    size="sm"
                    styles={{
                      input: { backgroundColor: 'white' }
                    }}
                  />
                  
                  <TextInput
                    placeholder="Buscar por rubro"
                    value={filtros.rubro}
                    onChange={(e) => {
                      aplicarFiltros({ rubro: e.target.value });
                      setPaginaActual(1);
                    }}
                    size="sm"
                    styles={{
                      input: { backgroundColor: 'white' }
                    }}
                  />
                </SimpleGrid>
              </Paper>

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
              {/* Tabla de puestos */}
              <ScrollArea style={{ height: '400px' }} offsetScrollbars>
                <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead style={{ backgroundColor: '#f1f3f5', position: 'sticky', top: 0, zIndex: 10 }}>
                    <Table.Tr>
                      <Table.Th style={{ width: '40px' }}></Table.Th>
                      <Table.Th>N° Puesto</Table.Th>
                      <Table.Th>Fila</Table.Th>
                      <Table.Th>Cuadra</Table.Th>
                      <Table.Th>Rubro</Table.Th>
                      <Table.Th>Patente</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    
                    {puestosPaginados.length > 0 ? (
                      puestosPaginados.map((puesto) => {
                        const isSelected = puestoSeleccionado?.id_puesto === puesto.id_puesto;
                        
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
                              <Text size="sm" lineClamp={1}>
                                {puesto.rubro || '-'}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge 
                                color={puesto.tiene_patente ? "green" : "gray"} 
                                variant="light"
                                size="sm"
                              >
                                {puesto.tiene_patente ? 'Sí' : 'No'}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Stack align="center" py="xl">
                            <IconSearch size={40} style={{ color: '#ccc' }} />
                            <Text c="dimmed">No se encontraron puestos disponibles</Text>
                            {hayFiltrosActivos() && (
                              <Button 
                                variant="subtle" 
                                size="xs"
                                onClick={() => {
                                  limpiarFiltros();
                                  setPaginaActual(1);
                                }}
                              >
                                Limpiar filtros
                              </Button>
                            )}
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              
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
                <Stack align="center" justify="center" style={{ height: '400px' }}>
                  <IconMapPin size={48} style={{ color: '#ccc' }} />
                  <Text size="lg" fw={500} c="dimmed" ta="center">
                    Seleccione un puesto<br />de la lista para continuar
                  </Text>
                  <Text size="sm" c="dimmed" ta="center" mt="md">
                    Use los filtros para encontrar<br />el puesto más fácilmente
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