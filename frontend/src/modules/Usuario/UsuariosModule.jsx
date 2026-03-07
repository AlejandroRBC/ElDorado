import { useState } from 'react';
import { Container, Modal, Button, Paper } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useMediaQuery } from 'react-responsive';
import UsuarioList from './Components/usuarioList';
import UsuarioForm from './Components/usuarioForm';
import './Styles/usuario.css';

// ============================================
// MÓDULO DE USUARIOS
// ============================================

/**
 * Página principal del módulo de usuarios.
 * Contiene la lista de usuarios, el historial y el modal de creación/edición.
 * El botón flotante (FAB) abre el modal para crear un nuevo usuario.
 */
const UsuariosModule = () => {
  const [modalAbierto, setModalAbierto]     = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [recargarLista, setRecargarLista]   = useState(0);

  // ── Breakpoints responsive ──
  const isMobile = useMediaQuery({ maxWidth: 640 });

  /**
   * Abrir modal en modo creación
   */
  const handleNuevo = () => {
    setUsuarioEditando(null);
    setModalAbierto(true);
  };

  /**
   * Abrir modal en modo edición con los datos del usuario seleccionado
   * @param {Object} usuario - Datos del usuario a editar
   */
  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setModalAbierto(true);
  };

  /**
   * Cerrar modal y forzar recarga de la lista
   */
  const handleSuccess = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setRecargarLista(prev => prev + 1);
  };

  return (
    <Container fluid p="md" className="usuario-module">

      {/* Contenedor principal con estilo Paper */}
      <Paper
        p="xl"
        className="usuario-list-paper"
      >
        {/* Lista de usuarios + historial */}
        <UsuarioList
          onEditar={handleEditar}
          key={recargarLista}
        />
      </Paper>

      {/* ── Botón flotante nuevo usuario ── */}
      <Button
        leftSection={<IconPlus size={18} />}
        onClick={handleNuevo}
        className="usuario-module-fab"
        size={isMobile ? 'md' : 'lg'}
      >
        {isMobile ? 'Nuevo' : 'Nuevo Usuario'}
      </Button>

      {/* ── Modal crear / editar ── */}
      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
        size={isMobile ? '100%' : 'lg'}
        centered
        radius="lg"
        styles={{
          title: {
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.5rem',
            letterSpacing: '1px',
          }
        }}
      >
        <UsuarioForm
          onSuccess={handleSuccess}
          usuarioId={usuarioEditando?.id_usuario}
          onCancel={() => setModalAbierto(false)}
        />
      </Modal>
    </Container>
  );
};

export default UsuariosModule;