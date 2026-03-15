import { useEffect, useState } from 'react';
import { Table, Badge, Group, ActionIcon, Text, ScrollArea, Loader, Center, Stack, Menu } from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconMapPin, IconTransfer, IconDotsVertical } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { afiliadosService } from '../services/afiliadosService';
// import ModalEditarPuesto    from './ModalEditarPuesto';
// import ModalDetallePuesto   from './ModalDetallePuesto';
import { ModalEditarPuesto }    from '../../GestionPatentesPuestos/components/ModalEditarPuesto';
import { ModalMostrarHistorial } from '../../GestionPatentesPuestos/components/ModalMostrarHistorial';
import { puestosService } from '../../GestionPatentesPuestos/service/puestosService';

import ModalAccionPuesto    from './ModalAccionPuesto';
import ModalConfirmarAccion from './ModalConfirmarAccion';

const TablaPuestos = ({ afiliadoId, onRefresh, onTraspaso }) => {
  const [puestos,                  setPuestos]                  = useState([]);
  const [cargando,                 setCargando]                 = useState(true);
  const [error,                    setError]                    = useState(null);
  const [modalEditarAbierto,       setModalEditarAbierto]       = useState(false);
  const [puestoSeleccionado,       setPuestoSeleccionado]       = useState(null);
  const [modalDetalleAbierto,      setModalDetalleAbierto]      = useState(false);
  const [puestoParaDetalle,        setPuestoParaDetalle]        = useState(null);
  const [modalAccionAbierto,       setModalAccionAbierto]       = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [accionSeleccionada,       setAccionSeleccionada]       = useState(null);
  const [cargandoAccion,           setCargandoAccion]           = useState(false);

  const cargarPuestos = async () => {
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
  };

  useEffect(() => { cargarPuestos(); }, [afiliadoId]);

  const handleRefresh = () => {
    cargarPuestos();
    if (onRefresh) onRefresh();
  };

  const handleEditar     = (puesto) => { setPuestoSeleccionado(puesto); setModalEditarAbierto(true); };
  const handleVerDetalle = (puesto) => { setPuestoParaDetalle(puesto);  setModalDetalleAbierto(true); };
  const handleEliminar   = (puesto) => { setPuestoSeleccionado(puesto); setModalAccionAbierto(true); };

  const handleSeleccionarAccion = (razon) => {
    setAccionSeleccionada(razon);
    setModalAccionAbierto(false);
    setModalConfirmacionAbierto(true);
  };

  const handleEjecutarAccion = async () => {
    try {
      setCargandoAccion(true);
      const result = await afiliadosService.desasignarPuesto(
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
      console.error('Error:', err);
      notifications.show({ title: '❌ Error', message: err.message, color: 'red' });
    } finally {
      setCargandoAccion(false);
    }
  };
  const handleGuardarPuesto = async (formData) => {
    try {
      await puestosService.actualizarPuesto(puestoSeleccionado.id_puesto, formData);
      notifications.show({ title: '✅ Éxito', message: 'Puesto actualizado correctamente', color: 'green' });
      setModalEditarAbierto(false);
      setPuestoSeleccionado(null);
      cargarPuestos();
      if (onRefresh) onRefresh();
    } catch (err) {
      notifications.show({ title: '❌ Error', message: err.message || 'No se pudo actualizar el puesto', color: 'red' });
    }
  };

  if (cargando) return <Center py="xl"><Loader size="sm" color="dark" /></Center>;

  if (error) return <Center py="xl"><Text c="red" size="sm">{error}</Text></Center>;

  if (puestos.length === 0) {
    return (
      <Stack align="center" gap="xs" py="xl" style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '40px', color: '#666' }}>
        <IconMapPin size={40} style={{ color: '#ccc' }} />
        <Text size="lg">No hay puestos asignados</Text>
        <Text size="sm" c="dimmed">Este afiliado no tiene puestos activos</Text>
      </Stack>
    );
  }

  const rows = puestos.map((puesto) => (
    <Table.Tr key={puesto.id_puesto} style={{ borderBottom: '1px solid #eee' }}>
      <Table.Td><Text fw={600} style={{ color: '#0f0f0f' }}>{puesto.nroPuesto}</Text></Table.Td>
      <Table.Td><Text fw={600} style={{ color: '#0f0f0f' }}>{puesto.nro_patente}</Text></Table.Td>
      <Table.Td><Text size="sm" style={{ color: '#666' }}>{puesto.fila}</Text></Table.Td>
      <Table.Td><Text size="sm" style={{ color: '#666' }}>{puesto.cuadra}</Text></Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.fecha_ini ? new Date(puesto.fecha_ini).toLocaleDateString('es-ES') : '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.rubro || <span style={{ color: '#999', fontStyle: 'italic' }}>Sin rubro</span>}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={puesto.tiene_patente ? 'green' : 'yellow'} variant="dot">
          {puesto.tiene_patente ? 'CON PATENTE' : 'SIN PATENTE'}
        </Badge>
        {puesto.ancho && puesto.largo && (
          <Text size="xs" c="dimmed" mt={4}>{puesto.ancho}m x {puesto.largo}m</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Menu shadow="md" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
          <Menu.Target>
            <ActionIcon
              variant="subtle" size="md"
              aria-label="Acciones del puesto"
              style={{ color: '#0f0f0f', backgroundColor: '#f6f8fe' }}
            >
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEye size={16} />} description="Ver información completa del puesto" onClick={() => handleVerDetalle(puesto)}>
              Historial
            </Menu.Item>
            <Menu.Item leftSection={<IconTransfer size={16} />} description="Transferir el puesto a otro afiliado" color="blue"
              onClick={() => { if (onTraspaso) onTraspaso(puesto, handleRefresh); }}
            >
              Traspasar
            </Menu.Item>
            <Menu.Item leftSection={<IconEdit size={16} />} description="Modificar rubro, patente o dimensiones" color="yellow" onClick={() => handleEditar(puesto)}>
              Editar
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconTrash size={16} />} description="Liberar o despojar el puesto" color="red" onClick={() => handleEliminar(puesto)}>
              Desasignar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <ScrollArea>
        <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="lg"
          style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', minWidth: '900px' }}
        >
          <Table.Thead style={{ backgroundColor: '#f6f8fe' }}>
            <Table.Tr>
              {['Nro','Nro.Patente', 'Fila', 'Cuadra', 'Fecha Obtención', 'Rubro', 'Patente / Dimensiones', 'Acciones'].map((col) => (
                <Table.Th key={col}>{col}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      {/* <ModalEditarPuesto
        opened={modalEditarAbierto}
        onClose={() => { setModalEditarAbierto(false); setPuestoSeleccionado(null); }}
        puesto={puestoSeleccionado}
        onPuestoActualizado={() => { cargarPuestos(); if (onRefresh) onRefresh(); }}
      />
      <ModalDetallePuesto
        opened={modalDetalleAbierto}
        onClose={() => { setModalDetalleAbierto(false); setPuestoParaDetalle(null); }}
        puesto={puestoParaDetalle}
      /> */}
      <ModalEditarPuesto
  opened={modalEditarAbierto}
  close={() => { setModalEditarAbierto(false); setPuestoSeleccionado(null); }}
  puesto={puestoSeleccionado}
  onGuardar={handleGuardarPuesto}
/>
<ModalMostrarHistorial
  opened={modalDetalleAbierto}
  close={() => { setModalDetalleAbierto(false); setPuestoParaDetalle(null); }}
  puesto={puestoParaDetalle}
/>
      <ModalAccionPuesto
        opened={modalAccionAbierto}
        onClose={() => { setModalAccionAbierto(false); setPuestoSeleccionado(null); }}
        puesto={puestoSeleccionado}
        onConfirm={handleSeleccionarAccion}
      />
      <ModalConfirmarAccion
        opened={modalConfirmacionAbierto}
        onClose={() => { setModalConfirmacionAbierto(false); setPuestoSeleccionado(null); setAccionSeleccionada(null); }}
        puesto={puestoSeleccionado}
        razon={accionSeleccionada}
        onConfirmar={handleEjecutarAccion}
        loading={cargandoAccion}
      />
    </>
  );
};

export default TablaPuestos;