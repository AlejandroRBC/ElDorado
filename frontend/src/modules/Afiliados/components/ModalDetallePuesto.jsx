// frontend/src/modules/Afiliados/components/ModalDetallePuesto.jsx
import { Button,Modal, Box, Group, Stack, Text, Badge, Paper, Table, ScrollArea, Loader, Alert, Divider, Timeline } from '@mantine/core';
import { IconInfoCircle, IconHistory, IconMapPin, IconCalendar, IconUser, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

const ModalDetallePuesto = ({ opened, onClose, puesto }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Cargar historial cuando se abre el modal y hay un puesto seleccionado
  useEffect(() => {
    if (opened && puesto?.id_puesto) {
      cargarHistorial();
    }
  }, [opened, puesto]);

  const cargarHistorial = async () => {
    try {
      setCargandoHistorial(true);
      setError('');

      const response = await fetch(`${API_URL}/api/historial/${puesto.id_puesto}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data = await response.json();
      setHistorial(data);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError(err.message);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    return new Date(fechaStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener color según la razón
  const getColorPorRazon = (razon) => {
    switch(razon?.toUpperCase()) {
      case 'ASIGNADO': return 'green';
      case 'TRASPASO': return 'blue';
      case 'DESPOJADO': return 'red';
      case 'LIBERADO': return 'orange';
      default: return 'gray';
    }
  };

  // Obtener icono según la razón
  const getIconoPorRazon = (razon) => {
    switch(razon?.toUpperCase()) {
      case 'ASIGNADO': return '✓';
      case 'TRASPASO': return '↔';
      case 'DESPOJADO': return '✗';
      case 'LIBERADO': return '○';
      default: return '•';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={
        <Group align="center" gap="xs">
          <IconInfoCircle size={24} color="#edbe3c" />
          <Text fw={700} size="xl">Detalles del Puesto</Text>
        </Group>
      }
      centered
    >
      <Box style={{ minHeight: '400px' }}>
        {/* Información del puesto */}
        {puesto && (
          <>
            <Paper p="md" withBorder mb="md" style={{ backgroundColor: '#fafafa' }}>
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Group gap="xs" mb="xs">
                    <IconMapPin size={20} color="#666" />
                    <Text fw={700} size="xl">
                      {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
                    </Text>
                  </Group>
                  
                  <Group gap="xl" mt="md">
                    <Box>
                      <Text size="xs" c="dimmed">Rubro</Text>
                      <Text fw={500}>
                        {puesto.rubro || <span style={{ color: '#999', fontStyle: 'italic' }}>No especificado</span>}
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text size="xs" c="dimmed">Patente</Text>
                      <Badge 
                        color={puesto.tiene_patente ? 'green' : 'gray'}
                        variant="light"
                      >
                        {puesto.tiene_patente ? 'Con patente' : 'Sin patente'}
                      </Badge>
                    </Box>

                    {(puesto.ancho || puesto.largo) && (
                      <Box>
                        <Text size="xs" c="dimmed">Dimensiones</Text>
                        <Text fw={500}>
                          {puesto.ancho || '?'}m x {puesto.largo || '?'}m
                        </Text>
                      </Box>
                    )}
                  </Group>
                </Box>

                <Badge size="lg" color={puesto.disponible ? 'green' : 'red'} variant="filled">
                  {puesto.disponible ? 'Disponible' : 'Ocupado'}
                </Badge>
              </Group>
            </Paper>

            {/* Historial */}
            <Paper p="md" withBorder>
              <Group gap="xs" mb="md">
                <IconHistory size={20} color="#666" />
                <Text fw={600} size="lg">Historial del Puesto</Text>
              </Group>

              {cargandoHistorial ? (
                <Box py="xl" style={{ textAlign: 'center' }}>
                  <Loader size="sm" color="dark" />
                  <Text size="sm" c="dimmed" mt="md">Cargando historial...</Text>
                </Box>
              ) : error ? (
                <Alert color="red" icon={<IconX size={16} />}>
                  {error}
                </Alert>
              ) : historial.length === 0 ? (
                <Box py="xl" style={{ textAlign: 'center' }}>
                  <IconHistory size={40} style={{ color: '#ccc' }} />
                  <Text size="sm" c="dimmed" mt="md">No hay historial para este puesto</Text>
                </Box>
              ) : (
                <ScrollArea style={{ height: '300px' }} scrollbarSize={6}>
                  <Timeline active={historial.length} bulletSize={24} lineWidth={2}>
                    {historial.map((item, index) => (
                      <Timeline.Item
                        key={index}
                        bullet={getIconoPorRazon(item.razon)}
                        color={getColorPorRazon(item.razon)}
                        title={
                          <Group gap="xs">
                            <Badge 
                              color={getColorPorRazon(item.razon)}
                              variant="light"
                              size="sm"
                            >
                              {item.razon || 'EVENTO'}
                            </Badge>
                            <Text size="sm" c="dimmed">
                              {item.fecha_ini} {item.hora_accion ? `• ${item.hora_accion}` : ''}
                            </Text>
                          </Group>
                        }
                      >
                        <Box mt="xs">
                          <Group gap="xs" mb="xs">
                            <IconUser size={14} style={{ color: '#666' }} />
                            <Text size="sm" fw={500}>{item.afiliado}</Text>
                          </Group>
                          
                          <Text size="sm" style={{ color: '#666' }}>
                            {item.motivo}
                          </Text>
                          
                          <Text size="xs" c="dimmed" mt="xs">
                            Usuario: {item.usuario || 'sistema'}
                          </Text>
                        </Box>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </ScrollArea>
              )}
            </Paper>

            {/* Fecha de creación del puesto (si existe) */}
            {puesto.fecha_creacion && (
              <Group mt="md" justify="flex-end">
                <Text size="xs" c="dimmed">
                  Puesto creado: {formatearFecha(puesto.fecha_creacion)}
                </Text>
              </Group>
            )}
          </>
        )}

        {/* Botón de cerrar */}
        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            onClick={onClose}
            style={{
              borderColor: '#0f0f0f',
              color: '#0f0f0f',
              borderRadius: '100px',
              padding: '0 30px',
              height: '45px'
            }}
          >
            Cerrar
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default ModalDetallePuesto;