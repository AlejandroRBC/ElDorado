import { useEffect, useState } from 'react';
import { Table, Badge, Group, ActionIcon, Text, ScrollArea, Loader, Center, Stack } from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconMapPin } from '@tabler/icons-react';

// ─── Constante de API (igual que en afiliadosService.js) ───────────────────
const API_URL = 'http://localhost:3000/api';

/**
 * TablaPuestos
 *
 * Antes: recibía un prop `puestos` con datos ya procesados (y con campos erróneos).
 * Ahora: recibe `afiliadoId` y consulta directamente GET /api/afiliados/:id/puestos
 *        que devuelve los puestos activos (fecha_fin IS NULL) con los campos reales de la BD.
 */
const TablaPuestos = ({ afiliadoId, onRefresh }) => {
  const [puestos, setPuestos]     = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);

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

  // Permite que el padre fuerce un re-fetch (e.g. tras asignar un nuevo puesto)
  useEffect(() => {
    if (onRefresh) cargarPuestos();
  }, [onRefresh]);

  // ── Estados de carga / error / vacío ─────────────────────────────────────
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

  // ── Tabla con los campos reales que devuelve el backend ───────────────────
  // El endpoint GET /api/afiliados/:id/puestos devuelve:
  //   id_puesto, fila, cuadra, nroPuesto, rubro, tiene_patente, fecha_ini
  const rows = puestos.map((puesto) => (
    <Table.Tr key={puesto.id_puesto} style={{ borderBottom: '1px solid #eee' }}>

      {/* Nro de puesto — campo real: nroPuesto */}
      <Table.Td>
        <Text fw={600} style={{ color: '#0f0f0f' }}>
          {puesto.nroPuesto}
        </Text>
      </Table.Td>

      {/* Fila */}
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>{puesto.fila}</Text>
      </Table.Td>

      {/* Cuadra */}
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>{puesto.cuadra}</Text>
      </Table.Td>

      {/* Fecha de obtención — campo real: fecha_ini */}
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.fecha_ini
            ? new Date(puesto.fecha_ini).toLocaleDateString('es-ES')
            : '—'}
        </Text>
      </Table.Td>

      {/* Rubro */}
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.rubro || <span style={{ color: '#999', fontStyle: 'italic' }}>Sin rubro</span>}
        </Text>
      </Table.Td>

      {/* Patente */}
      <Table.Td>
        <Badge
          color={puesto.tiene_patente ? 'green' : 'gray'}
          variant="light"
          size="sm"
        >
          {puesto.tiene_patente ? 'Con patente' : 'Sin patente'}
        </Badge>
      </Table.Td>

      {/* Acciones (placeholders — ampliar según necesidad) */}
      <Table.Td>
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            size="sm"
            title="Ver detalle"
            style={{ color: '#0f0f0f' }}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            title="Editar"
            style={{ color: '#edbe3c' }}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            title="Eliminar"
            style={{ color: '#F44336' }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
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
          minWidth: '800px',
        }}
      >
        <Table.Thead style={{ backgroundColor: '#f6f8fe' }}>
          <Table.Tr>
            <Table.Th>Nro</Table.Th>
            <Table.Th>Fila</Table.Th>
            <Table.Th>Cuadra</Table.Th>
            <Table.Th>Fecha Obtención</Table.Th>
            <Table.Th>Rubro</Table.Th>
            <Table.Th>Patente</Table.Th>
            <Table.Th>Opciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default TablaPuestos;