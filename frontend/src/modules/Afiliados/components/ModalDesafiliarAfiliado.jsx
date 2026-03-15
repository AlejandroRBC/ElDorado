import { Modal, Box, Group, Stack, Text, Button, Paper, Badge, Alert } from '@mantine/core';
import { IconAlertTriangle, IconUserOff, IconX, IconCheck } from '@tabler/icons-react';

import '../styles/Estilos.css'; // Archivo acumulador de estilos

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

const getNombreCompleto = (afiliado) => {
  return afiliado?.nombreCompleto || afiliado?.nombre || '';
};

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

const ModalDesafiliarAfiliado = ({ opened, onClose, afiliado, onConfirmar, loading }) => {
  // ==============================================
  // VARIABLES DERIVADAS
  // ==============================================
  const nombreAfiliado = getNombreCompleto(afiliado);

  // ==============================================
  // RENDERIZADO DE SECCIONES
  // ==============================================

  const renderTitulo = () => (
    <Group align="center" gap="xs">
      <IconAlertTriangle size={24} color="#F44336" />
      <Text fw={700} size="xl" className="modal-titulo-texto">
        Desafiliar Afiliado
      </Text>
    </Group>
  );

  const renderInformacionAfiliado = () => (
    <Paper p="md" withBorder className="modal-desafiliar-paper">
      <Group justify="space-between">
        <Box>
          <Text size="sm" className="modal-desafiliar-label">Afiliado</Text>
          <Text fw={700} size="xl" className="modal-desafiliar-nombre">
            {nombreAfiliado}
          </Text>
          <Text size="sm" className="modal-desafiliar-ci" mt={4}>
            CI: {afiliado?.ci}
          </Text>
        </Box>
        <Badge size="lg" color="red" variant="filled" className="modal-desafiliar-badge">
          DESAFILIAR
        </Badge>
      </Group>
    </Paper>
  );

  const renderAdvertencia = () => (
    <Alert 
      color="red"
      icon={<IconAlertTriangle size={20} />}
      title="Acción irreversible"
      className="modal-desafiliar-alerta"
    >
      <Stack gap="xs">
        <Text size="sm" className="modal-desafiliar-alerta-texto">
          Vas a DESAFILIAR a este miembro. Esta acción:
        </Text>
        <ul className="modal-desafiliar-lista">
          <li>
            <span className="modal-desafiliar-lista-destacado">
              TODOS sus puestos serán DESPOJADOS automáticamente
            </span>
          </li>
          <li>Los puestos quedarán disponibles para otros afiliados</li>
          <li>Se registrará en el historial como DESPOJADO por deshabilitación</li>
          <li>El afiliado no podrá iniciar sesión ni realizar operaciones</li>
          <li>
            <span className="modal-desafiliar-lista-destacado">
              Serás redirigido a la lista de afiliados
            </span>
          </li>
        </ul>
      </Stack>
    </Alert>
  );

  const renderBotones = () => (
    <Group justify="space-between" mt="xl" className="modal-desafiliar-botones">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={loading}
        leftSection={<IconX size={16} />}
        className="modal-desafiliar-boton-cancelar"
      >
        Cancelar
      </Button>
      
      <Button
        onClick={onConfirmar}
        loading={loading}
        leftSection={<IconUserOff size={16} />}
        className="modal-desafiliar-boton-confirmar"
      >
        {loading ? 'Procesando...' : 'Sí, Desafiliar'}
      </Button>
    </Group>
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
        header: 'modal-desafiliar-header',
        body: 'modal-desafiliar-body'
      }}
    >
      <Stack gap="xl" p="md" className="modal-desafiliar-contenido">
        {renderInformacionAfiliado()}
        {renderAdvertencia()}
        {renderBotones()}
      </Stack>
    </Modal>
  );
};

export default ModalDesafiliarAfiliado;