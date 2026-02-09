import { Table, Badge, Group, ActionIcon, Text, ScrollArea } from '@mantine/core';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

const TablaPuestos = ({ puestos }) => {

  if (puestos.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#666',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <Text size="lg">No hay puestos registrados</Text>
        <Text size="sm" style={{ marginTop: '10px' }}>
          Este afiliado no tiene puestos asignados
        </Text>
      </div>
    );
  }
  const rows = puestos.map((puesto) => (
    <Table.Tr key={puesto.id} style={{ borderBottom: '1px solid #eee' }}>
      <Table.Td>
        <Text fw={600} style={{ color: '#0f0f0f' }}>
          {puesto.nro}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.fila}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.cuadra}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {new Date(puesto.fecha_obtencion).toLocaleDateString('es-ES')}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {puesto.rubro}
        </Text>
      </Table.Td>
      
      <Table.Td>
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            size="sm"
            style={{
              color: '#0f0f0f',
              '&:hover': {
                backgroundColor: 'rgba(15, 15, 15, 0.1)',
              },
            }}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            style={{
              color: '#edbe3c',
              '&:hover': {
                backgroundColor: 'rgba(237, 190, 60, 0.1)',
              },
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            style={{
              color: '#F44336',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
              },
            }}
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
            <Table.Th >Nro</Table.Th>
            <Table.Th >Fila</Table.Th>
            <Table.Th >Cuadra</Table.Th>
            <Table.Th >Fecha Obtención</Table.Th>
            <Table.Th >Rubro</Table.Th>
            
            <Table.Th >Opciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default TablaPuestos;