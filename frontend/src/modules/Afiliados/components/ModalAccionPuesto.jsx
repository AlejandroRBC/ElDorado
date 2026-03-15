import { Modal, Box, Group, Stack, Text, Button, Paper, Badge } from '@mantine/core';
import { IconAlertTriangle, IconFlag, IconDoorExit, IconX } from '@tabler/icons-react';

import '../styles/Estilos.css'; // Archivo acumulador de estilos

// ==============================================
// COMPONENTE MODAL ACCIÓN PUESTO
// ==============================================

const ModalAccionPuesto = ({ opened, onClose, puesto, onConfirm }) => {
  // ==============================================
  // RENDERIZADO DE SECCIONES
  // ==============================================

  const renderTitulo = () => (
    <Group align="center" gap="xs">
      <IconAlertTriangle size={24} color="#edbe3c" />
      <Text fw={700} size="xl" className="modal-titulo-texto">
        Acción sobre el Puesto
      </Text>
    </Group>
  );

  const renderInformacionPuesto = () => (
    <Paper p="md" withBorder className="modal-puesto-paper">
      <Group justify="space-between">
        <Box>
          <Text size="sm" className="modal-puesto-label">Puesto seleccionado</Text>
          <Text fw={700} size="xl" className="modal-puesto-codigo">
            {puesto?.nroPuesto}-{puesto?.fila}-{puesto?.cuadra}
          </Text>
        </Box>
        <Badge size="lg" color="yellow" variant="light" className="modal-puesto-badge">
          {puesto?.rubro || 'Sin rubro'}
        </Badge>
      </Group>
    </Paper>
  );

  const renderBotonesAccion = () => (
    <>
      <Text size="sm" className="modal-accion-pregunta">
        ¿Qué acción deseas realizar con este puesto?
      </Text>

      {/* Botones en la misma fila */}
      <Group grow gap="md">
        {/* Botón LIBERAR */}
        <Button
          size="lg"
          leftSection={<IconDoorExit size={20} />}
          onClick={() => onConfirm('LIBERADO')}
          className="modal-boton-liberar"
        >
          LIBERAR
        </Button>

        {/* Botón DESPOJAR */}
        <Button
          size="lg"
          leftSection={<IconFlag size={20} />}
          onClick={() => onConfirm('DESPOJADO')}
          className="modal-boton-despojar"
        >
          DESPOJAR
        </Button>
      </Group>

      {/* Descripciones debajo de los botones */}
      <Group grow gap="md">
        <Text size="xs" className="modal-descripcion-accion">
          El afiliado cede voluntariamente<br />el puesto a la asociación
        </Text>
        <Text size="xs" className="modal-descripcion-accion">
          La asociación QUITA el puesto<br />(por incumplimiento, etc.)
        </Text>
      </Group>
    </>
  );

  const renderBotonCancelar = () => (
    <Button
      variant="outline"
      onClick={onClose}
      leftSection={<IconX size={16} />}
      className="modal-boton-cancelar"
    >
      Cancelar
    </Button>
  );

  // Render principal
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={renderTitulo()}
      size="lg"
      centered
      classNames={{
        title: 'modal-title'
      }}
    >
      <Stack gap="xl" p="md">
        {renderInformacionPuesto()}
        {renderBotonesAccion()}
        {renderBotonCancelar()}
      </Stack>
    </Modal>
  );
};

export default ModalAccionPuesto;