// frontend/src/modules/Afiliados/components/ModalConfirmarAccion.jsx
import { Modal, Box, Group, Stack, Text, Button, Paper, Badge, Alert } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';

const ModalConfirmarAccion = ({ opened, onClose, puesto, razon, onConfirmar, loading }) => {
  const esDespojo = razon === 'DESPOJADO';
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group align="center" gap="xs">
          <IconAlertTriangle size={24} color={esDespojo ? '#F44336' : '#4CAF50'} />
          <Text fw={700} size="xl">Confirmar Acción</Text>
        </Group>
      }
      size="md"
      centered
    >
      <Stack gap="xl" p="md">
        {/* Información del puesto */}
        <Paper p="md" withBorder style={{ backgroundColor: '#fafafa' }}>
          <Group justify="space-between">
            <Box>
              <Text size="sm" c="dimmed">Puesto</Text>
              <Text fw={700} size="xl">
                {puesto?.nroPuesto}-{puesto?.fila}-{puesto?.cuadra}
              </Text>
            </Box>
            <Badge size="lg" color={esDespojo ? 'red' : 'green'} variant="filled">
              {razon}
            </Badge>
          </Group>
        </Paper>

        {/* Alerta de advertencia */}
        <Alert 
          color={esDespojo ? 'red' : 'yellow'}
          icon={<IconAlertTriangle size={16} />}
        >
          {esDespojo ? (
            <Stack gap="xs">
              <Text fw={600}>Acción irreversible</Text>
              <Text size="sm">
                Vas a DESPOJAR al afiliado de este puesto. Esto:
              </Text>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Registrará el puesto como DESPOJADO en el historial</li>
                <li>El puesto quedará disponible para otros afiliados</li>
              </ul>
            </Stack>
          ) : (
            <Stack gap="xs">
              <Text fw={600}>Confirmar liberación</Text>
              <Text size="sm">
                Vas a LIBERAR el puesto. El afiliado cede voluntariamente el puesto a la asociación.
                El puesto quedará disponible para futuras asignaciones.
              </Text>
            </Stack>
          )}
        </Alert>

        {/* Botones de confirmación */}
        <Group justify="space-between" mt="md">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            leftSection={<IconX size={16} />}
            style={{
              borderColor: '#0f0f0f',
              color: '#0f0f0f',
              borderRadius: '100px',
              flex: 1
            }}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={onConfirmar}
            loading={loading}
            leftSection={<IconCheck size={16} />}
            style={{
              backgroundColor: esDespojo ? '#F44336' : '#4CAF50',
              color: 'white',
              borderRadius: '100px',
              flex: 1
            }}
          >
            {loading ? 'Procesando...' : `Sí, ${esDespojo ? 'Despojar' : 'Liberar'}`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalConfirmarAccion;