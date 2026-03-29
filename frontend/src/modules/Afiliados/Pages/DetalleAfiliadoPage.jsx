// frontend/src/modules/Afiliados/Pages/DetalleAfiliadoPage.jsx
//
// PATCH RESPONSIVE — imitando patrón de GestionPatentesPuestosModule
// Cambios:
//   1. useMediaQuery({ maxWidth: 640 }) para isMobile
//   2. Botones de acción: en móvil se apilan en columna completa
//   3. Info del afiliado: foto + datos pasan a columna en móvil
//   4. Container padding reducido en móvil
//   5. Group justify en móvil centrado

import { useState, useCallback, lazy, Suspense }         from 'react';
import {
  Paper, Container, Title, Text, Button, Group, Stack,
  Box, Badge, LoadingOverlay, Alert, Loader,
} from '@mantine/core';
import { useParams, useNavigate }                         from 'react-router-dom';
import {
  IconHistory, IconFilePencil, IconArrowLeft, IconEdit,
  IconPlus, IconAlertCircle, IconUserOff, IconUserCheck,
} from '@tabler/icons-react';
import { useMediaQuery }  from 'react-responsive';

import { useAfiliado, useHistorialAfiliado } from '../hooks/useAfiliados';
import { useAfiliadoActions }               from '../hooks/useAfiliadoActions';
import { useAfiliadoUI }                    from '../hooks/useAfiliadoUI';
import { getPerfilUrl }                     from '../../../utils/imageHelper';
import { exportarDetallePDF }               from '../handlers/export.handlers';
import { renderFallbackPerfil }             from '../handlers/afiliados.handlers';
import { useLogin }                         from '../../../context/LoginContext';
import ModuleHeader from '../../Navegacion/components/ModuleHeader';

import TablaPuestos   from '../components/TablaPuestos';
import AfiliadoModal  from '../components/modals/AfiliadoModal';
import { ModalTraspaso } from '../../GestionPatentesPuestos/components/ModalTraspaso';
import '../styles/Estilos.css';

const ModalAsignarPuesto = lazy(() => import('../components/ModalAsignarPuesto'));

const CargandoModal = () => (
  <div className="modal-cargando-contenedor"><Loader size="sm" /></div>
);

// ─────────────────────────────────────────────────────────────

const DetalleAfiliadoPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  // ── Responsive ───────────────────────────────────────────────
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  // ── Datos ────────────────────────────────────────────────────
  const { afiliado, cargando, error, cargarAfiliado } = useAfiliado(id);
  const { historial, cargando: cargandoHistorial, error: errorHistorial,
          cargarHistorial, limpiarHistorial } = useHistorialAfiliado();

  // ── Acciones ─────────────────────────────────────────────────
  const { desafiliar, traspasar, loading: loadingAccion, accionActiva } = useAfiliadoActions();

  // ── UI ────────────────────────────────────────────────────────
  const {
    modal, cerrarModal,
    abrirModalHistorial, abrirModalDesafiliar,
    abrirModalAsignarPuesto, abrirModalTraspaso,
  } = useAfiliadoUI();

  const [exportando,     setExportando]     = useState(false);
  const [refreshPuestos, setRefreshPuestos] = useState(0);

  // ── Handlers ──────────────────────────────────────────────────
  const handleGenerarPDF = useCallback(() => {
    exportarDetallePDF(id, {
      onStart: () => setExportando(true),
      onEnd:   () => setExportando(false),
    });
  }, [id]);

  const handleAbrirHistorial = useCallback(() => {
    cargarHistorial(id);
    abrirModalHistorial({ afiliado });
  }, [cargarHistorial, id, afiliado, abrirModalHistorial]);

  const handleCerrarHistorial = useCallback(() => {
    limpiarHistorial();
    cerrarModal();
  }, [limpiarHistorial, cerrarModal]);

  const handleConfirmarDesafiliar = useCallback(async () => {
    await desafiliar(id, () => {
      cerrarModal();
      setTimeout(() => navigate('/afiliados'), 100);
    });
  }, [desafiliar, id, cerrarModal, navigate]);

  const handlePuestoAsignado = useCallback(() => {
    cargarAfiliado();
    setRefreshPuestos((p) => p + 1);
    cerrarModal();
  }, [cargarAfiliado, cerrarModal]);

  const handleTraspaso = useCallback((puesto, onSuccess) => {
    if (!puesto?.id_puesto) return;
    abrirModalTraspaso({ puesto, afiliadoId: id, onSuccess });
  }, [abrirModalTraspaso, id]);

  const handleEjecutarTraspaso = useCallback(async (data) => {
    await traspasar(data, () => {
      cargarAfiliado();
      setRefreshPuestos((p) => p + 1);
      cerrarModal();
    });
  }, [traspasar, cargarAfiliado, cerrarModal]);

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
    renderFallbackPerfil(e.target.parentElement);
  }, []);

  // ── Afiliado no encontrado ────────────────────────────────────
  if (!cargando && !afiliado && !error) {
    return (
      <Container fluid p={isMobile ? 'xs' : 'md'}>
        <Group justify="space-between" mb="xl" style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : undefined }}>
          <Title order={1} className="titulo-afiliado-no-encontrado">Afiliado no encontrado</Title>
          <Button
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate('/afiliados')}
            className="boton-volver-lista"
            fullWidth={isMobile}
          >
            Volver a la lista
          </Button>
        </Group>
        <Paper p="xl" radius="lg" className="paper-no-encontrado">
          <Text size="lg" className="texto-no-encontrado">
            El afiliado con ID {id} no existe o ha sido eliminado.
          </Text>
          <Button onClick={() => navigate('/afiliados')} className="boton-ver-todos">
            Ver todos los afiliados
          </Button>
        </Paper>
      </Container>
    );
  }

  // ── Render principal ──────────────────────────────────────────
  return (
    <Container fluid p={isMobile ? 'xs' : 'md'}>
      <Group
        justify="space-between"
        mb="xl"
        style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : undefined }}
      >
        <Title order={1} fw={800} className="titulo-detalle">Detalle Afiliado</Title>
        <Button
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate('/afiliados')}
          className="boton-volver-lista"
          fullWidth={isMobile}
        >
          Volver a la lista
        </Button>
      </Group>

      <Paper p={isMobile ? 'sm' : 'xl'} radius="lg" className="paper-principal">
        <LoadingOverlay visible={cargando} zIndex={1000} overlayProps={{ blur: 2 }} />

        {error && !cargando && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {error}
            <Button variant="subtle" size="xs" onClick={cargarAfiliado} className="boton-reintentar">
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Botones de acción — columna completa en móvil */}
        <Group
          justify="flex-start"
          mb="xl"
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: isMobile ? 8 : 12,
          }}
        >
          <Button
            leftSection={<IconFilePencil size={isMobile ? 15 : 18} />}
            loading={exportando}
            onClick={handleGenerarPDF}
            className="boton-accion"
            fullWidth={isMobile}
            size={isMobile ? 'sm' : 'md'}
          >
            {exportando ? 'Generando...' : 'Generar PDF'}
          </Button>

          {esSuperAdmin && (
            <Button
              leftSection={<IconEdit size={isMobile ? 15 : 18} />}
              component="a"
              href={`/afiliados/editar/${id}`}
              className="boton-accion"
              fullWidth={isMobile}
              size={isMobile ? 'sm' : 'md'}
            >
              Editar Perfil
            </Button>
          )}

          <Button
            leftSection={<IconHistory size={isMobile ? 15 : 18} />}
            onClick={handleAbrirHistorial}
            className="boton-accion"
            fullWidth={isMobile}
            size={isMobile ? 'sm' : 'md'}
          >
            Historial
          </Button>

          

          {esSuperAdmin && afiliado?.es_habilitado === 1 && (
            <Button
              leftSection={<IconUserOff size={isMobile ? 15 : 18} />}
              onClick={() => abrirModalDesafiliar({ afiliado })}
              className="boton-desafiliar"
              fullWidth={isMobile}
              size={isMobile ? 'sm' : 'md'}
            >
              Desafiliar
            </Button>
          )}

          {esSuperAdmin && afiliado?.es_habilitado === 0 && (
            <Button
              leftSection={<IconUserCheck size={isMobile ? 15 : 18} />}
              className="boton-rehabilitar-detalle"
              fullWidth={isMobile}
              size={isMobile ? 'sm' : 'md'}
            >
              Rehabilitar
            </Button>
          )}
        </Group>

        {afiliado && (
          <>
            {/* Info del afiliado — columna en móvil, fila en desktop */}
            <Paper p={isMobile ? 'sm' : 'lg'} mb="xl" className="paper-info-afiliado">
              <Group
                align="flex-start"
                gap="lg"
                style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}
              >
                <Box className="foto-perfil-contenedor-grande">
                  <img
                    src={getPerfilUrl(afiliado)}
                    alt={`Foto de ${afiliado.nombre} ${afiliado.paterno}`}
                    loading="lazy"
                    className="foto-perfil-imagen-grande"
                    onError={handleImageError}
                    style={isMobile ? { width: 100, height: 100 } : undefined}
                  />
                </Box>

                <Stack gap={8} className="info-afiliado-stack" style={{ width: isMobile ? '100%' : undefined }}>
                  <Group justify={isMobile ? 'center' : 'space-between'} align="flex-start">
                    <Box style={{ textAlign: isMobile ? 'center' : 'left' }}>
                      <Text fw={700} size={isMobile ? 'md' : 'xl'} className="texto-nombre">
                        {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
                      </Text>
                      <Text className="texto-ci">CI: {afiliado.ci_numero}-{afiliado.extension}</Text>
                    </Box>
                  </Group>

                  <Group
                    gap={isMobile ? 'sm' : 'xl'}
                    mt="md"
                    style={{ flexDirection: isMobile ? 'column' : 'row' }}
                  >
                    <Box>
                      <Text fw={600} size="sm" className="subtitulo-puestos">Puestos Actuales:</Text>
                      <Group gap={6} wrap="wrap">
                        {afiliado.puestos_id?.length > 0
                          ? afiliado.puestos_id.map((p, i) => (
                            <Badge
                              key={i}
                              size="sm"
                              className={`badge-puesto-detalle ${p.tienePatente ? 'badge-puesto-patente' : 'badge-puesto-sin-patente'}`}
                            >
                              {p.puestos}
                            </Badge>
                          ))
                          : <Text size="sm" className="texto-sin-puestos">Sin puestos asignados</Text>
                        }
                      </Group>
                    </Box>
                    <Box>
                      <Text fw={600} size="sm" className="subtitulo-ocupacion">Ocupación:</Text>
                      <Text size="sm" className="texto-ocupacion">
                        {afiliado.ocupacion || afiliado.rubro || 'No especificado'}
                      </Text>
                    </Box>
                  </Group>

                  <Group
                    gap={isMobile ? 'sm' : 'xl'}
                    mt="md"
                    style={{ flexDirection: isMobile ? 'column' : 'row' }}
                  >
                    {[
                      { label: 'Contacto',        value: afiliado.telefono },
                      { label: 'Dirección',        value: afiliado.direccion },
                      { label: 'Fecha Afiliación', value: afiliado.fecha_afiliacion ? new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES') : null },
                    ].map(({ label, value }) => value ? (
                      <Box key={label}>
                        <Text fw={600} size="sm" style={{ color: '#666' }}>{label}:</Text>
                        <Text size="sm">{value}</Text>
                      </Box>
                    ) : null)}
                  </Group>
                </Stack>
              </Group>
            </Paper>

            <Group justify="space-between" align="center" mb="md">
                <Title order={2} className="titulo-puestos">Detalles de Puestos de Afiliado</Title>
                {esSuperAdmin && (
                  <Group gap="md">
                    <Button leftSection={<IconPlus size={18} />}
                      onClick={() => abrirModalAsignarPuesto({ idAfiliado: id })}
                      className="boton-accion">
                      Añadir Puesto
                    </Button>
                  </Group>
                )}
              </Group>
            {/* Tabla de puestos */}
            <TablaPuestos
              afiliadoId={id}
              key={refreshPuestos}
              onTraspaso={handleTraspaso}
            />
          </>
        )}
      </Paper>

      {/* ── Modales ── */}
      <AfiliadoModal
        opened={modal.tipo === 'afiliado' && modal.mode === 'historial'}
        onClose={handleCerrarHistorial}
        mode="historial"
        data={{ historial, cargando: cargandoHistorial, error: errorHistorial }}
      />

      <AfiliadoModal
        opened={modal.tipo === 'afiliado' && modal.mode === 'desafiliar'}
        onClose={cerrarModal}
        mode="desafiliar"
        data={{ afiliado }}
        onDesafiliar={handleConfirmarDesafiliar}
        loadingDesafiliar={accionActiva === 'desafiliar' && loadingAccion}
      />

      {modal.tipo === 'puesto' && modal.mode === 'asignar' && (
        <Suspense fallback={<CargandoModal />}>
          <ModalAsignarPuesto
            opened
            onClose={cerrarModal}
            idAfiliado={id}
            onPuestoAsignado={handlePuestoAsignado}
          />
        </Suspense>
      )}

      {modal.tipo === 'puesto' && modal.mode === 'traspaso' && (
        <ModalTraspaso
          opened
          close={cerrarModal}
          puestoSeleccionado={modal.data?.puesto}
          onTraspaso={handleEjecutarTraspaso}
        />
      )}
    </Container>
  );
};

export default DetalleAfiliadoPage;