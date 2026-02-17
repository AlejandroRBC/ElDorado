// frontend/src/modules/Afiliados/components/TablaPuestos.jsx (versión actualizada)
import { useEffect, useState } from 'react';
import { Table, Badge, Group, ActionIcon, Text, ScrollArea, Loader, Center, Stack } from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconMapPin } from '@tabler/icons-react';
import ModalEditarPuesto from './ModalEditarPuesto';
import ModalDetallePuesto from './ModalDetallePuesto';
import { notifications } from '@mantine/notifications';


const API_URL = 'http://localhost:3000/api';

const TablaPuestos = ({ afiliadoId, onRefresh }) => {
  const [puestos, setPuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [puestoParaDetalle, setPuestoParaDetalle] = useState(null);

  const cargarPuestos = async () => {
    if (!afiliadoId) return;
    try {
      setCargando(true);
      setError(null);

      const response = await fetch(`${API_URL}/afiliados/${afiliadoId}/puestos`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      setPuestos(data);
    } catch (err) {
      console.error('Error cargando puestos del afiliado:', err);
      setError(err.message || 'No se pudieron cargar los puestos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPuestos();
  }, [afiliadoId]);

  // Función para abrir modal de edición
  const handleEditar = (puesto) => {
    setPuestoSeleccionado(puesto);
    setModalEditarAbierto(true);
  };

  // Función para ver detalle del puesto (placeholder)
  const handleVerDetalle = (puesto) => {
    setPuestoParaDetalle(puesto);
    setModalDetalleAbierto(true);
  };

  // Función para eliminar puesto (desasignar)
  const handleEliminar = async (puesto) => {
    if (!confirm(`¿Estás seguro de desasignar el puesto ${puesto.nroPuesto}-${puesto.fila}-${puesto.cuadra}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/puestos/${puesto.id_puesto}/desasignar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_afiliado: afiliadoId,
          razon: 'LIBERADO'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al desasignar puesto');
      }

      notifications.show({
        title: '✅ Éxito',
        message: 'Puesto desasignado correctamente',
        color: 'green'
      });

      cargarPuestos(); // Recargar la lista
      if (onRefresh) onRefresh();
    } catch (err) {
      notifications.show({
        title: '❌ Error',
        message: err.message,
        color: 'red'
      });
    }
  };

  // Estados de carga / error / vacío
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
      <Stack
        align="center"
        gap="xs"
        py="xl"
        style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          padding: '40px',
          color: '#666',
        }}
      >
        <IconMapPin size={40} style={{ color: '#ccc' }} />
        <Text size="lg">No hay puestos asignados</Text>
        <Text size="sm" c="dimmed">Este afiliado no tiene puestos activos</Text>
      </Stack>
    );
  }

  const rows = puestos.map((puesto) => (
    <Table.Tr key={puesto.id_puesto} style={{ borderBottom: '1px solid #eee' }}>
      <Table.Td>
        <Text fw={600} style={{ color: '#0f0f0f' }}>
          {puesto.nroPuesto}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>{puesto.fila}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>{puesto.cuadra}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.fecha_ini
            ? new Date(puesto.fecha_ini).toLocaleDateString('es-ES')
            : '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.rubro || <span style={{ color: '#999', fontStyle: 'italic' }}>Sin rubro</span>}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={puesto.tiene_patente ? 'green' : 'gray'}
          variant="light"
          size="sm"
        >
          {puesto.tiene_patente ? 'Con patente' : 'Sin patente'}
        </Badge>
        {puesto.ancho && puesto.largo && (
          <Text size="xs" c="dimmed" mt={4}>
            {puesto.ancho}m x {puesto.largo}m
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            size="sm"
            title="Ver detalle"
            style={{ color: '#0f0f0f' }}
            onClick={() => handleVerDetalle(puesto)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            title="Editar"
            style={{ color: '#edbe3c' }}
            onClick={() => handleEditar(puesto)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            title="Desasignar"
            style={{ color: '#F44336' }}
            onClick={() => handleEliminar(puesto)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <ScrollArea>
        <Table
          striped
          highlightOnHover
          verticalSpacing="md"
          horizontalSpacing="lg"
          style={{
            border: '1px solid #eee',
            borderRadius: '8px',
            overflow: 'hidden',
            minWidth: '900px',
          }}
        >
          <Table.Thead style={{ backgroundColor: '#f6f8fe' }}>
            <Table.Tr>
              <Table.Th>Nro</Table.Th>
              <Table.Th>Fila</Table.Th>
              <Table.Th>Cuadra</Table.Th>
              <Table.Th>Fecha Obtención</Table.Th>
              <Table.Th>Rubro</Table.Th>
              <Table.Th>Patente / Dimensiones</Table.Th>
              <Table.Th>Opciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Modales */}
      <ModalEditarPuesto
        opened={modalEditarAbierto}
        onClose={() => {
          setModalEditarAbierto(false);
          setPuestoSeleccionado(null);
        }}
        puesto={puestoSeleccionado}
        onPuestoActualizado={() => {
          cargarPuestos(); // Recargar después de editar
          if (onRefresh) onRefresh();
        }}
      />
      <ModalDetallePuesto
        opened={modalDetalleAbierto}
        onClose={() => {
          setModalDetalleAbierto(false);
          setPuestoParaDetalle(null);
        }}
        puesto={puestoParaDetalle}
      />
    </>
  );
};

export default TablaPuestos;