// frontend/src/modules/Afiliados/Pages/EditarAfiliadoPage.jsx
//
// PATCH RESPONSIVE
// Cambios:
//   1. useMediaQuery para isMobile
//   2. Container padding reducido en móvil
//   3. Header Group en columna en móvil
//   4. Botón "Volver" fullWidth en móvil

import { useEffect, useState }                                from 'react';
import { Container, Paper, Title, Button, Group, LoadingOverlay, Alert, Box } from '@mantine/core';
import { useParams, useNavigate }                             from 'react-router-dom';
import { IconArrowLeft, IconAlertCircle }                     from '@tabler/icons-react';
import { useMediaQuery }                                      from 'react-responsive';

import ModuleHeader from '../../Navegacion/components/ModuleHeader';
import { useAfiliado }          from '../hooks/useAfiliados';
import { useAfiliadoActions }   from '../hooks/useAfiliadoActions';
import FormularioEditarAfiliado from '../components/FormularioEditarAfiliado';

// ─────────────────────────────────────────────────────────────

const EditarAfiliadoPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 640 });

  const { afiliado: afiliadoActual, cargando, error, cargarAfiliado } = useAfiliado(id);
  const { editar, loading: guardando } = useAfiliadoActions();

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  useEffect(() => {
    if (guardadoExitoso) {
      const timer = setTimeout(() => navigate(`/afiliados/${id}`), 1500);
      return () => clearTimeout(timer);
    }
  }, [guardadoExitoso, navigate, id]);

  const handleSubmit = async (formData) => {
    const resultado = await editar(id, formData);
    if (resultado.exito) setGuardadoExitoso(true);
  };

  const handleCancel = () => navigate(`/afiliados/${id}`);

  if (cargando && !afiliadoActual) {
    return (
      <Container fluid p={isMobile ? 'xs' : 'md'}>
        <Paper p="xl" radius="lg" style={{ position: 'relative', minHeight: 400 }}>
          <LoadingOverlay visible />
        </Paper>
      </Container>
    );
  }

  if (error && !afiliadoActual) {
    return (
      <Container fluid p={isMobile ? 'xs' : 'md'}>
        <Group
          justify="space-between"
          mb="xl"
          style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : undefined }}
        >
          <Title order={1} style={{ color: '#0f0f0f' }}>Error</Title>
          <Button
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate('/afiliados')}
            style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '8px' }}
            fullWidth={isMobile}
          >
            Volver a la lista
          </Button>
        </Group>
        <Paper p={isMobile ? 'sm' : 'xl'} radius="lg" style={{ backgroundColor: 'white' }}>
          <Alert icon={<IconAlertCircle size={16} />} title="No se pudo cargar el afiliado" color="red">
            {error || 'El afiliado no existe o ha sido eliminado.'}
            <Button variant="subtle" size="xs" onClick={cargarAfiliado} style={{ marginLeft: 10 }}>
              Reintentar
            </Button>
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container fluid p={isMobile ? 'xs' : 'md'}>
      <Group
        justify="space-between"
        mb="xl"
        style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : undefined }}
      >
        <Box>
          <ModuleHeader
            title="Editar Afiliado"
            showBackButton
            onBack={() => navigate(`/afiliados/${id}`)}
          />
          <Title order={3} fw={400} style={{ color: '#666', marginTop: 5, fontSize: isMobile ? '14px' : undefined }}>
            {afiliadoActual?.nombre} {afiliadoActual?.paterno} {afiliadoActual?.materno}
          </Title>
        </Box>
        <Button
          leftSection={<IconArrowLeft size={18} />}
          onClick={handleCancel}
          className="boton-volver-lista"
          fullWidth={isMobile}
        >
          Volver al Detalle
        </Button>
      </Group>

      <Paper
        p={isMobile ? 'sm' : 'xl'}
        radius="lg"
        style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'relative' }}
      >
        <FormularioEditarAfiliado
          afiliado={afiliadoActual}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={guardando}
          modo="editar"
        />
      </Paper>
    </Container>
  );
};

export default EditarAfiliadoPage;