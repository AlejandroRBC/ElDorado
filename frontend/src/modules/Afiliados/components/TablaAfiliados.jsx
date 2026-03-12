import { memo } from 'react';
import { Table, Badge, Group, ActionIcon, Text, ScrollArea } from '@mantine/core';
import { IconUserCheck, IconEdit, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

// Columnas idénticas para activos y deshabilitados → constante
const COLUMNAS = ['Nombre', 'CI', 'Ocupación', 'Puestos', '# Puestos', 'Teléfono', 'Acciones'];

const TablaAfiliados = memo(({ afiliados = [], esDeshabilitados = false, onRehabilitar }) => {
  const navigate = useNavigate();

  const verDetalles    = (id) => navigate(`/afiliados/${id}`);
  const editarAfiliado = (id) => navigate(`/afiliados/editar/${id}`);

  const handleRehabilitar = (id, e) => {
    e.stopPropagation();
    if (onRehabilitar) onRehabilitar(id);
  };

  if (afiliados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <Text size="lg">No hay afiliados para mostrar</Text>
        <Text size="sm" style={{ marginTop: '10px' }}>
          Utiliza los filtros o añade nuevos afiliados
        </Text>
      </div>
    );
  }

  const rows = afiliados.map((afiliado) => (
    <Table.Tr
      key={afiliado.id}
      style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background-color 0.2s' }}
    >
      <Table.Td>
        <Text fw={500} style={{ color: '#0f0f0f' }}>
          {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>{afiliado.ci}</Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>{afiliado.ocupacion}</Text>
      </Table.Td>

      <Table.Td>
        <Group gap={4} wrap="wrap">
          {afiliado.patentes?.length > 0 ? (
            afiliado.patentes.slice(0, 10).map((patente, index) => (
              <Badge key={index} size="xs" variant="outline" style={{ borderColor: '#0f0f0f', color: '#0f0f0f', fontWeight: 500 }}>
                {patente}
              </Badge>
            ))
          ) : (
            <Text size="xs" style={{ color: '#999', fontStyle: 'italic' }}>Sin puestos</Text>
          )}
        </Group>
      </Table.Td>

      <Table.Td>
        <Badge color={afiliado.puestos_con_patente > 0 ? 'green' : 'yellow'} variant="dot">
          {afiliado.total_puestos || 0} puestos
          {afiliado.puestos_con_patente > 0 && ` (${afiliado.puestos_con_patente} con patente)`}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>{afiliado.telefono}</Text>
      </Table.Td>

      <Table.Td>
        <Group gap={4}>
          {esDeshabilitados ? (
            <ActionIcon
              variant="subtle" size="sm"
              aria-label="Rehabilitar afiliado"
              style={{ color: '#4CAF50' }}
              onClick={(e) => handleRehabilitar(afiliado.id, e)}
            >
              <IconUserCheck size={16} />
            </ActionIcon>
          ) : (
            <>
              <ActionIcon
                variant="subtle" size="sm"
                aria-label="Ver detalles del afiliado"
                style={{ color: '#0f0f0f' }}
                onClick={(e) => { e.stopPropagation(); verDetalles(afiliado.id); }}
              >
                <IconEye size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle" size="sm"
                aria-label="Editar afiliado"
                style={{ color: '#edbe3c' }}
                onClick={(e) => { e.stopPropagation(); editarAfiliado(afiliado.id); }}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Table
        striped={!esDeshabilitados}
        highlightOnHover
        verticalSpacing="md"
        horizontalSpacing="lg"
        style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', minWidth: esDeshabilitados ? '1400px' : '1300px' }}
      >
        <Table.Thead style={{ backgroundColor: '#f6f8fe' }}>
          <Table.Tr>
            {COLUMNAS.map((col) => <Table.Th key={col}>{col}</Table.Th>)}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
});

TablaAfiliados.displayName = 'TablaAfiliados';

export default TablaAfiliados;