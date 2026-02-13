import { useState } from 'react';
import { Container, Modal, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import UsuarioList from './Components/usuarioList';
import UsuarioForm from './Components/usuarioForm';
import './Styles/usuario.css';

// ============================================
// MÓDULO DE USUARIOS
// ============================================

/**
 * Página principal del módulo de usuarios
 */
const UsuariosModule = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [recargarLista, setRecargarLista] = useState(0);

  /**
   * Abrir modal para nuevo usuario
   */
  const handleNuevo = () => {
    setUsuarioEditando(null);
    setModalAbierto(true);
  };

  /**
   * Abrir modal para editar usuario
   */
  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setModalAbierto(true);
  };

  /**
   * Cerrar modal y recargar lista
   */
  const handleSuccess = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setRecargarLista(prev => prev + 1);
  };

  return (
    <Container size="xl" py="md">
      <UsuarioList 
        onEditar={handleEditar} 
        key={recargarLista}
      />
      
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={handleNuevo}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
        size="lg"
      >
        Nuevo Usuario
      </Button>

      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
        centered
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