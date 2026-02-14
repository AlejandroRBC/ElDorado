import { Table, Badge, Button, Group, Select, Loader, Text, Tabs, TextInput } from '@mantine/core';
import { IconUserOff, IconUserCheck, IconEdit, IconHistory } from '@tabler/icons-react';
import useUsuarioList from '../Hooks/useUsuarioList';
import '../Styles/usuario.css';

// ============================================
// COMPONENTE DE LISTA DE USUARIOS
// ============================================
const UsuarioList = ({ onEditar }) => {
  const { 
    usuarios, loading, filtro, setFiltro, desactivar, reactivar,
    historial, loadingHistorial, filtroHistorial, setFiltroHistorial 
  } = useUsuarioList();

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  const getRolColor = (rol) => {
    switch(rol) {
      case 'superadmin': return 'red';
      case 'admin': return 'orange';
      default: return 'blue';
    }
  };

  const getRolLabel = (rol) => {
    switch(rol) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'usuario': return 'Usuario';
      default: return rol;
    }
  };

  if (loading) {
    return <Loader size="lg" className="usuario-list-loader" />;
  }

  return (
    <div className="usuario-list">
      <Tabs defaultValue="lista">
        <Tabs.List>
          <Tabs.Tab value="lista" leftSection={<IconUserCheck size={16} />}>
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
          <Group className="usuario-list-header">
            <Text className="usuario-list-title">Usuarios del Sistema</Text>
            <Select
              placeholder="Filtrar por estado"
              value={filtro}
              onChange={setFiltro}
              data={[
                { value: 'todos', label: 'Todos' },
                { value: 'activo', label: 'Activos' },
                { value: 'inactivo', label: 'Inactivos' }
              ]}
              className="usuario-list-filter"
            />
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Usuario</Table.Th>
                <Table.Th>Afiliado</Table.Th>
                <Table.Th>Rol</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Fecha Inicio</Table.Th>
                <Table.Th>Fecha Fin</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {usuarios.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8} className="usuario-list-empty">
                    No hay usuarios registrados
                  </Table.Td>
                </Table.Tr>
              ) : (
                usuarios.map((user) => (
                  <Table.Tr key={user.id_usuario}>
                    <Table.Td>{user.id_usuario}</Table.Td>
                    <Table.Td fw={500}>{user.nom_usuario}</Table.Td>
                    <Table.Td>{user.nombre_completo_afiliado || '—'}</Table.Td>
                    <Table.Td>
                      <Badge color={getRolColor(user.rol)} variant="light">
                        {getRolLabel(user.rol)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {user.es_vigente ? (
                        <Badge color="green">Activo</Badge>
                      ) : (
                        <Badge color="gray">Inactivo</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {new Date(user.fecha_ini_usuario).toLocaleDateString('es-ES')}
                    </Table.Td>
                    <Table.Td>
                      {user.fecha_fin_usuario === 'VIGENTE' ? (
                        <Badge color="green" variant="dot">VIGENTE</Badge>
                      ) : (
                        user.fecha_fin_usuario ? 
                          new Date(user.fecha_fin_usuario).toLocaleDateString('es-ES') 
                          : '—'
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group className="usuario-list-action-buttons">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => onEditar(user)}
                          title="Editar usuario"
                        >
                          <IconEdit size={16} />
                        </Button>
                        
                        {user.es_vigente ? (
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() => desactivar(user.id_usuario)}
                            title="Desactivar usuario"
                          >
                            <IconUserOff size={16} />
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            color="green"
                            variant="light"
                            onClick={() => reactivar(user.id_usuario)}
                            title="Reactivar usuario"
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
        </Tabs.Panel>

        {/* ============================================
            PANEL DE HISTORIAL
        ============================================ */}
        <Tabs.Panel value="historial" pt="md">
          <Group className="usuario-list-header">
            <Text className="usuario-list-title">Historial de Usuarios</Text>
            <Group className="usuario-list-filtros-historial">
              <TextInput
                placeholder="ID Usuario"
                value={filtroHistorial.id_usuario}
                onChange={(e) => setFiltroHistorial({...filtroHistorial, id_usuario: e.target.value})}
                className="usuario-list-filtro-id"
              />
              <TextInput
                placeholder="Desde"
                type="date"
                value={filtroHistorial.desde}
                onChange={(e) => setFiltroHistorial({...filtroHistorial, desde: e.target.value})}
                className="usuario-list-filtro-fecha"
              />
              <TextInput
                placeholder="Hasta"
                type="date"
                value={filtroHistorial.hasta}
                onChange={(e) => setFiltroHistorial({...filtroHistorial, hasta: e.target.value})}
                className="usuario-list-filtro-fecha"
              />
            </Group>
          </Group>

          {loadingHistorial ? (
            <Loader size="lg" className="usuario-list-loader" />
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Usuario</Table.Th>
                  <Table.Th>Afiliado</Table.Th>
                  <Table.Th>Rol</Table.Th>
                  <Table.Th>Fecha</Table.Th>
                  <Table.Th>Hora</Table.Th>
                  <Table.Th>Motivo</Table.Th>
                  <Table.Th>Realizado por</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {historial.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={8} className="usuario-list-empty">
                      No hay registros en el historial
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  historial.map((item) => (
                    <Table.Tr key={item.id_historial_usu}>
                      <Table.Td>{item.id_usuario}</Table.Td>
                      <Table.Td fw={500}>{item.nom_usuario_esclavo}</Table.Td>
                      <Table.Td>{item.nom_afiliado_esclavo || '----'}</Table.Td>
                      <Table.Td>
                        <Badge color={getRolColor(item.rol)} size="sm" variant="light">
                          {getRolLabel(item.rol)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{item.fecha}</Table.Td>
                      <Table.Td>{item.hora}</Table.Td>
                      <Table.Td className="usuario-list-motivo-cell">{item.motivo}</Table.Td>
                      <Table.Td>
                        {item.nom_usuario_master} - {item.nom_afiliado_master}
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default UsuarioList;