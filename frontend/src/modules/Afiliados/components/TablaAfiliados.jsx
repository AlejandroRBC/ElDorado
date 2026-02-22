import { Table, Badge, Group, ActionIcon, Text, ScrollArea } from '@mantine/core';
import { IconUserCheck, IconEdit, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const TablaAfiliados = ({ afiliados = [], esDeshabilitados = false, onRehabilitar }) => {
  const navigate = useNavigate();

  const verDetalles = (id) => {
    navigate(`/afiliados/${id}`);
  };

  const editarAfiliado = (id) => {
    navigate(`/afiliados/editar/${id}`);
  };

  const handleRehabilitar = (id, e) => {
    e.stopPropagation();
    if (onRehabilitar) {
      onRehabilitar(id);
    }
  };


  if (afiliados.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#666'
      }}>
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
            afiliado.patentes.slice(0, 10).map((patente, index) => (
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
      
        <Badge 
          color={afiliado.puestos_con_patente > 0 ? "green" : "yellow"}
          variant="dot"
        >
          {afiliado.total_puestos || 0} puestos
          {afiliado.puestos_con_patente > 0 && ` (${afiliado.puestos_con_patente} con patente)`}
        </Badge>
      </Table.Td>
      
      <Table.Td>
        <Text size="sm" style={{ color: '#666' }}>
          {afiliado.telefono}
        </Text>
      </Table.Td>
      
      

      <Table.Td>
        <Group gap={4}>
          {esDeshabilitados ? (
            <ActionIcon
              variant="subtle"
              size="sm"
              title="Rehabilitar"
              style={{
                color: '#4CAF50',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                },
              }}
              onClick={(e) => handleRehabilitar(afiliado.id, e)}
            >
              <IconUserCheck size={16} />
            </ActionIcon>
          ) : (
            <>
              <ActionIcon
                variant="subtle"
                size="sm"
                style={{
                  color: '#0f0f0f',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 15, 15, 0.1)',
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  verDetalles(afiliado.id);
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
                onClick={(e) => {
                  e.stopPropagation();
                  editarAfiliado(afiliado.id);
                }}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const columns = esDeshabilitados 
    ? ['Nombre', 'CI', 'Ocupación', 'Puestos', '# Puestos', 'Teléfono', 'Acciones']
    : ['Nombre', 'CI', 'Ocupación', 'Puestos', '# Puestos', 'Teléfono', 'Acciones'];

    return (
    <ScrollArea>
      <Table
        striped={!esDeshabilitados}
        highlightOnHover
        verticalSpacing="md"
        horizontalSpacing="lg"
        style={{
          border: '1px solid #eee',
          borderRadius: '8px',
          overflow: 'hidden',
          minWidth: esDeshabilitados ? '1400px' : '1300px',
        }}
      >
        <Table.Thead style={{ backgroundColor: '#f6f8fe' }}>
          <Table.Tr>
            {columns.map(col => (
              <Table.Th key={col}>{col}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default TablaAfiliados;