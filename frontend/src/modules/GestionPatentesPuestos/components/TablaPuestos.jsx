// frontend/src/modules/GestionPatentesPuestos/components/TablaPuestos.jsx

// ============================================
// COMPONENTE TABLA PUESTOS
// ============================================

import { Text, Badge, ActionIcon, Menu, Stack, Loader } from '@mantine/core';
import { IconUserPlus, IconDotsVertical, IconEye,
         IconArrowsExchange, IconEdit } from '@tabler/icons-react';
import '../Styles/gestionpatentespuestos.css';

/**
 * Tabla de puestos con diseño unificado estilo TablaAfiliados.
 * Las filas con nroPuesto > 10000 son pasos y se muestran en gris.
 * El menú de acciones usa un botón amarillo con hover negro.
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

  if (loading) {
    return (
      <Stack align="center" p="xl">
        <Loader color="yellow" />
        <Text size="sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Actualizando datos...</Text>
      </Stack>
    );
  }

  const columnas = [
    'N° Puesto', 'Patente', 'Fila/Cuadra', 'Estado',
    'Ancho/Largo', 'Apoderado', 'CI', 'Fecha Adquisición', 'Rubro', 'Acciones',
  ];

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '60px' }}>
      <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', fontFamily: 'Poppins, sans-serif' }}>
        <thead>
          <tr style={{ backgroundColor: '#F6F9FF' }}>
            {columnas.map((col, i) => (
              <th
                key={col}
                style={{
                  fontFamily:     'Poppins, sans-serif',
                  fontWeight:     600,
                  fontSize:       '11px',
                  color:          '#0f0f0f',
                  textTransform:  'uppercase',
                  letterSpacing:  '0.07em',
                  padding:        '12px 16px',
                  textAlign:      'center',
                  whiteSpace:     'nowrap',          
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {puestos.map((puesto, i) => {
            const esPaso = Number(puesto.nroPuesto) > 10000;

            // ── Filas paso: siempre gris oscuro, sin hover ──
            if (esPaso) {
              return (
                <tr key={puesto.id_puesto} style={{ backgroundColor: '#b0b0b0' }}>
                  <td colSpan={10} style={{ padding: '6px 0' }} />
                </tr>
              );
            }

            // ── Filas normales ──
            const bgBase = i % 2 === 0 ? 'white' : '#fafafa';
            return (
              <tr
                key={puesto.id_puesto}
                style={{ backgroundColor: bgBase, borderBottom: '1px solid #f0f0f0' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eee'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgBase}
              >
                <td style={{ fontWeight: 700, padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  {puesto.nroPuesto}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  {puesto.nro_patente || '—'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  {puesto.fila} - {puesto.cuadra}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <Badge color={puesto.tiene_patente ? 'green' : 'yellow'} variant="dot">
                    {puesto.tiene_patente ? 'CON PATENTE' : 'SIN PATENTE'}
                  </Badge>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  {puesto.ancho}m - {puesto.largo}m
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  {puesto.apoderado || 'VACANTE'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  {puesto.ci || '—'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  {puesto.fecha_adquisicion || '—'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  {puesto.rubro || '—'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <Menu shadow="md" width={200} position="left-start">
                    <Menu.Target>
                      <ActionIcon className="gp-action-btn" radius="xl">
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onVerHistorial(puesto)}>
                        Ver Historial
                      </Menu.Item>
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