import {
  Table,
  Button,
  Badge,
  Group,
  Loader,
  Text,
  Tabs,
  TextInput,
  Box,
  Switch
} from '@mantine/core';
import {
  IconUserOff,
  IconUserCheck,
  IconEdit,
  IconHistory,
  IconUsers
} from '@tabler/icons-react';
import { useMediaQuery } from 'react-responsive';
import useUsuarioList from '../Hooks/useUsuarioList';
import '../Styles/usuario.css';

// ============================================
// COMPONENTE DE LISTA DE USUARIOS
// ============================================

/**
 * Lista principal de usuarios con dos paneles:
 *  - "Usuarios": tabla con filtro de estado (switch toggle)
 *  - "Historial": tabla de auditoría con filtros de fecha e ID
 * Responsive con react-responsive.
 *
 * @param {Function} onEditar - Callback al hacer clic en editar
 */
const UsuarioList = ({ onEditar }) => {
  const {
    usuarios,
    loading,
    filtro,
    setFiltro,
    desactivar,
    reactivar,
    historial,
    loadingHistorial,
    filtroHistorial,
    setFiltroHistorial
  } = useUsuarioList();

  // ── Breakpoints responsive ──
  const isMobile  = useMediaQuery({ maxWidth: 640 });
  const isTablet  = useMediaQuery({ minWidth: 641, maxWidth: 1024 });

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  /**
   * Color del badge según el rol del usuario
   */
  const getRolColor = (rol) => {
    switch (rol) {
      case 'superadmin': return 'red';
      case 'admin':      return 'orange';
      default:           return 'blue';
    }
  };

  /**
   * Etiqueta legible del rol
   */
  const getRolLabel = (rol) => {
    switch (rol) {
      case 'superadmin': return 'Super Admin';
      case 'admin':      return 'Admin';
      default:           return rol;
    }
  };

  // Loader inicial
  if (loading) {
    return <Loader size="lg" className="usuario-list-loader" color="yellow" />;
  }

  // ── Columnas de cabecera ──
  const columnasUsuarios  = ['ID', 'Usuario', 'Afiliado', 'Rol', 'Estado', 'F. Inicio', 'F. Fin', 'Acciones'];
  const columnasHistorial = ['ID', 'Usuario', 'Afiliado', 'Rol', 'Fecha', 'Hora', 'Motivo', 'Realizado por'];

  return (
    <div className="usuario-list">
      <Tabs defaultValue="lista" classNames={{ root: 'usuario-tabs' }}>
        <Tabs.List>
          <Tabs.Tab value="lista" leftSection={<IconUsers size={16} />}>
            Usuarios
          </Tabs.Tab>
          <Tabs.Tab value="historial" leftSection={<IconHistory size={16} />}>
            Historial
          </Tabs.Tab>
        </Tabs.List>

        {/* ============================================
            PANEL DE USUARIOS
        ============================================ */}
        <Tabs.Panel value="lista" pt="md">

          {/* Encabezado con título + switch toggle */}
          <Group className="usuario-list-header">
            <Text className="usuario-list-title">USUARIOS DEL SISTEMA</Text>

            {/* Switch toggle: Activados ←→ Desactivados */}
            <div className="usuario-list-switch-wrapper">
              <Group gap={4} align="center">
                <IconUserCheck size={15} color={filtro === 'activo' ? '#0f0f0f' : '#aaa'} />
                <Text
                  size="sm"
                  className={`usuario-list-switch-label ${filtro === 'activo' ? 'active' : ''}`}
                >
                  Activos
                </Text>
              </Group>
              <Switch
                checked={filtro !== 'activo'}
                onChange={(e) => setFiltro(e.currentTarget.checked ? 'inactivo' : 'activo')}
                size="lg"
              />
              <Group gap={4} align="center">
                <IconUserOff size={15} color={filtro !== 'activo' ? '#0f0f0f' : '#aaa'} />
                <Text
                  size="sm"
                  className={`usuario-list-switch-label ${filtro !== 'activo' ? 'active' : ''}`}
                >
                  Inactivos
                </Text>
              </Group>
            </div>
          </Group>

          {/* Tabla estilo TablaAfiliados */}
          <Box className="usuario-table-scroll">
            <Table
              striped
              highlightOnHover
              verticalSpacing="md"
              horizontalSpacing="lg"
              className="usuario-table"
            >
              <Table.Thead>
                <Table.Tr>
                  {columnasUsuarios.map((col) => (
                    <Table.Th key={col}>{col}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {usuarios.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={8} className="usuario-table-empty">
                      No hay usuarios registrados
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  usuarios.map((user) => (
                    <Table.Tr key={user.id_usuario}>
                      <Table.Td>
                        <Text size="xs">{user.id_usuario}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={500}>{user.nom_usuario}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">{user.nombre_completo_afiliado || '—'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getRolColor(user.rol)} variant="light" size="sm">
                          {getRolLabel(user.rol)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {user.es_vigente ? (
                          <Badge color="green" size="sm">Activo</Badge>
                        ) : (
                          <Badge color="red" size="sm">Inactivo</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">
                          {new Date(user.fecha_ini_usuario).toLocaleDateString('es-ES')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {user.fecha_fin_usuario === 'VIGENTE' ? (
                          <Badge color="green" variant="dot" size="sm">VIGENTE</Badge>
                        ) : (
                          <Text size="xs">
                            {user.fecha_fin_usuario
                              ? new Date(user.fecha_fin_usuario).toLocaleDateString('es-ES')
                              : '—'}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group className="usuario-list-action-buttons">
                          {/* Botón editar */}
                          <Button
                            size="xs"
                            variant="subtle"
                            className="usuario-action-btn"
                            onClick={() => onEditar(user)}
                            title="Editar usuario"
                            style={{ color: '#0f0f0f' }}
                          >
                            <IconEdit size={16} />
                          </Button>

                          {/* Botón activar / desactivar */}
                          {user.es_vigente ? (
                            <Button
                              size="xs"
                              variant="subtle"
                              className="usuario-action-btn"
                              onClick={() => desactivar(user.id_usuario)}
                              title="Desactivar usuario"
                              style={{ color: '#fa5252' }}
                            >
                              <IconUserOff size={16} />
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              variant="subtle"
                              className="usuario-action-btn"
                              onClick={() => reactivar(user.id_usuario)}
                              title="Reactivar usuario"
                              style={{ color: '#40c057' }}
                            >
                              <IconUserCheck size={16} />
                            </Button>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Box>
        </Tabs.Panel>

        {/* ============================================
            PANEL DE HISTORIAL
        ============================================ */}
        <Tabs.Panel value="historial" pt="md">

          {/* Encabezado estilo ModalMostrarHistorial */}
          <div className="usuario-historial-header"
            style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '0' }}
          >
            <Group align="center" gap="xs">
              <Text className="usuario-historial-title">HISTORIAL DE USUARIOS</Text>
              <Box className="usuario-historial-title-underline" />
            </Group>

            {/* Filtros de historial */}
            <Group
              className="usuario-historial-filtros"
              style={{ flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}
            >
              <TextInput
                placeholder="ID Usuario"
                value={filtroHistorial.id_usuario}
                onChange={(e) =>
                  setFiltroHistorial({ ...filtroHistorial, id_usuario: e.target.value })
                }
                className="usuario-list-filtro-input usuario-list-filtro-id"
                style={{ width: isMobile ? '100%' : '120px' }}
              />
              <TextInput
                placeholder="Desde"
                type="date"
                value={filtroHistorial.desde}
                onChange={(e) =>
                  setFiltroHistorial({ ...filtroHistorial, desde: e.target.value })
                }
                className="usuario-list-filtro-input usuario-list-filtro-fecha"
                style={{ width: isMobile ? '100%' : '160px' }}
              />
              <TextInput
                placeholder="Hasta"
                type="date"
                value={filtroHistorial.hasta}
                onChange={(e) =>
                  setFiltroHistorial({ ...filtroHistorial, hasta: e.target.value })
                }
                className="usuario-list-filtro-input usuario-list-filtro-fecha"
                style={{ width: isMobile ? '100%' : '160px' }}
              />
            </Group>
          </div>

          {/* Tabla de historial */}
          {loadingHistorial ? (
            <Loader size="lg" className="usuario-list-loader" color="yellow" />
          ) : (
            <Box className="usuario-table-scroll">
              <Table
                verticalSpacing="md"
                horizontalSpacing="lg"
                variant="unstyled"
                className="usuario-table"
              >
                <Table.Thead>
                  <Table.Tr>
                    {columnasHistorial.map((col) => (
                      <Table.Th key={col}>{col}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {historial.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={8} className="usuario-table-empty">
                        No hay registros en el historial
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    historial.map((item) => (
                      <Table.Tr key={item.id_historial_usu} style={{ textAlign: 'center' }}>
                        <Table.Td><Text size="xs">{item.id_usuario}</Text></Table.Td>
                        <Table.Td><Text size="xs" fw={500}>{item.nom_usuario_esclavo}</Text></Table.Td>
                        <Table.Td><Text size="xs">{item.nom_afiliado_esclavo || '----'}</Text></Table.Td>
                        <Table.Td>
                          <Badge color={getRolColor(item.rol)} size="sm" variant="light">
                            {getRolLabel(item.rol)}
                          </Badge>
                        </Table.Td>
                        <Table.Td><Text size="xs">{item.fecha}</Text></Table.Td>
                        <Table.Td><Text size="xs">{item.hora}</Text></Table.Td>
                        <Table.Td className="usuario-table-motivo-cell">
                          <Text size="xs" c="dimmed">{item.motivo || 'Sin detalles'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs">
                            {item.nom_usuario_master} — {item.nom_afiliado_master}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Box>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default UsuarioList;