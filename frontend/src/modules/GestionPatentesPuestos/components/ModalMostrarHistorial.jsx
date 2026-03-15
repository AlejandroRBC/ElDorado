// frontend/src/modules/GestionPatentesPuestos/components/ModalMostrarHistorial.jsx

// ============================================
// COMPONENTE MODAL MOSTRAR HISTORIAL
// ============================================

import { Modal, Table, Loader, Text, Stack, Group, Box, Button } from '@mantine/core';
import { useEffect, useState }                                    from 'react';
import { obtenerHistorialPuesto }                                 from '../service/historialService';
import { exportarHistorialExcel }                                 from '../exports/historialExport';
import '../Styles/gestionpatentespuestos.css';

/**
 * Modal que muestra el historial de asignaciones de un puesto.
 * Permite exportar el historial a Excel con un reporte individual.
 *
 * opened - Si el modal está visible
 * close  - Callback para cerrar el modal
 * puesto - Objeto con datos del puesto { id_puesto, nroPuesto, cuadra, fila }
 */
export function ModalMostrarHistorial({ opened, close, puesto }) {
  const [historial, setHistorial] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const id = puesto?.id_puesto ?? puesto?.id;

  /**
   * Carga el historial del puesto desde el backend.
   */
  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerHistorialPuesto(id);
      setHistorial(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && opened) cargarHistorial();
  }, [id, opened]);

  const columnas = ['Fecha', 'Hora', 'Tipo', 'Afiliado', 'Motivo', 'Usuario'];

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="95%"
      radius="lg"
      withCloseButton={false}
      padding={0}
    >
      <Box p="xl">

        {/* ── Encabezado ── */}
        <Group justify="space-between" mb="xl" align="flex-end">
          <Group align="center" gap="xs">
            <Text className="gp-historial-titulo">HISTORIAL DEL PUESTO</Text>
            <Box className="gp-historial-underline" />
          </Group>
          <Group gap={40}>
            <Text fw={700} size="lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Puesto N. {puesto?.nroPuesto || '---'}
            </Text>
            <Text fw={700} size="lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Cuadra N. {puesto?.cuadra || '---'}
            </Text>
            <Text fw={700} size="lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Fila {puesto?.fila || '---'}
            </Text>
          </Group>
        </Group>

        {/* ── Tabla historial ── */}
        {loading ? (
          <Stack align="center" py={50}>
            <Loader color="yellow" />
            <Text style={{ fontFamily: 'Poppins, sans-serif' }}>Cargando historial...</Text>
          </Stack>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <table className="gp-tabla" style={{ width: '100%' }}>
              <thead>
                <tr>
                  {columnas.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', color: '#C4C4C4', padding: '40px' }}>
                      No hay historial para este puesto
                    </td>
                  </tr>
                ) : (
                  historial.map((reg, i) => (
                    <tr
                      key={i}
                      style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eee'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#fafafa'}
                    >
                      <td><Text size="xs">{reg.fecha_ini || '00/00/0000'}</Text></td>
                      <td><Text size="xs">{reg.hora_accion || '00:00:00'}</Text></td>
                      <td><Text size="xs">{reg.razon || 'Traspaso'}</Text></td>
                      <td style={{ maxWidth: '250px' }}><Text size="xs" fw={500}>{reg.afiliado}</Text></td>
                      <td style={{ maxWidth: '200px' }}><Text size="xs" c="dimmed">{reg.motivo || 'Sin detalles'}</Text></td>
                      <td><Text size="xs">{reg.usuario || 'Administrador'}</Text></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        )}

        {/* ── Botones ── */}
        <Group justify="flex-end" mt={50} gap="md">
           <Button className="gp-btn-cerrar" size="md" px={50} onClick={close}>
            Cerrar
          </Button>
          <Button className="gp-btn-reporte" size="md" px={30} onClick={() => exportarHistorialExcel(historial)}>
            Hacer un Reporte Individual
          </Button>
         
        </Group>
      </Box>
    </Modal>
  );
}