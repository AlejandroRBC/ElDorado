// frontend/src/modules/Afiliados/components/ModalAsignarPuesto.jsx
//
// PARCHE DE REFACTORING:
//   - useAsignarPuesto (eliminado) → lógica inlineada aquí
//     usando afiliadosApi.obtenerPuestosDisponibles  (carga)
//     y     useAfiliadoActions.asignarPuesto         (escritura)

import {
  Paper, Modal, Box, Group, Stack, Text, Button, Select, TextInput,
  Checkbox, LoadingOverlay, Badge, Table, ScrollArea, Pagination,
  Alert, SimpleGrid, NumberInput,
} from '@mantine/core';
import {
  IconSearch, IconX, IconAlertCircle, IconCheck, IconMapPin,
  IconFilter, IconFilterOff,
} from '@tabler/icons-react';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { afiliadosApi }       from '../services/afiliados.api';
import { useAfiliadoActions } from '../hooks/useAfiliadoActions';
import '../styles/Estilos.css';

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const ITEMS_POR_PAGINA = 10;

const FILTROS_INICIALES = { fila: '', cuadra: '', nroPuesto: '', rubro: '' };

// ─────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────

const ModalAsignarPuesto = ({ opened, onClose, idAfiliado, onPuestoAsignado }) => {

  // ── Acciones (escritura) ─────────────────────────────────────
  const { asignarPuesto, loading } = useAfiliadoActions();

  // ── Estado local de puestos disponibles ──────────────────────
  const [todosLosPuestos,  setTodosLosPuestos]  = useState([]);
  const [puestosCargando,  setPuestosCargando]  = useState(false);
  const [filtros,          setFiltros]          = useState(FILTROS_INICIALES);
  const [opcionesFiltros,  setOpcionesFiltros]  = useState({
    filas: [], cuadras: [], rango_numeros: { min: 1, max: 100 },
  });

  // ── Estado local UI ───────────────────────────────────────────
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [rubro,              setRubro]              = useState('');
  const [tienePatente,       setTienePatente]       = useState(false);
  const [error,              setError]              = useState('');
  const [paginaActual,       setPaginaActual]       = useState(1);

  // ── Carga de puestos disponibles ─────────────────────────────

  const cargarPuestosDisponibles = useCallback(async () => {
    try {
      setPuestosCargando(true);
      const puestos = await afiliadosApi.obtenerPuestosDisponibles();
      setTodosLosPuestos(puestos || []);

      // Extraer opciones únicas para los selects de filtro
      const filas   = [...new Set((puestos || []).map((p) => p.fila).filter(Boolean))].sort();
      const cuadras = [...new Set((puestos || []).map((p) => p.cuadra).filter(Boolean))].sort();
      const nums    = (puestos || []).map((p) => Number(p.nroPuesto)).filter(Boolean);
      setOpcionesFiltros({
        filas,
        cuadras,
        rango_numeros: {
          min: nums.length ? Math.min(...nums) : 1,
          max: nums.length ? Math.max(...nums) : 100,
        },
      });
    } catch (err) {
      console.error('Error cargando puestos disponibles:', err);
    } finally {
      setPuestosCargando(false);
    }
  }, []);

  useEffect(() => {
    if (opened) {
      cargarPuestosDisponibles();
      setPuestoSeleccionado(null);
      setRubro('');
      setTienePatente(false);
      setError('');
      setPaginaActual(1);
      setFiltros(FILTROS_INICIALES);
    }
  }, [opened, cargarPuestosDisponibles]);

  // ── Filtrado ─────────────────────────────────────────────────

  const puestosFiltrados = useMemo(() => {
    return todosLosPuestos.filter((p) => {
      if (filtros.fila     && p.fila   !== filtros.fila)                         return false;
      if (filtros.cuadra   && p.cuadra !== filtros.cuadra)                       return false;
      if (filtros.nroPuesto && !p.nroPuesto.toString().includes(filtros.nroPuesto)) return false;
      if (filtros.rubro    && !p.rubro?.toLowerCase().includes(filtros.rubro.toLowerCase())) return false;
      return true;
    });
  }, [todosLosPuestos, filtros]);

  const filtrosActivos = useMemo(
    () => !!(filtros.fila || filtros.cuadra || filtros.nroPuesto || filtros.rubro),
    [filtros]
  );

  const totalPaginas = useMemo(
    () => Math.ceil(puestosFiltrados.length / ITEMS_POR_PAGINA),
    [puestosFiltrados.length]
  );

  const puestosPaginados = useMemo(
    () => puestosFiltrados.slice(
      (paginaActual - 1) * ITEMS_POR_PAGINA,
      paginaActual * ITEMS_POR_PAGINA,
    ),
    [puestosFiltrados, paginaActual]
  );

  // ── Helpers de filtro ────────────────────────────────────────

  const aplicarFiltro  = useCallback((campo, val) => {
    setFiltros((prev) => ({ ...prev, [campo]: val ?? '' }));
    setPaginaActual(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setPaginaActual(1);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────

  const handleSeleccionarPuesto = useCallback((puesto) => {
    setPuestoSeleccionado(puesto);
    setRubro(puesto.rubro || '');
    setTienePatente(puesto.tiene_patente === 1 || puesto.tiene_patente === true);
  }, []);

  const handleAsignar = useCallback(async () => {
    if (!puestoSeleccionado) { setError('Debe seleccionar un puesto'); return; }
    setError('');

    const resultado = await asignarPuesto(idAfiliado, {
      id_puesto:     puestoSeleccionado.id_puesto,
      fila:          puestoSeleccionado.fila,
      cuadra:        puestoSeleccionado.cuadra,
      nroPuesto:     puestoSeleccionado.nroPuesto,
      rubro,
      tiene_patente: tienePatente,
    });

    if (resultado.exito) {
      onPuestoAsignado?.();
      setTimeout(() => onClose(), 1000);
    }
  }, [puestoSeleccionado, rubro, tienePatente, asignarPuesto, idAfiliado, onPuestoAsignado, onClose]);

  // ── Render ────────────────────────────────────────────────────

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="95%"
      centered
      title={
        <Group align="center" gap="xs">
          <IconMapPin size={24} color="#edbe3c" />
          <Text fw={700} size="xl" className="modal-titulo-texto">Asignar Puesto a Afiliado</Text>
        </Group>
      }
      classNames={{ header: 'modal-asignar-header', body: 'modal-asignar-body' }}
    >
      <Box className="modal-asignar-contenedor">
        <LoadingOverlay visible={puestosCargando || loading} overlayProps={{ blur: 2 }} />

        <Group align="flex-start" gap={0} className="modal-asignar-grid">

          {/* ── Panel izquierdo — lista de puestos ── */}
          <Box className="modal-asignar-lista">
            <Stack gap="md">

              {/* Filtros */}
              <Paper p="md" withBorder className="filtros-panel">
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconFilter size={18} color="#666" />
                    <Text fw={600}>Filtros</Text>
                  </Group>
                  {filtrosActivos && (
                    <Button variant="subtle" size="xs" leftSection={<IconFilterOff size={14} />}
                      onClick={limpiarFiltros} className="filtros-boton-limpiar">
                      Limpiar filtros
                    </Button>
                  )}
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xs">
                  <Select
                    placeholder="Fila"
                    data={[{ value: '', label: 'Todas las filas' }, ...opcionesFiltros.filas.map((f) => ({ value: f, label: `Fila ${f}` }))]}
                    value={filtros.fila}
                    onChange={(v) => aplicarFiltro('fila', v)}
                    clearable size="sm" className="filtro-select"
                  />
                  <Select
                    placeholder="Cuadra"
                    data={[{ value: '', label: 'Todas las cuadras' }, ...opcionesFiltros.cuadras.map((c) => ({ value: c, label: c }))]}
                    value={filtros.cuadra}
                    onChange={(v) => aplicarFiltro('cuadra', v)}
                    clearable size="sm" searchable className="filtro-select"
                  />
                  <NumberInput
                    placeholder="N° de puesto"
                    value={filtros.nroPuesto}
                    onChange={(v) => aplicarFiltro('nroPuesto', v?.toString() || '')}
                    min={opcionesFiltros.rango_numeros.min}
                    max={opcionesFiltros.rango_numeros.max}
                    size="sm" className="filtro-number"
                  />
                  <TextInput
                    placeholder="Buscar por rubro"
                    value={filtros.rubro}
                    onChange={(e) => aplicarFiltro('rubro', e.target.value)}
                    size="sm" className="filtro-input"
                  />
                </SimpleGrid>
              </Paper>

              {/* Tabla de puestos */}
              <Group justify="space-between" className="tabla-header">
                <Text size="sm" fw={600}>Puestos Disponibles: {puestosFiltrados.length}</Text>
                {puestoSeleccionado && (
                  <Badge color="green" variant="filled" className="badge-seleccionado">1 seleccionado</Badge>
                )}
              </Group>

              {totalPaginas > 1 && (
                <Group justify="center" mt="md">
                  <Pagination total={totalPaginas} value={paginaActual} onChange={setPaginaActual}
                    color="dark" size="sm" radius="xl" />
                </Group>
              )}

              <ScrollArea style={{ height: '400px' }} offsetScrollbars className="tabla-scroll">
                <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead className="tabla-thead">
                    <Table.Tr>
                      <Table.Th style={{ width: '40px' }} />
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
                        const sel = puestoSeleccionado?.id_puesto === puesto.id_puesto;
                        return (
                          <Table.Tr key={puesto.id_puesto}
                            className={`tabla-fila ${sel ? 'tabla-fila-seleccionada' : ''}`}
                            onClick={() => handleSeleccionarPuesto(puesto)}>
                            <Table.Td>{sel && <IconCheck size={18} color="#0f0f0f" />}</Table.Td>
                            <Table.Td><Text fw={sel ? 700 : 400}>{puesto.nroPuesto}</Text></Table.Td>
                            <Table.Td>{puesto.fila}</Table.Td>
                            <Table.Td>{puesto.cuadra}</Table.Td>
                            <Table.Td><Text size="sm" lineClamp={1}>{puesto.rubro || '-'}</Text></Table.Td>
                            <Table.Td>
                              <Badge color={puesto.tiene_patente ? 'green' : 'gray'} variant="light" size="sm">
                                {puesto.tiene_patente ? 'Sí' : 'No'}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Stack align="center" py="xl" className="tabla-sin-resultados">
                            <IconSearch size={40} className="icono-sin-resultados" />
                            <Text c="dimmed">No se encontraron puestos disponibles</Text>
                            {filtrosActivos && (
                              <Button variant="subtle" size="xs" onClick={limpiarFiltros}>
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

          {/* ── Panel derecho — formulario ── */}
          <Box className="modal-asignar-formulario">
            <Stack gap="xl">
              <Box>
                <Text fw={700} size="lg" mb="xs" className="formulario-titulo">Detalles del Puesto</Text>
                <Text size="sm" c="dimmed" mb="lg">Complete la información para la asignación</Text>
              </Box>

              {puestoSeleccionado ? (
                <>
                  <Paper p="md" withBorder bg="white" className="puesto-resumen">
                    <Group justify="space-between">
                      <Box>
                        <Text size="xs" c="dimmed">Puesto seleccionado</Text>
                        <Text fw={800} size="xl" className="puesto-codigo">
                          {puestoSeleccionado.nroPuesto}-{puestoSeleccionado.fila}-{puestoSeleccionado.cuadra}
                        </Text>
                      </Box>
                      <Button variant="subtle" color="gray" size="xs"
                        onClick={() => setPuestoSeleccionado(null)}>
                        Cambiar
                      </Button>
                    </Group>
                  </Paper>

                  <TextInput
                    label="Rubro(s) del Puesto"
                    description="Ej: Verduras, Ropa, Electrónicos, etc."
                    placeholder="Ingrese el rubro o actividad"
                    value={rubro}
                    onChange={(e) => setRubro(e.target.value)}
                    size="md" className="input-rubro"
                  />

                  <Box mt="xs">
                    <Checkbox
                      label="¿El puesto cuenta con patente?"
                      description="Marque esta opción si el puesto tiene patente municipal"
                      checked={tienePatente}
                      onChange={(e) => setTienePatente(e.target.checked)}
                      size="md" className="checkbox-patente"
                    />
                  </Box>

                  <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light"
                    mt="md" className="alerta-informativa">
                    <Text size="sm">
                      El puesto será asignado con razón <strong>"ASIGNADO"</strong> y quedará
                      marcado como no disponible hasta que sea liberado o traspasado.
                    </Text>
                  </Alert>

                  {error && (
                    <Alert color="red" variant="light" icon={<IconX size={16} />} className="alerta-error">
                      {error}
                    </Alert>
                  )}

                  <Group justify="flex-end" gap="md" mt="xl">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="boton-cancelar">
                      Cancelar
                    </Button>
                    <Button onClick={handleAsignar} loading={loading} className="boton-asignar">
                      Asignar Puesto
                    </Button>
                  </Group>
                </>
              ) : (
                <Stack align="center" justify="center" className="sin-seleccion">
                  <IconMapPin size={48} className="icono-sin-seleccion" />
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