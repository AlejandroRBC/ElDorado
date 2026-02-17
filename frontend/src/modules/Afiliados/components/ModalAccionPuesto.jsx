// frontend/src/modules/Afiliados/components/ModalAccionPuesto.jsx
import { Modal, Box, Group, Stack, Text, Button, Paper, Badge } from '@mantine/core';
import { IconAlertTriangle, IconFlag, IconDoorExit, IconX } from '@tabler/icons-react';

const ModalAccionPuesto = ({ opened, onClose, puesto, onConfirm }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group align="center" gap="xs">
          <IconAlertTriangle size={24} color="#edbe3c" />
          <Text fw={700} size="xl">Acción sobre el Puesto</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="xl" p="md">
        {/* Información del puesto */}
        <Paper p="md" withBorder style={{ backgroundColor: '#fafafa' }}>
          <Group justify="space-between">
            <Box>
              <Text size="sm" c="dimmed">Puesto seleccionado</Text>
              <Text fw={700} size="xl" style={{ color: '#0f0f0f' }}>
                {puesto?.nroPuesto}-{puesto?.fila}-{puesto?.cuadra}
              </Text>
            </Box>
            <Badge size="lg" color="yellow" variant="light">
              {puesto?.rubro || 'Sin rubro'}
            </Badge>
          </Group>
        </Paper>

        <Text size="sm" c="dimmed" ta="center">
          ¿Qué acción deseas realizar con este puesto?
        </Text>

        {/* Botones en la misma fila */}
        <Group grow gap="md">
          {/* Botón LIBERAR */}
          <Button
            size="lg"
            leftSection={<IconDoorExit size={20} />}
            onClick={() => onConfirm('LIBERADO')}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '8px',
              height: '60px',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            LIBERAR
          </Button>

          {/* Botón DESPOJAR */}
          <Button
            size="lg"
            leftSection={<IconFlag size={20} />}
            onClick={() => onConfirm('DESPOJADO')}
            style={{
              backgroundColor: '#F44336',
              color: 'white',
              borderRadius: '8px',
              height: '60px',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            DESPOJAR
          </Button>
        </Group>

        {/* Descripciones debajo de los botones */}
        <Group grow gap="md">
          <Text size="xs" c="dimmed" ta="center">
            El afiliado cede voluntariamente<br />el puesto a la asociación
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            La asociación QUITA el puesto<br />(por incumplimiento, etc.)
          </Text>
        </Group>

        {/* Botón cancelar */}
        <Button
          variant="outline"
          onClick={onClose}
          leftSection={<IconX size={16} />}
          style={{
            borderColor: '#0f0f0f',
            color: '#0f0f0f',
            borderRadius: '100px',
            marginTop: '20px'
          }}
        >
          Cancelar
        </Button>
      </Stack>
    </Modal>
  );
};

export default ModalAccionPuesto;