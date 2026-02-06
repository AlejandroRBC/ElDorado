import { Table, Badge, Group, ActionIcon, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

// Datos de ejemplo (mismos que en ListaCards)
const afiliadosEjemplo = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    ci: '1234567',
    rubro: 'Comercio',
    patentes: ['ABC-123', 'XYZ-789'],
    estado: 'Activo',
    telefono: '76543210',
    email: 'juan@example.com',
  },
  {
    id: 2,
    nombre: 'María García',
    ci: '7654321',
    rubro: 'Servicios',
    patentes: ['DEF-456'],
    estado: 'Activo',
    telefono: '71234567',
    email: 'maria@example.com',
  },
  {
    id: 3,
    nombre: 'Carlos López',
    ci: '9876543',
    rubro: 'Industria',
    patentes: ['GHI-789', 'JKL-012', 'MNO-345'],
    estado: 'Inactivo',
    telefono: '70123456',
    email: 'carlos@example.com',
  },
  {
    id: 4,
    nombre: 'Ana Martínez',
    ci: '4567890',
    rubro: 'Comercio',
    patentes: ['PQR-678'],
    estado: 'Activo',
    telefono: '79876543',
    email: 'ana@example.com',
  },
  {
    id: 5,
    nombre: 'Luis Rodríguez',
    ci: '2345678',
    rubro: 'Servicios',
    patentes: ['STU-901', 'VWX-234'],
    estado: 'Activo',
    telefono: '78901234',
    email: 'luis@example.com',
  },
  {
    id: 6,
    nombre: 'Sofía Fernández',
    ci: '8765432',
    rubro: 'Industria',
    patentes: ['YZA-567'],
    estado: 'Pendiente',
    telefono: '75678901',
    email: 'sofia@example.com',
  },
  {
    id: 7,
    nombre: 'Pedro Gómez',
    ci: '3456789',
    rubro: 'Comercio',
    patentes: ['BCD-890', 'EFG-123'],
    estado: 'Activo',
    telefono: '73456789',
    email: 'pedro@example.com',
  },
  {
    id: 8,
    nombre: 'Laura Díaz',
    ci: '5678901',
    rubro: 'Servicios',
    patentes: ['HIJ-456'],
    estado: 'Activo',
    telefono: '72345678',
    email: 'laura@example.com',
  },
];

// Función para determinar color del badge según estado
const getEstadoColor = (estado) => {
  switch (estado.toLowerCase()) {
    case 'activo': return '#4CAF50';
    case 'inactivo': return '#F44336';
    case 'pendiente': return '#FF9800';
    default: return '#9E9E9E';
  }
};

const TablaAfiliados = () => {
  const rows = afiliadosEjemplo.map((afiliado) => (
    <Table.Tr key={afiliado.id} style={{ borderBottom: '1px solid #eee' }}>
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
        <Badge
          variant="light"
          style={{
            backgroundColor: 'rgba(237, 190, 60, 0.1)',
            color: '#edbe3c',
            fontWeight: 600,
          }}
        >
          {afiliado.rubro}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={4} wrap="wrap">
          {afiliado.patentes.map((patente, index) => (
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
          ))}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge
          size="sm"
          style={{
            backgroundColor: getEstadoColor(afiliado.estado),
            color: 'white',
            fontWeight: 600,
          }}
        >
          {afiliado.estado}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {afiliado.telefono}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }} truncate>
          {afiliado.email}
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
    <Table
      striped
      highlightOnHover
      verticalSpacing="md"
      horizontalSpacing="lg"
      style={{
        border: '1px solid #eee',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Table.Thead style={{ backgroundColor: '#f6f8fe' }}>
        <Table.Tr>
          <Table.Th style={{ color: '#0f0f0f', fontWeight: 600 }}>Nombre</Table.Th>
          <Table.Th style={{ color: '#0f0f0f', fontWeight: 600 }}>CI</Table.Th>
          <Table.Th style={{ color: '#0f0f0f', fontWeight: 600 }}>Rubro</Table.Th>
          <Table.Th style={{ color: '#0f0f0f', fontWeight: 600 }}>Patentes</Table.Th>
          <Table.Th style={{ color: '#0f0f0f', fontWeight: 600 }}>Estado</Table.Th>
          <Table.Th style={{ color: '#0f0f0f', fontWeight: 600 }}>Teléfono</Table.Th>
          <Table.Th style={{ color: '#0f0f0f', fontWeight: 600 }}>Email</Table.Th>
          <Table.Th style={{ color: '#0f0f0f', fontWeight: 600 }}>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export default TablaAfiliados;