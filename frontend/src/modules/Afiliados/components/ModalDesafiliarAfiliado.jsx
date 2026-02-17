
import { Modal, Box, Group, Stack, Text, Button, Paper, Badge, Alert } from '@mantine/core';
import { IconAlertTriangle, IconUserOff, IconX, IconCheck } from '@tabler/icons-react';

const ModalDesafiliarAfiliado = ({ opened, onClose, afiliado, onConfirmar, loading }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group align="center" gap="xs">
          <IconAlertTriangle size={24} color="#F44336" />
          <Text fw={700} size="xl">Desafiliar Afiliado</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="xl" p="md">
        {/* Información del afiliado */}
        <Paper p="md" withBorder style={{ backgroundColor: '#fafafa' }}>
          <Group justify="space-between">
            <Box>
              <Text size="sm" c="dimmed">Afiliado</Text>
              <Text fw={700} size="xl" style={{ color: '#0f0f0f' }}>
                {afiliado?.nombreCompleto || afiliado?.nombre}
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                CI: {afiliado?.ci}
              </Text>
            </Box>
            <Badge size="lg" color="red" variant="filled">
              DESAFILIAR
            </Badge>
          </Group>
        </Paper>

        {/* Alerta de advertencia */}
        <Alert 
          color="red"
          icon={<IconAlertTriangle size={20} />}
          title="Acción irreversible"
        >
          <Stack gap="xs">
            <Text size="sm">
              Vas a DESAFILIAR a este miembro. Esta acción:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Deshabilitará al afiliado permanentemente</li>
              <li><strong>TODOS sus puestos serán DESPOJADOS automáticamente</strong></li>
              <li>Los puestos quedarán disponibles para otros afiliados</li>
              <li>Se registrará en el historial como DESPOJADO por deshabilitación</li>
              <li>El afiliado no podrá iniciar sesión ni realizar operaciones</li>
            </ul>
          </Stack>
        </Alert>

        {/* Información de puestos a despojar */}
        {afiliado?.puestos?.length > 0 && (
          <Paper p="md" withBorder>
            <Text fw={600} mb="xs">Puestos que serán despojados:</Text>
            <Group gap="xs">
              {afiliado.puestos.map((puesto, idx) => (
                <Badge key={idx} color="red" variant="outline" size="lg">
                  {puesto.nro}-{puesto.fila}-{puesto.cuadra}
                </Badge>
              ))}
            </Group>
          </Paper>
        )}

        {/* Botones de confirmación */}
        <Group justify="space-between" mt="xl">
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
            leftSection={<IconUserOff size={16} />}
            style={{
              backgroundColor: '#F44336',
              color: 'white',
              borderRadius: '100px',
              flex: 1
            }}
          >
            {loading ? 'Procesando...' : 'Sí, Desafiliar'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalDesafiliarAfiliado;