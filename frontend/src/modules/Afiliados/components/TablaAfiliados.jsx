import { memo, useCallback } from 'react';
import { Table, Badge, Group, ActionIcon, Text, ScrollArea } from '@mantine/core';
import { IconUserCheck, IconEdit, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../../context/LoginContext';

import '../styles/Estilos.css';

// ==============================================
// CONSTANTES
// ==============================================
const COLUMNAS = ['Nombre', 'CI', 'Ocupación', 'Puestos', '# Puestos', 'Teléfono', 'Acciones'];

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

const getBadgeColor = (puestosConPatente) => {
  return puestosConPatente > 0 ? 'green' : 'yellow';
};

const getNombreCompleto = (afiliado) => {
  return `${afiliado.nombre || ''} ${afiliado.paterno || ''} ${afiliado.materno || ''}`.trim();
};

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

/**
 * Tabla de afiliados.
 * El icono de edición solo se muestra a usuarios con rol superadmin.
 * El icono de ver detalles es libre para todos.
 */
const TablaAfiliados = memo(({ afiliados = [], esDeshabilitados = false, onRehabilitar }) => {
  const navigate = useNavigate();

  // ── Control de rol ──────────────────────────────────────────
  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  // ==============================================
  // HANDLERS DEL COMPONENTE
  // ==============================================

  const verDetalles = useCallback((id) => {
    navigate(`/afiliados/${id}`);
  }, [navigate]);

  const editarAfiliado = useCallback((id) => {
    navigate(`/afiliados/editar/${id}`);
  }, [navigate]);

  const handleRehabilitar = useCallback((id, e) => {
    e.stopPropagation();
    if (onRehabilitar) onRehabilitar(id);
  }, [onRehabilitar]);

  const handleClickFila = useCallback((id) => {
    verDetalles(id);
  }, [verDetalles]);

  // ==============================================
  // RENDERIZADO DE ESTADO VACÍO
  // ==============================================
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

  // ==============================================
  // RENDERIZADO DE FILAS
  // ==============================================
  const rows = afiliados.map((afiliado) => {
    const badgeColor = getBadgeColor(afiliado.puestos_con_patente);
    const nombreCompleto = getNombreCompleto(afiliado);

    return (
      <Table.Tr
        key={afiliado.id}
        className="tabla-fila-afiliado"
        onClick={() => handleClickFila(afiliado.id)}
      >
        <Table.Td>
          <Text fw={500} className="texto-nombre-tabla">
            {nombreCompleto}
          </Text>
        </Table.Td>

        <Table.Td>
          <Text size="sm" className="texto-ci-tabla">
            {afiliado.ci}
          </Text>
        </Table.Td>

        <Table.Td>
          <Text size="sm" className="texto-ocupacion-tabla">
            {afiliado.ocupacion}
          </Text>
        </Table.Td>

        <Table.Td>
          <Group gap={4} wrap="wrap">
            {afiliado.puestos?.length > 0 ? (
              afiliado.puestos.slice(0, 10).map((puesto, index) => (
                <Badge
                  key={index}
                  size="xs"
                  variant="outline"
                  className="badge-puesto-tabla"
                >
                  {puesto}
                </Badge>
              ))
            ) : (
              <Text size="xs" className="texto-sin-puestos-tabla">
                Sin puestos
              </Text>
            )}
          </Group>
        </Table.Td>

        <Table.Td>
          <Badge color={badgeColor} variant="dot" className="badge-total-puestos">
            {afiliado.total_puestos || 0} puestos
            {afiliado.puestos_con_patente > 0 && ` (${afiliado.puestos_con_patente} con patente)`}
          </Badge>
        </Table.Td>

        <Table.Td>
          <Text size="sm" className="texto-telefono-tabla">
            {afiliado.telefono}
          </Text>
        </Table.Td>

        <Table.Td>
          <Group gap={4} className="acciones-tabla">
            {esDeshabilitados ? (
              // Rehabilitar — solo superAdmin
              esSuperAdmin && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label="Rehabilitar afiliado"
                  className="accion-rehabilitar"
                  onClick={(e) => handleRehabilitar(afiliado.id, e)}
                >
                  <IconUserCheck size={16} />
                </ActionIcon>
              )
            ) : (
              <>
                {/* Ver detalles — libre para todos */}
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label="Ver detalles del afiliado"
                  className="accion-ver"
                  onClick={(e) => { e.stopPropagation(); verDetalles(afiliado.id); }}
                >
                  <IconEye size={16} />
                </ActionIcon>

                {/* Editar — solo superAdmin */}
                {esSuperAdmin && (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    aria-label="Editar afiliado"
                    className="accion-editar"
                    onClick={(e) => { e.stopPropagation(); editarAfiliado(afiliado.id); }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                )}
              </>
            )}
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  // ==============================================
  // RENDER PRINCIPAL
  // ==============================================
  return (
    <ScrollArea className="tabla-scroll">
      <Table
        striped={!esDeshabilitados}
        highlightOnHover
        verticalSpacing="md"
        horizontalSpacing="lg"
        className={`tabla-afiliados ${esDeshabilitados ? 'tabla-deshabilitados' : ''}`}
      >
        <Table.Thead className="tabla-header">
          <Table.Tr>
            {COLUMNAS.map((col) => (
              <Table.Th key={col} className="tabla-header-columna">
                {col}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
});

TablaAfiliados.displayName = 'TablaAfiliados';

export default TablaAfiliados;