import { memo, useCallback } from 'react';
import { Table, Badge, Group, ActionIcon, Text, ScrollArea } from '@mantine/core';
import { IconUserCheck, IconEdit, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../../context/LoginContext';

import '../styles/Estilos.css';

// ==============================================
// CONSTANTES
// ==============================================
const COLUMNAS = ['Nombre', 'CI', 'Ocupación', 'Puestos', 'Acciones'];

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

const getNombreCompleto = (afiliado) =>
  `${afiliado.nombre || ''} ${afiliado.paterno || ''} ${afiliado.materno || ''}`.trim();

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

/**
 * Tabla compacta de afiliados — padding y márgenes reducidos
 * para que encaje en pantalla sin scroll horizontal innecesario.
 */
const TablaAfiliados = memo(({ afiliados = [], esDeshabilitados = false, onRehabilitar }) => {
  const navigate = useNavigate();
  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  const verDetalles    = useCallback((id) => navigate(`/afiliados/${id}`),        [navigate]);
  const editarAfiliado = useCallback((id) => navigate(`/afiliados/editar/${id}`), [navigate]);

  const handleRehabilitar = useCallback((id, e) => {
    e.stopPropagation();
    onRehabilitar?.(id);
  }, [onRehabilitar]);

  // ── Estado vacío ─────────────────────────────────────────────
  if (afiliados.length === 0) {
    return (
      <div className="tabla-vacia">
        <Text size="lg">No hay afiliados para mostrar</Text>
        <Text size="sm" className="tabla-vacia-subtitulo">
          Utiliza los filtros o añade nuevos afiliados
        </Text>
      </div>
    );
  }

  // ── Filas ─────────────────────────────────────────────────────
  const rows = afiliados.map((afiliado) => {
    const nombreCompleto = getNombreCompleto(afiliado);

    return (
      <Table.Tr
        key={afiliado.id}
        className="tabla-fila-afiliado"
        onClick={() => verDetalles(afiliado.id)}
      >
        {/* Nombre */}
        <Table.Td style={{ maxWidth: 220 }}>
          <Text fw={500} size="sm" className="texto-nombre-tabla" lineClamp={1}>
            {nombreCompleto}
          </Text>
        </Table.Td>

        {/* CI */}
        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm" className="texto-ci-tabla">{afiliado.ci}</Text>
        </Table.Td>

        {/* Ocupación */}
        <Table.Td style={{ maxWidth: 160 }}>
          <Text size="sm" className="texto-ocupacion-tabla" lineClamp={1}>
            {afiliado.ocupacion || '—'}
          </Text>
        </Table.Td>

        {/* Puestos */}
        <Table.Td>
          <Group gap={3} wrap="wrap">
            {afiliado.puestosDetalle?.length > 0 ? (
              afiliado.puestosDetalle.map((p, i) => (
                <Badge
                  key={i}
                  size="xs"
                  className={`badge-puesto ${p.tienePatente ? 'badge-puesto-patente' : 'badge-puesto-sin-patente'}`}
                >
                  {p.puestos}
                </Badge>
              ))
            ) : (
              <Text size="xs" className="texto-sin-puestos-tabla">Sin puestos</Text>
            )}
          </Group>
        </Table.Td>

        {/* Acciones */}
        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Group gap={2} className="acciones-tabla" wrap="nowrap">
            {esDeshabilitados ? (
              esSuperAdmin && (
                <ActionIcon variant="subtle" size="sm" aria-label="Rehabilitar"
                  className="accion-rehabilitar"
                  onClick={(e) => handleRehabilitar(afiliado.id, e)}>
                  <IconUserCheck size={15} />
                </ActionIcon>
              )
            ) : (
              <>
                <ActionIcon variant="subtle" size="sm" aria-label="Ver detalles"
                  className="accion-ver"
                  onClick={(e) => { e.stopPropagation(); verDetalles(afiliado.id); }}>
                  <IconEye size={15} />
                </ActionIcon>
                {esSuperAdmin && (
                  <ActionIcon variant="subtle" size="sm" aria-label="Editar"
                    className="accion-editar"
                    onClick={(e) => { e.stopPropagation(); editarAfiliado(afiliado.id); }}>
                    <IconEdit size={15} />
                  </ActionIcon>
                )}
              </>
            )}
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  // ── Render ────────────────────────────────────────────────────
  return (
    <ScrollArea className="tabla-scroll">
      <Table
        striped={!esDeshabilitados}
        highlightOnHover
        verticalSpacing="xs"
        horizontalSpacing="sm"
        style={{ tableLayout: 'fixed', width: '100%' }}
        className={`tabla-afiliados tabla-afiliados--compacta ${esDeshabilitados ? 'tabla-deshabilitados' : ''}`}
      >
        <Table.Thead className="tabla-header">
          <Table.Tr>
            <Table.Th className="tabla-header-columna" style={{ width: '28%' }}>Nombre</Table.Th>
            <Table.Th className="tabla-header-columna" style={{ width: '12%' }}>CI</Table.Th>
            <Table.Th className="tabla-header-columna" style={{ width: '18%' }}>Ocupación</Table.Th>
            <Table.Th className="tabla-header-columna" style={{ width: '34%' }}>Puestos</Table.Th>
            <Table.Th className="tabla-header-columna" style={{ width: '8%'  }}>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
});

TablaAfiliados.displayName = 'TablaAfiliados';
export default TablaAfiliados;