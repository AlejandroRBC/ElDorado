// frontend/src/modules/GestionPatentesPuestos/components/TablaPuestos.jsx

// ============================================
// COMPONENTE TABLA PUESTOS
// ============================================

import { Badge, ActionIcon, Menu, Stack, Loader, Text } from '@mantine/core';
import { IconUserPlus, IconDotsVertical, IconEye,
         IconArrowsExchange, IconEdit }                 from '@tabler/icons-react';
import { useLogin }                                     from '../../../context/LoginContext';
import '../Styles/gestionpatentespuestos.css';

/**
 * Tabla de puestos con diseño unificado estilo TablaAfiliados.
 * Las filas con nroPuesto > 10000 son pasos y se muestran en gris.
 * Los ADMIN solo pueden ver el historial.
 * Los superadmin pueden asignar, traspasar y editar.
 *
 * puestos        - Lista de puestos a renderizar
 * loading        - Muestra loader mientras carga
 * onVerHistorial - Callback para ver el historial del puesto
 * onEditar       - Callback para editar el puesto
 * onTraspaso     - Callback para realizar un traspaso
 * onAsignar      - Callback para asignar un afiliado al puesto
 */
export function TablaPuestos({
  puestos,
  loading,
  onVerHistorial,
  onEditar,
  onTraspaso,
  onAsignar,
}) {
  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  if (loading) {
    return (
      <Stack align="center" p="xl">
        <Loader color="yellow" />
        <Text size="sm" className="gp-tabla-loading">Actualizando datos...</Text>
      </Stack>
    );
  }

  const columnas = [
    'N° Puesto', 'Patente', 'Fila/Cuadra', 'Estado',
    'Ancho/Largo', 'Apoderado', 'CI', 'Fecha Adquisición', 'Rubro', 'Acciones',
  ];

  return (
    <div className="gp-tabla-scroll">
      <table className="gp-tabla">
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {puestos.map((puesto, i) => {
            const esPaso = Number(puesto.nroPuesto) > 10000;

            if (esPaso) {
              return (
                <tr key={puesto.id_puesto} className="gp-tabla-paso">
                  <td colSpan={10} />
                </tr>
              );
            }

            const bgBase = i % 2 === 0 ? 'white' : '#fafafa';
            return (
              <tr
                key={puesto.id_puesto}
                style={{ backgroundColor: bgBase }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eee'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgBase}
              >
                <td className="gp-tabla-td-bold">{puesto.nroPuesto}</td>
                <td>{puesto.nro_patente || '—'}</td>
                <td>{puesto.fila} - {puesto.cuadra}</td>
                <td>
                  <Badge color={puesto.tiene_patente ? 'green' : 'yellow'} variant="dot">
                    {puesto.tiene_patente ? 'CON PATENTE' : 'SIN PATENTE'}
                  </Badge>
                </td>
                <td>{puesto.ancho}m - {puesto.largo}m</td>
                <td>{puesto.apoderado || 'VACANTE'}</td>
                <td>{puesto.ci || '—'}</td>
                <td>{puesto.fecha_adquisicion || '—'}</td>
                <td>{puesto.rubro || '—'}</td>
                <td>
                  <Menu shadow="md" width={200} position="left-start">
                    <Menu.Target>
                      <ActionIcon className="gp-action-btn" radius="xl">
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>

                      {/* Historial — siempre visible */}
                      <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onVerHistorial(puesto)}>
                        Ver Historial
                      </Menu.Item>

                      {/* Asignar, traspasar, editar — solo superadmin */}
                      {esSuperAdmin && (
                        <>
                          <Menu.Item
                            leftSection={<IconUserPlus size={14} />}
                            onClick={() => onAsignar(puesto)}
                            description="Asignar este puesto a un afiliado"
                          >
                            Asignar Afiliado
                          </Menu.Item>
                          <Menu.Item leftSection={<IconArrowsExchange size={14} />} onClick={() => onTraspaso(puesto)}>
                            Hacer Traspaso
                          </Menu.Item>
                          <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEditar(puesto)}>
                            Editar
                          </Menu.Item>
                        </>
                      )}

                    </Menu.Dropdown>
                  </Menu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}