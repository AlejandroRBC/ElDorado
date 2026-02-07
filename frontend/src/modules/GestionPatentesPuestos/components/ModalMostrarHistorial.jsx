import { Modal, Table, Loader, Text, Stack, Group, Box, Button, Badge } from '@mantine/core';
import { useEffect, useState } from 'react';
import { obtenerHistorialPuesto } from '../service/historialService';

export function ModalMostrarHistorial({ opened, close, puesto }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (opened && puesto) {
      cargarHistorial();
    }
  }, [opened, puesto]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerHistorialPuesto(puesto.id_puesto || puesto.id);
      setHistorial(data);
    } catch (err) {
      setError('No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

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
        {/* ENCABEZADO ESTILO IMAGEN */}
        <Group justify="space-between" mb="xl" align="flex-end">
          <Group align="center" gap="xs">
            <Text fw={800} size="xl" style={{ letterSpacing: '1px' }}>HISTORIAL DEL PUESTO</Text>
            <Box style={{ borderBottom: '2px solid black', width: '200px', marginBottom: '8px' }} />
          </Group>
          
          <Group gap={40}>
            <Stack gap={0} align="center">
              <Text fw={700} size="lg">Puesto N. {puesto?.nroPuesto || '---'}</Text>
            </Stack>
            <Stack gap={0} align="center">
              <Text fw={700} size="lg">Cuadra N. {puesto?.cuadra || '---'}</Text>
            </Stack>
            <Stack gap={0} align="center">
              <Text fw={700} size="lg">Fila {puesto?.fila || '---'}</Text>
            </Stack>
          </Group>
        </Group>

        {loading ? (
          <Stack align="center" py={50}><Loader color="yellow" /><Text>Cargando historial...</Text></Stack>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table verticalSpacing="md" horizontalSpacing="sm" variant="unstyled">
              <Table.Thead>
                <Table.Tr>
                  {['Adquisición', 'Finalización', 'Hora', 'Motivo', 'Afiliado', 'Detalles', 'Usuario'].map((h) => (
                    <Table.Th key={h}>
                      <Badge variant="light" color="gray" size="lg" radius="sm" fullWidth style={{ backgroundColor: '#f1f3f5', color: '#495057' }}>
                        {h}
                      </Badge>
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {historial.map((reg, i) => (
                  <Table.Tr key={i} style={{ textAlign: 'center' }}>
                    <Table.Td><Text size="xs">{reg.fecha_ini || '00/00/0000'}</Text></Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={reg.fecha_fin ? 400 : 700}>
                        {reg.fecha_fin ? reg.fecha_fin : '(Aún Vigente)'}
                      </Text>
                    </Table.Td>
                    <Table.Td><Text size="xs">{reg.hora_accion || '00:00:00 am'}</Text></Table.Td>
                    <Table.Td><Text size="xs">{reg.razon || 'Traspaso'}</Text></Table.Td>
                    <Table.Td style={{ maxWidth: '250px' }}>
                      <Text size="xs" fw={500}>{`${reg.nombre} ${reg.paterno} ${reg.materno || ''}`}</Text>
                    </Table.Td>
                    <Table.Td style={{ maxWidth: '200px' }}>
                      <Text size="xs" c="dimmed">{reg.detalles || 'Sin detalles'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{reg.usuario_accion || 'Administrador'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        )}

        {/* BOTONES INFERIORES */}
        <Group justify="flex-end" mt={50} gap="md">
          <Button 
            variant="filled" 
            color="dark" 
            radius="xl" 
            size="md" 
            px={30}
            style={{ backgroundColor: '#0f0f0f' }}
          >
            Hacer un Reporte Individual
          </Button>
          <Button 
            variant="filled" 
            radius="xl" 
            size="md" 
            px={50}
            onClick={close}
            style={{ backgroundColor: '#EDBE3C', color: 'black' }}
          >
            Cerrar
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}