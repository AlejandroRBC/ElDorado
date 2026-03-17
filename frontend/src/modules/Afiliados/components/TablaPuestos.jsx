import { useEffect, useState, useCallback } from 'react';
import { Table, Badge, Group, ActionIcon, Text, ScrollArea, Loader, Center, Stack, Menu } from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconMapPin, IconTransfer, IconDotsVertical } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { afiliadosService } from '../services/afiliadosService';
import { puestosService } from '../../GestionPatentesPuestos/service/puestosService';
import { ModalEditarPuesto } from '../../GestionPatentesPuestos/components/ModalEditarPuesto';
import { ModalMostrarHistorial } from '../../GestionPatentesPuestos/components/ModalMostrarHistorial';
import ModalAccionPuesto from './ModalAccionPuesto';
import ModalConfirmarAccion from './ModalConfirmarAccion';
import { useLogin } from '../../../context/LoginContext';

import '../styles/Estilos.css';

// ==============================================
// CONSTANTES
// ==============================================
const COLUMNAS_TABLA = [
  'Nro',
  'Fila',
  'Cuadra',
  'Nro.Patente',
  'Fecha Obtención',
  'Rubro',
  'Patente / Dimensiones',
  'Acciones'
];

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-ES');
};

const getBadgeColor = (tienePatente) => {
  return tienePatente ? 'green' : 'yellow';
};

const getBadgeText = (tienePatente) => {
  return tienePatente ? 'CON PATENTE' : 'SIN PATENTE';
};

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

/**
 * Tabla de puestos de un afiliado.
 * Historial — visible para todos.
 * Traspasar, Editar y Desasignar — solo superAdmin.
 */
const TablaPuestos = ({ afiliadoId, onRefresh, onTraspaso }) => {
  // ── Control de rol ──────────────────────────────────────────
  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  // ==============================================
  // ESTADOS LOCALES
  // ==============================================
  const [puestos, setPuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [puestoParaDetalle, setPuestoParaDetalle] = useState(null);
  const [modalAccionAbierto, setModalAccionAbierto] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  // ==============================================
  // FUNCIÓN DE CARGA DE DATOS
  // ==============================================
  const cargarPuestos = useCallback(async () => {
    if (!afiliadoId) return;
    try {
      setCargando(true);
      setError(null);
      const data = await afiliadosService.obtenerPuestosDeAfiliado(afiliadoId);
      setPuestos(data);
    } catch (err) {
      console.error('Error cargando puestos del afiliado:', err);
      setError(err.message || 'No se pudieron cargar los puestos');
    } finally {
      setCargando(false);
    }
  }, [afiliadoId]);

  // ==============================================
  // EFECTOS
  // ==============================================
  useEffect(() => {
    cargarPuestos();
  }, [cargarPuestos]);

  // ==============================================
  // HANDLERS DEL COMPONENTE
  // ==============================================

  const handleRefresh = useCallback(() => {
    cargarPuestos();
    if (onRefresh) onRefresh();
  }, [cargarPuestos, onRefresh]);

  const handleEditar = useCallback((puesto) => {
    setPuestoSeleccionado(puesto);
    setModalEditarAbierto(true);
  }, []);

  const handleVerDetalle = useCallback((puesto) => {
    setPuestoParaDetalle(puesto);
    setModalDetalleAbierto(true);
  }, []);

  const handleEliminar = useCallback((puesto) => {
    setPuestoSeleccionado(puesto);
    setModalAccionAbierto(true);
  }, []);

  const handleSeleccionarAccion = useCallback((razon) => {
    setAccionSeleccionada(razon);
    setModalAccionAbierto(false);
    setModalConfirmacionAbierto(true);
  }, []);

  const handleEjecutarAccion = useCallback(async () => {
    try {
      setCargandoAccion(true);
      const result = await afiliadosService.desasignarPuesto(
        afiliadoId,
        puestoSeleccionado.id_puesto,
        accionSeleccionada,
      );

      notifications.show({
        title: '✅ Éxito',
        message: result.message,
        color: 'green'
      });

      setModalConfirmacionAbierto(false);
      setPuestoSeleccionado(null);
      setAccionSeleccionada(null);
      cargarPuestos();
    } catch (err) {
      console.error('Error:', err);
      notifications.show({
        title: '❌ Error',
        message: err.message,
        color: 'red'
      });
    } finally {
      setCargandoAccion(false);
    }
  }, [afiliadoId, puestoSeleccionado, accionSeleccionada, cargarPuestos]);

  const handleGuardarPuesto = useCallback(async (formData) => {
    try {
      await puestosService.actualizarPuesto(puestoSeleccionado.id_puesto, formData);
      notifications.show({
        title: '✅ Éxito',
        message: 'Puesto actualizado correctamente',
        color: 'green'
      });
      setModalEditarAbierto(false);
      setPuestoSeleccionado(null);
      cargarPuestos();
      if (onRefresh) onRefresh();
    } catch (err) {
      notifications.show({
        title: '❌ Error',
        message: err.message || 'No se pudo actualizar el puesto',
        color: 'red'
      });
    }
  }, [puestoSeleccionado, cargarPuestos, onRefresh]);

  const handleTraspasoClick = useCallback((puesto) => {
    if (onTraspaso) onTraspaso(puesto, handleRefresh);
  }, [onTraspaso, handleRefresh]);

  const handleCerrarModalEditar = useCallback(() => {
    setModalEditarAbierto(false);
    setPuestoSeleccionado(null);
  }, []);

  const handleCerrarModalDetalle = useCallback(() => {
    setModalDetalleAbierto(false);
    setPuestoParaDetalle(null);
  }, []);

  const handleCerrarModalAccion = useCallback(() => {
    setModalAccionAbierto(false);
    setPuestoSeleccionado(null);
  }, []);

  const handleCerrarModalConfirmacion = useCallback(() => {
    setModalConfirmacionAbierto(false);
    setPuestoSeleccionado(null);
    setAccionSeleccionada(null);
  }, []);

  // ==============================================
  // RENDERIZADO CONDICIONAL
  // ==============================================
  if (cargando) {
    return (
      <Center py="xl">
        <Loader size="sm" color="dark" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py="xl">
        <Text c="red" size="sm">{error}</Text>
      </Center>
    );
  }

  if (puestos.length === 0) {
    return (
      <Stack align="center" gap="xs" py="xl" className="tabla-puestos-vacia">
        <IconMapPin size={40} className="icono-vacio" />
        <Text size="lg">No hay puestos asignados</Text>
        <Text size="sm" c="dimmed">Este afiliado no tiene puestos activos</Text>
      </Stack>
    );
  }

  // ==============================================
  // RENDERIZADO DE FILAS
  // ==============================================
  const rows = puestos.map((puesto) => {
    const badgeColor = getBadgeColor(puesto.tiene_patente);
    const badgeText = getBadgeText(puesto.tiene_patente);
    const fechaFormateada = formatFecha(puesto.fecha_ini);

    return (
      <Table.Tr key={puesto.id_puesto} className="tabla-puestos-fila">
        <Table.Td>
          <Text fw={600} className="texto-nro-puesto">{puesto.nroPuesto}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" className="texto-fila">{puesto.fila}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" className="texto-cuadra">{puesto.cuadra}</Text>
        </Table.Td>
        <Table.Td>
          <Text fw={600} className="texto-nro-patente">{puesto.nro_patente}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" className="texto-fecha">{fechaFormateada}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" className="texto-rubro">
            {puesto.rubro || <span className="texto-sin-rubro">Sin rubro</span>}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge color={badgeColor} variant="dot" className="badge-patente">
            {badgeText}
          </Badge>
          {puesto.ancho && puesto.largo && (
            <Text size="xs" c="dimmed" mt={4}>
              {puesto.ancho}m x {puesto.largo}m
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Menu
            shadow="md"
            width={200}
            position="bottom-end"
            transitionProps={{ transition: 'pop-top-right' }}
          >
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="md"
                aria-label="Acciones del puesto"
                className="menu-acciones-boton"
              >
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown className="menu-acciones-dropdown">

              {/* Historial — libre para todos */}
              <Menu.Item
                leftSection={<IconEye size={16} />}
                description="Ver información completa del puesto"
                onClick={() => handleVerDetalle(puesto)}
              >
                Historial
              </Menu.Item>

              {/* Traspasar, Editar, Desasignar — solo superAdmin */}
              {esSuperAdmin && (
                <>
                  <Menu.Item
                    leftSection={<IconTransfer size={16} />}
                    description="Transferir el puesto a otro afiliado"
                    onClick={() => handleTraspasoClick(puesto)}
                  >
                    Traspasar
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconEdit size={16} />}
                    description="Modificar rubro, patente o dimensiones"
                    onClick={() => handleEditar(puesto)}
                  >
                    Editar
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconTrash size={16} />}
                    description="Liberar o despojar el puesto"
                    onClick={() => handleEliminar(puesto)}
                  >
                    Desasignar
                  </Menu.Item>
                </>
              )}

            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  // ==============================================
  // RENDER PRINCIPAL
  // ==============================================
  return (
    <>
      <ScrollArea className="tabla-puestos-scroll">
        <Table
          striped
          highlightOnHover
          verticalSpacing="md"
          horizontalSpacing="lg"
          className="tabla-puestos"
        >
          <Table.Thead className="tabla-puestos-header">
            <Table.Tr>
              {COLUMNAS_TABLA.map((col) => (
                <Table.Th key={col}>{col}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      <ModalEditarPuesto
        opened={modalEditarAbierto}
        close={handleCerrarModalEditar}
        puesto={puestoSeleccionado}
        onGuardar={handleGuardarPuesto}
      />

      <ModalMostrarHistorial
        opened={modalDetalleAbierto}
        close={handleCerrarModalDetalle}
        puesto={puestoParaDetalle}
      />

      <ModalAccionPuesto
        opened={modalAccionAbierto}
        onClose={handleCerrarModalAccion}
        puesto={puestoSeleccionado}
        onConfirm={handleSeleccionarAccion}
      />

      <ModalConfirmarAccion
        opened={modalConfirmacionAbierto}
        onClose={handleCerrarModalConfirmacion}
        puesto={puestoSeleccionado}
        razon={accionSeleccionada}
        onConfirmar={handleEjecutarAccion}
        loading={cargandoAccion}
      />
    </>
  );
};

export default TablaPuestos;