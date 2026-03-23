// frontend/src/modules/Afiliados/components/TablaPuestos.jsx
//
// PARCHE DE REFACTORING:
//   - afiliadosService → afiliadosApi  (service unificado)
//   - ModalAccionPuesto + ModalConfirmarAccion → inlineados aquí
//     (son un flujo de 2 pasos exclusivo de este componente,
//      no tienen sentido como archivos separados)

import { useEffect, useState, useCallback }                   from 'react';
import {
  Table, Badge, Group, ActionIcon, Text, ScrollArea,
  Loader, Center, Stack, Menu, Modal, Box, Paper,
  Button, Alert,
} from '@mantine/core';
import {
  IconEdit, IconTrash, IconEye, IconMapPin, IconTransfer,
  IconDotsVertical, IconAlertTriangle, IconFlag,
  IconDoorExit, IconX, IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { afiliadosApi }          from '../services/afiliados.api';
import { puestosService }        from '../../GestionPatentesPuestos/service/puestosService';
import { ModalEditarPuesto }     from '../../GestionPatentesPuestos/components/ModalEditarPuesto';
import { ModalMostrarHistorial } from '../../GestionPatentesPuestos/components/ModalMostrarHistorial';
import { useLogin }              from '../../../context/LoginContext';
import '../styles/Estilos.css';

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const COLUMNAS_TABLA = [
  'Nro', 'Fila', 'Cuadra', 'Nro.Patente',
  'Fecha Obtención', 'Rubro', 'Patente / Dimensiones', 'Acciones',
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const formatFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-ES') : '—';

// ─────────────────────────────────────────────────────────────
// MODAL PASO 1 — elegir acción (LIBERAR o DESPOJAR)
// Inlineado: solo se usa en este componente
// ─────────────────────────────────────────────────────────────

const ModalElegirAccion = ({ opened, onClose, puesto, onConfirm }) => (
  <Modal
    opened={opened}
    onClose={onClose}
    size="lg"
    centered
    title={
      <Group align="center" gap="xs">
        <IconAlertTriangle size={24} color="#edbe3c" />
        <Text fw={700} size="xl" className="modal-titulo-texto">Acción sobre el Puesto</Text>
      </Group>
    }
  >
    <Stack gap="xl" p="md">
      <Paper p="md" withBorder className="modal-puesto-paper">
        <Group justify="space-between">
          <Box>
            <Text size="sm" className="modal-puesto-label">Puesto seleccionado</Text>
            <Text fw={700} size="xl" className="modal-puesto-codigo">
              {puesto?.nroPuesto}-{puesto?.fila}-{puesto?.cuadra}
            </Text>
          </Box>
          <Badge size="lg" color="yellow" variant="light" className="modal-puesto-badge">
            {puesto?.rubro || 'Sin rubro'}
          </Badge>
        </Group>
      </Paper>

      <Text size="sm" className="modal-accion-pregunta">
        ¿Qué acción deseas realizar con este puesto?
      </Text>

      <Group grow gap="md">
        <Button size="lg" leftSection={<IconDoorExit size={20} />}
          onClick={() => onConfirm('LIBERADO')} className="modal-boton-liberar">
          LIBERAR
        </Button>
        <Button size="lg" leftSection={<IconFlag size={20} />}
          onClick={() => onConfirm('DESPOJADO')} className="modal-boton-despojar">
          DESPOJAR
        </Button>
      </Group>

      <Group grow gap="md">
        <Text size="xs" className="modal-descripcion-accion">
          El afiliado cede voluntariamente<br />el puesto a la asociación
        </Text>
        <Text size="xs" className="modal-descripcion-accion">
          La asociación QUITA el puesto<br />(por incumplimiento, etc.)
        </Text>
      </Group>

      <Button variant="outline" onClick={onClose} leftSection={<IconX size={16} />}
        className="modal-boton-cancelar">
        Cancelar
      </Button>
    </Stack>
  </Modal>
);

// ─────────────────────────────────────────────────────────────
// MODAL PASO 2 — confirmar la acción elegida
// Inlineado: solo se usa en este componente
// ─────────────────────────────────────────────────────────────

const ModalConfirmarDesasignar = ({ opened, onClose, puesto, razon, onConfirmar, loading }) => {
  const esDespojo   = razon === 'DESPOJADO';
  const badgeColor  = esDespojo ? 'red'     : 'green';
  const alertColor  = esDespojo ? 'red'     : 'yellow';
  const buttonColor = esDespojo ? '#F44336' : '#4CAF50';
  const tituloColor = esDespojo ? '#F44336' : '#4CAF50';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      centered
      title={
        <Group align="center" gap="xs">
          <IconAlertTriangle size={24} color={tituloColor} />
          <Text fw={700} size="xl" className="modal-titulo-texto">Confirmar Acción</Text>
        </Group>
      }
      classNames={{ header: 'modal-confirmar-header', body: 'modal-confirmar-body' }}
    >
      <Stack gap="xl" p="md" className="modal-confirmar-contenido">
        <Paper p="md" withBorder className="modal-confirmar-puesto-paper">
          <Group justify="space-between">
            <Box>
              <Text size="sm" className="modal-confirmar-puesto-label">Puesto</Text>
              <Text fw={700} size="xl" className="modal-confirmar-puesto-codigo">
                {puesto?.nroPuesto}-{puesto?.fila}-{puesto?.cuadra}
              </Text>
            </Box>
            <Badge size="lg" color={badgeColor} variant="filled" className="modal-confirmar-badge">
              {razon}
            </Badge>
          </Group>
        </Paper>

        <Alert color={alertColor} icon={<IconAlertTriangle size={16} />}
          className={`modal-confirmar-alerta ${esDespojo ? 'alerta-despojo' : 'alerta-liberacion'}`}>
          {esDespojo ? (
            <Stack gap="xs">
              <Text fw={600} className="modal-alerta-titulo">Acción irreversible</Text>
              <Text size="sm" className="modal-alerta-descripcion">
                Vas a DESPOJAR al afiliado de este puesto. Esto:
              </Text>
              <ul className="modal-alerta-lista">
                <li>Registrará el puesto como DESPOJADO en el historial</li>
                <li>El puesto quedará disponible para otros afiliados</li>
              </ul>
            </Stack>
          ) : (
            <Stack gap="xs">
              <Text fw={600} className="modal-alerta-titulo">Confirmar liberación</Text>
              <Text size="sm" className="modal-alerta-descripcion">
                Vas a LIBERAR el puesto. El afiliado cede voluntariamente el puesto a la asociación.
                El puesto quedará disponible para futuras asignaciones.
              </Text>
            </Stack>
          )}
        </Alert>

        <Group justify="space-between" mt="md" className="modal-confirmar-botones">
          <Button variant="outline" onClick={onClose} disabled={loading}
            leftSection={<IconX size={16} />} className="modal-confirmar-boton-cancelar">
            Cancelar
          </Button>
          <Button onClick={onConfirmar} loading={loading}
            leftSection={<IconCheck size={16} />}
            className="modal-confirmar-boton-confirmar"
            style={{ backgroundColor: buttonColor }}>
            {loading ? 'Procesando...' : `Sí, ${esDespojo ? 'Despojar' : 'Liberar'}`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

/**
 * Tabla de puestos de un afiliado.
 * Historial — visible para todos.
 * Traspasar, Editar y Desasignar — solo superAdmin.
 */
const TablaPuestos = ({ afiliadoId, onRefresh, onTraspaso, refreshKey }) => {
  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  const [puestos,                   setPuestos]                   = useState([]);
  const [cargando,                  setCargando]                  = useState(true);
  const [error,                     setError]                     = useState(null);
  const [modalEditarAbierto,        setModalEditarAbierto]        = useState(false);
  const [puestoSeleccionado,        setPuestoSeleccionado]        = useState(null);
  const [modalDetalleAbierto,       setModalDetalleAbierto]       = useState(false);
  const [puestoParaDetalle,         setPuestoParaDetalle]         = useState(null);
  const [modalAccionAbierto,        setModalAccionAbierto]        = useState(false);
  const [modalConfirmacionAbierto,  setModalConfirmacionAbierto]  = useState(false);
  const [accionSeleccionada,        setAccionSeleccionada]        = useState(null);
  const [cargandoAccion,            setCargandoAccion]            = useState(false);

  // ── Carga ────────────────────────────────────────────────────

  const cargarPuestos = useCallback(async () => {
    if (!afiliadoId) return;
    try {
      setCargando(true);
      setError(null);
      const data = await afiliadosApi.obtenerPuestosDeAfiliado(afiliadoId);
      setPuestos(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los puestos');
    } finally {
      setCargando(false);
    }
  }, [afiliadoId]);

  useEffect(() => { cargarPuestos(); }, [cargarPuestos, refreshKey]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    cargarPuestos();
    onRefresh?.();
  }, [cargarPuestos, onRefresh]);

  const handleEditar       = useCallback((p) => { setPuestoSeleccionado(p); setModalEditarAbierto(true); },  []);
  const handleVerDetalle   = useCallback((p) => { setPuestoParaDetalle(p);  setModalDetalleAbierto(true); }, []);
  const handleEliminar     = useCallback((p) => { setPuestoSeleccionado(p); setModalAccionAbierto(true); },  []);
  const handleTraspasoClick = useCallback((p) => { onTraspaso?.(p, handleRefresh); }, [onTraspaso, handleRefresh]);

  const handleSeleccionarAccion = useCallback((razon) => {
    setAccionSeleccionada(razon);
    setModalAccionAbierto(false);
    setModalConfirmacionAbierto(true);
  }, []);

  const handleEjecutarAccion = useCallback(async () => {
    try {
      setCargandoAccion(true);
      const result = await afiliadosApi.desasignarPuesto(
        afiliadoId,
        puestoSeleccionado.id_puesto,
        accionSeleccionada,
      );
      notifications.show({ title: '✅ Éxito', message: result.message, color: 'green' });
      setModalConfirmacionAbierto(false);
      setPuestoSeleccionado(null);
      setAccionSeleccionada(null);
      cargarPuestos();
    } catch (err) {
      notifications.show({ title: '❌ Error', message: err.message, color: 'red' });
    } finally {
      setCargandoAccion(false);
    }
  }, [afiliadoId, puestoSeleccionado, accionSeleccionada, cargarPuestos]);

  const handleGuardarPuesto = useCallback(async (formData) => {
    try {
      await puestosService.actualizarPuesto(puestoSeleccionado.id_puesto, formData);
      notifications.show({ title: '✅ Éxito', message: 'Puesto actualizado correctamente', color: 'green' });
      setModalEditarAbierto(false);
      setPuestoSeleccionado(null);
      cargarPuestos();
      onRefresh?.();
    } catch (err) {
      notifications.show({ title: '❌ Error', message: err.message || 'No se pudo actualizar el puesto', color: 'red' });
    }
  }, [puestoSeleccionado, cargarPuestos, onRefresh]);

  const cerrarModalEditar       = useCallback(() => { setModalEditarAbierto(false);       setPuestoSeleccionado(null); }, []);
  const cerrarModalDetalle      = useCallback(() => { setModalDetalleAbierto(false);      setPuestoParaDetalle(null); },  []);
  const cerrarModalAccion       = useCallback(() => { setModalAccionAbierto(false);       setPuestoSeleccionado(null); }, []);
  const cerrarModalConfirmacion = useCallback(() => {
    setModalConfirmacionAbierto(false);
    setPuestoSeleccionado(null);
    setAccionSeleccionada(null);
  }, []);

  // ── Renderizado condicional ───────────────────────────────────

  if (cargando) return <Center py="xl"><Loader size="sm" color="dark" /></Center>;

  if (error) return <Center py="xl"><Text c="red" size="sm">{error}</Text></Center>;

  if (puestos.length === 0) {
    return (
      <Stack align="center" gap="xs" py="xl" className="tabla-puestos-vacia">
        <IconMapPin size={40} className="icono-vacio" />
        <Text size="lg">No hay puestos asignados</Text>
        <Text size="sm" c="dimmed">Este afiliado no tiene puestos activos</Text>
      </Stack>
    );
  }

  // ── Tabla ─────────────────────────────────────────────────────

  return (
    <>
      <ScrollArea className="tabla-puestos-scroll">
        <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="lg" className="tabla-puestos">
          <Table.Thead className="tabla-puestos-header">
            <Table.Tr>
              {COLUMNAS_TABLA.map((col) => <Table.Th key={col}>{col}</Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {puestos.map((puesto) => (
              <Table.Tr key={puesto.id_puesto} className="tabla-puestos-fila">
                <Table.Td><Text fw={600} className="texto-nro-puesto">{puesto.nroPuesto}</Text></Table.Td>
                <Table.Td><Text size="sm">{puesto.fila}</Text></Table.Td>
                <Table.Td><Text size="sm">{puesto.cuadra}</Text></Table.Td>
                <Table.Td><Text fw={600} className="texto-nro-patente">{puesto.nro_patente}</Text></Table.Td>
                <Table.Td><Text size="sm">{formatFecha(puesto.fecha_ini)}</Text></Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {puesto.rubro || <span className="texto-sin-rubro">Sin rubro</span>}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={puesto.tiene_patente ? 'green' : 'yellow'} variant="dot" className="badge-patente">
                    {puesto.tiene_patente ? 'CON PATENTE' : 'SIN PATENTE'}
                  </Badge>
                  {puesto.ancho && puesto.largo && (
                    <Text size="xs" c="dimmed" mt={4}>{puesto.ancho}m x {puesto.largo}m</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={200} position="bottom-end"
                    transitionProps={{ transition: 'pop-top-right' }}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="md" className="menu-acciones-boton"
                        aria-label="Acciones del puesto">
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown className="menu-acciones-dropdown">
                      <Menu.Item leftSection={<IconEye size={16} />}
                        description="Ver información completa del puesto"
                        onClick={() => handleVerDetalle(puesto)}>
                        Historial
                      </Menu.Item>

                      {esSuperAdmin && (
                        <>
                          <Menu.Item leftSection={<IconTransfer size={16} />}
                            description="Transferir el puesto a otro afiliado"
                            onClick={() => handleTraspasoClick(puesto)}>
                            Traspasar
                          </Menu.Item>
                          <Menu.Item leftSection={<IconEdit size={16} />}
                            description="Modificar rubro, patente o dimensiones"
                            onClick={() => handleEditar(puesto)}>
                            Editar
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<IconTrash size={16} />}
                            description="Liberar o despojar el puesto"
                            onClick={() => handleEliminar(puesto)}>
                            Desasignar
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <ModalEditarPuesto
        opened={modalEditarAbierto}
        close={cerrarModalEditar}
        puesto={puestoSeleccionado}
        onGuardar={handleGuardarPuesto}
      />

      <ModalMostrarHistorial
        opened={modalDetalleAbierto}
        close={cerrarModalDetalle}
        puesto={puestoParaDetalle}
      />

      <ModalElegirAccion
        opened={modalAccionAbierto}
        onClose={cerrarModalAccion}
        puesto={puestoSeleccionado}
        onConfirm={handleSeleccionarAccion}
      />

      <ModalConfirmarDesasignar
        opened={modalConfirmacionAbierto}
        onClose={cerrarModalConfirmacion}
        puesto={puestoSeleccionado}
        razon={accionSeleccionada}
        onConfirmar={handleEjecutarAccion}
        loading={cargandoAccion}
      />
    </>
  );
};

export default TablaPuestos;