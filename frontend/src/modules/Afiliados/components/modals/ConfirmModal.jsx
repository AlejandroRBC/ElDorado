import { memo }                                   from 'react';
import { Modal, Stack, Text, Button, Group, Alert } from '@mantine/core';
import { IconAlertTriangle, IconX, IconCheck }     from '@tabler/icons-react';

/**
 * Modal de confirmación genérico.
 *
 * opened         - Controla visibilidad
 * onClose        - Callback al cancelar / cerrar
 * onConfirmar    - Callback al confirmar
 * titulo         - Texto del encabezado del modal
 * mensaje        - Cuerpo del modal (string o ReactNode)
 * textoConfirmar - Texto del botón de confirmación (default: 'Confirmar')
 * textoCancelar  - Texto del botón cancelar       (default: 'Cancelar')
 * colorConfirmar - Color Mantine del botón         (default: 'red')
 * loading        - Estado de loading en el botón confirmar
 * icono          - ReactNode icono para el Alert (opcional)
 */
const ConfirmModal = memo(({
  opened,
  onClose,
  onConfirmar,
  titulo         = 'Confirmar acción',
  mensaje        = '¿Estás seguro de que deseas continuar?',
  textoConfirmar = 'Confirmar',
  textoCancelar  = 'Cancelar',
  colorConfirmar = 'red',
  loading        = false,
  icono,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group align="center" gap="xs">
          {icono || <IconAlertTriangle size={22} color={colorConfirmar === 'red' ? '#F44336' : '#374567'} />}
          <Text fw={700} size="lg">{titulo}</Text>
        </Group>
      }
      size="md"
      centered
      classNames={{ header: 'modal-confirmar-header', body: 'modal-confirmar-body' }}
    >
      <Stack gap="xl" p="md" className="modal-confirmar-contenido">
        <Alert
          color={colorConfirmar}
          icon={<IconAlertTriangle size={18} />}
          className="modal-confirmar-alerta"
        >
          <Text size="sm" className="modal-alerta-descripcion">
            {mensaje}
          </Text>
        </Alert>

        <Group justify="space-between" className="modal-confirmar-botones">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            leftSection={<IconX size={16} />}
            className="modal-confirmar-boton-cancelar"
          >
            {textoCancelar}
          </Button>

          <Button
            onClick={onConfirmar}
            loading={loading}
            color={colorConfirmar}
            leftSection={<IconCheck size={16} />}
            className="modal-confirmar-boton-confirmar"
          >
            {loading ? 'Procesando...' : textoConfirmar}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
});

ConfirmModal.displayName = 'ConfirmModal';
export default ConfirmModal;