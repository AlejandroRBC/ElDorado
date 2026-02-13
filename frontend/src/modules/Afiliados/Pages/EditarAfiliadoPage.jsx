import { Container, Paper, Title, Button, Group, LoadingOverlay, Alert, Box } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useEditarAfiliado } from '../hooks/useEditarAfiliado';
import FormularioEditarAfiliado from '../components/FormularioEditarAfiliado';

const EditarAfiliadoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    afiliadoActual, 
    loading, 
    error, 
    success, 
    cargarAfiliado, 
    actualizarAfiliado,
    reset 
  } = useEditarAfiliado(id);

  // Cargar datos del afiliado al montar el componente
  useEffect(() => {
    cargarAfiliado();
  }, [id]);

  // Redirigir después de guardar exitosamente
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(`/afiliados/${id}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate, id]);

  const handleSubmit = async (formData) => {
    await actualizarAfiliado(formData);
  };

  const handleCancel = () => {
    navigate(`/afiliados/${id}`);
  };

  if (loading && !afiliadoActual) {
    return (
      <Container fluid p="md">
        <Paper p="xl" radius="lg" style={{ position: 'relative', minHeight: '400px' }}>
          <LoadingOverlay visible={true} />
        </Paper>
      </Container>
    );
  }

  if (error && !afiliadoActual) {
    return (
      <Container fluid p="md">
        <Group justify="space-between" mb="xl">
          <Title order={1} style={{ color: '#0f0f0f' }}>
            Error
          </Title>
          <Button
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate('/afiliados')}
            style={{
              backgroundColor: '#0f0f0f',
              color: 'white',
              borderRadius: '8px'
            }}
          >
            Volver a la lista
          </Button>
        </Group>
        <Paper p="xl" radius="lg" style={{ backgroundColor: 'white' }}>
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="No se pudo cargar el afiliado" 
            color="red"
          >
            {error || 'El afiliado no existe o ha sido eliminado.'}
            <Button 
              variant="subtle" 
              size="xs" 
              onClick={() => cargarAfiliado()}
              style={{ marginLeft: '10px' }}
            >
              Reintentar
            </Button>
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container fluid p="md">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={1} style={{ color: '#0f0f0f' }}>
            Editar Afiliado
          </Title>
          <Title order={3} fw={400} style={{ color: '#666', marginTop: '5px' }}>
            {afiliadoActual?.nombreCompleto || afiliadoActual?.nombre}
          </Title>
        </Box>
        <Button
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate(`/afiliados/${id}`)}
          style={{
            backgroundColor: '#0f0f0f',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 500
          }}
        >
          Volver al Detalle
        </Button>
      </Group>

      {/* Formulario de edición */}
      <Paper 
        p="xl" 
        radius="lg" 
        style={{ 
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
      >
        <FormularioEditarAfiliado
          afiliado={afiliadoActual}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          modo="editar"
        />
      </Paper>
    </Container>
  );
};

export default EditarAfiliadoPage;