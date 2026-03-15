import { Modal, Box, Group, Stack, Text, Button, Paper, Badge, Alert } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';

import '../styles/Estilos.css'; // Archivo acumulador de estilos

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

const getBadgeColor = (razon) => {
  return razon === 'DESPOJADO' ? 'red' : 'green';
};

const getAlertColor = (razon) => {
  return razon === 'DESPOJADO' ? 'red' : 'yellow';
};

const getButtonColor = (razon) => {
  return razon === 'DESPOJADO' ? '#F44336' : '#4CAF50';
};

const getTituloColor = (razon) => {
  return razon === 'DESPOJADO' ? '#F44336' : '#4CAF50';
};

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

const ModalConfirmarAccion = ({ opened, onClose, puesto, razon, onConfirmar, loading }) => {
  // ==============================================
  // VARIABLES DERIVADAS
  // ==============================================
  const esDespojo = razon === 'DESPOJADO';
  const badgeColor = getBadgeColor(razon);
  const alertColor = getAlertColor(razon);
  const buttonColor = getButtonColor(razon);
  const tituloColor = getTituloColor(razon);

  // ==============================================
  // RENDERIZADO DE SECCIONES
  // ==============================================

  const renderTitulo = () => (
    <Group align="center" gap="xs">
      <IconAlertTriangle size={24} color={tituloColor} />
      <Text fw={700} size="xl" className="modal-titulo-texto">
        Confirmar Acción
      </Text>
    </Group>
  );

  const renderInformacionPuesto = () => (
    <Paper p="md" withBorder className="modal-confirmar-puesto-paper">
      <Group justify="space-between">
        <Box>
          <Text size="sm" className="modal-confirmar-puesto-label">
            Puesto
          </Text>
          <Text fw={700} size="xl" className="modal-confirmar-puesto-codigo">
            {puesto?.nroPuesto}-{puesto?.fila}-{puesto?.cuadra}
          </Text>
        </Box>
        <Badge 
          size="lg" 
          color={badgeColor} 
          variant="filled"
          className="modal-confirmar-badge"
        >
          {razon}
        </Badge>
      </Group>
    </Paper>
  );

  const renderAlertaDespojo = () => (
    <Stack gap="xs">
      <Text fw={600} className="modal-alerta-titulo">Acción irreversible</Text>
      <Text size="sm" className="modal-alerta-descripcion">
        Vas a DESPOJAR al afiliado de este puesto. Esto:
      </Text>
      <ul className="modal-alerta-lista">
        <li>Registrará el puesto como DESPOJADO en el historial</li>
        <li>El puesto quedará disponible para otros afiliados</li>
      </ul>
    </Stack>
  );

  const renderAlertaLiberacion = () => (
    <Stack gap="xs">
      <Text fw={600} className="modal-alerta-titulo">Confirmar liberación</Text>
      <Text size="sm" className="modal-alerta-descripcion">
        Vas a LIBERAR el puesto. El afiliado cede voluntariamente el puesto a la asociación.
        El puesto quedará disponible para futuras asignaciones.
      </Text>
    </Stack>
  );

  const renderAlerta = () => (
    <Alert 
      color={alertColor}
      icon={<IconAlertTriangle size={16} />}
      className={`modal-confirmar-alerta ${esDespojo ? 'alerta-despojo' : 'alerta-liberacion'}`}
    >
      {esDespojo ? renderAlertaDespojo() : renderAlertaLiberacion()}
    </Alert>
  );

  const renderBotones = () => (
    <Group justify="space-between" mt="md" className="modal-confirmar-botones">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={loading}
        leftSection={<IconX size={16} />}
        className="modal-confirmar-boton-cancelar"
      >
        Cancelar
      </Button>
      
      <Button
        onClick={onConfirmar}
        loading={loading}
        leftSection={<IconCheck size={16} />}
        className="modal-confirmar-boton-confirmar"
        style={{
          backgroundColor: buttonColor,
        }}
      >
        {loading ? 'Procesando...' : `Sí, ${esDespojo ? 'Despojar' : 'Liberar'}`}
      </Button>
    </Group>
  );

  // Render principal
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={renderTitulo()}
      size="md"
      centered
      classNames={{
        header: 'modal-confirmar-header',
        body: 'modal-confirmar-body'
      }}
    >
      <Stack gap="xl" p="md" className="modal-confirmar-contenido">
        {renderInformacionPuesto()}
        {renderAlerta()}
        {renderBotones()}
      </Stack>
    </Modal>
  );
};

export default ModalConfirmarAccion;