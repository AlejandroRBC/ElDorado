import { Table, Badge, Group, ActionIcon, Text, ScrollArea } from '@mantine/core';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';


const TablaAfiliados = ({ afiliados = [] }) => {
  const navigate = useNavigate();

  const verDetalles = (id) => {
    navigate(`/afiliados/${id}`);
  };

  // Si no hay afiliados, mostrar mensaje
  if (afiliados.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#666'
      }}>
        <Text size="lg">No hay afiliados para mostrar</Text>
        <Text size="sm" style={{ marginTop: '10px' }}>
          Utiliza la búsqueda o añade nuevos afiliados
        </Text>
      </div>
    );
  }

  const rows = afiliados.map((afiliado) => (
    <Table.Tr 
      key={afiliado.id} 
      style={{ 
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: '#f9f9f9'
        }
      }}
      
    >
      <Table.Td>
        <Text fw={500} style={{ color: '#0f0f0f' }}>
          {afiliado.nombre}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {afiliado.ci}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {afiliado.ocupacion}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4} wrap="wrap">
          {afiliado.patentes && afiliado.patentes.length > 0 ? (
            afiliado.patentes.map((patente, index) => (
              <Badge
                key={index}
                size="xs"
                variant="outline"
                style={{
                  borderColor: '#0f0f0f',
                  color: '#0f0f0f',
                  fontWeight: 500,
                }}
              >
                {patente}
              </Badge>
            ))
          ) : (
            <Text size="xs" style={{ color: '#999', fontStyle: 'italic' }}>
              Sin puestos
            </Text>
          )}
        </Group>
      </Table.Td>
      
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {afiliado.telefono}
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
            onClick={() => verDetalles(afiliado.id)}
            
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
            onClick={(e) => {
              e.stopPropagation();
              alert(`Editar afiliado ${afiliado.id} (en desarrollo)`);
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
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`¿Estás seguro de eliminar a ${afiliado.nombre}?`)) {
                alert(`Eliminar afiliado ${afiliado.id} (en desarrollo)`);
              }
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
          minWidth: '1200px',
        }}
      >
        <Table.Thead style={{ backgroundColor: '#f6f8fe' }}>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>CI</Table.Th>
            <Table.Th>Ocupacion</Table.Th>
            <Table.Th>Puestos</Table.Th>
            <Table.Th>Teléfono</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default TablaAfiliados;