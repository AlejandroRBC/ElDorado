// frontend/src/modules/Afiliados/pages/DetalleAfiliadoPage.jsx
//
// REEMPLAZA: components/DetallesAfiliado.jsx
//
// Diferencia clave: ya no inline-define handlers ni usa 4 hooks
// de acción separados. Delega a useAfiliadoActions + useAfiliadoUI.

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

import { useAfiliado, useHistorialAfiliado } from '../hooks/useAfiliados';
import { useAfiliadoActions }               from '../hooks/useAfiliadoActions';
import { useAfiliadoUI }                    from '../hooks/useAfiliadoUI';
import { getPerfilUrl }                     from '../../../utils/imageHelper';
import { exportarDetallePDF }               from '../handlers/export.handlers';
import { renderFallbackPerfil }             from '../handlers/afiliados.handlers';
import { useLogin }                         from '../../../context/LoginContext';

import TablaPuestos from '../components/TablaPuestos';
import AfiliadoModal from '../components/modals/AfiliadoModal';

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

  // ── Estado local mínimo ───────────────────────────────────────
  const [exportando,    setExportando]    = useState(false);
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
    const resultado = await desafiliar(id, () => {
      cerrarModal();
      setTimeout(() => navigate('/afiliados'), 100);
    });
    // onSuccess navega solo si exito — useAfiliadoActions lo llama
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
    const resultado = await traspasar(data, () => {
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
      <Container fluid p="md">
        <Group justify="space-between" mb="xl">
          <Title order={1} className="titulo-afiliado-no-encontrado">Afiliado no encontrado</Title>
          <Button leftSection={<IconArrowLeft size={18} />} onClick={() => navigate('/afiliados')}
            className="boton-volver-lista">
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
    <Container fluid p="md">
      <Group justify="space-between" mb="xl">
        <Title order={1} fw={800} className="titulo-detalle">Detalle Afiliado</Title>
        <Button leftSection={<IconArrowLeft size={18} />} onClick={() => navigate('/afiliados')}
          className="boton-volver-lista">
          Volver a la lista
        </Button>
      </Group>

      <Paper p="xl" radius="lg" className="paper-principal">
        <LoadingOverlay visible={cargando} zIndex={1000} overlayProps={{ blur: 2 }} />

        {error && !cargando && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {error}
            <Button variant="subtle" size="xs" onClick={cargarAfiliado} className="boton-reintentar">
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Botones de acción */}
        <Group justify="flex-start" mb="xl">
          <Group gap="md">
            <Button leftSection={<IconFilePencil size={18} />} loading={exportando}
              onClick={handleGenerarPDF} className="boton-accion">
              {exportando ? 'Generando PDF...' : 'Generar Reporte PDF'}
            </Button>

            {esSuperAdmin && (
              <Button leftSection={<IconEdit size={18} />} component="a"
                href={`/afiliados/editar/${id}`} className="boton-accion">
                Editar Perfil de Afiliado
              </Button>
            )}

            <Button leftSection={<IconHistory size={18} />}
              onClick={handleAbrirHistorial} className="boton-accion">
              Historial del Afiliado
            </Button>

            {esSuperAdmin && afiliado?.es_habilitado === 1 && (
              <Button leftSection={<IconUserOff size={18} />}
                onClick={() => abrirModalDesafiliar({ afiliado })} className="boton-desafiliar">
                Desafiliar Afiliado
              </Button>
            )}

            {esSuperAdmin && afiliado?.es_habilitado === 0 && (
              <Button leftSection={<IconUserCheck size={18} />} className="boton-rehabilitar-detalle">
                Rehabilitar Afiliado
              </Button>
            )}
          </Group>
        </Group>

        {afiliado && (
          <>
            {/* Info del afiliado */}
            <Paper p="lg" mb="xl" className="paper-info-afiliado">
              <Group align="flex-start" gap="lg">
                <Box className="foto-perfil-contenedor-grande">
                  <img
                    src={getPerfilUrl(afiliado)}
                    alt={`Foto de ${afiliado.nombre} ${afiliado.paterno}`}
                    loading="lazy"
                    className="foto-perfil-imagen-grande"
                    onError={handleImageError}
                  />
                </Box>

                <Stack gap={8} className="info-afiliado-stack">
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text fw={700} size="xl" className="texto-nombre">
                        {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
                      </Text>
                      <Text className="texto-ci">CI: {afiliado.ci_numero}-{afiliado.extension}</Text>
                    </Box>
                  </Group>

                  <Group gap="xl" mt="md">
                    <Box>
                      <Text fw={600} size="sm" className="subtitulo-puestos">Puestos Actuales:</Text>
                      <Group gap={6} wrap="wrap">
                        {afiliado.puestos_id?.length > 0
                          ? afiliado.puestos_id.map((p, i) => (
                            <Badge key={i} size="sm"
                              className={`badge-puesto-detalle ${p.tienePatente ? 'badge-puesto-patente' : 'badge-puesto-sin-patente'}`}>
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

                  <Group gap="xl" mt="md">
                    {[
                      { label: 'Contacto',        value: afiliado.telefono },
                      { label: 'Dirección',        value: afiliado.direccion },
                      { label: 'Fecha Afiliación', value: afiliado.fecha_afiliacion ? new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES') : null },
                      { label: 'Edad',             value: afiliado.edad ? `${afiliado.edad} años` : null },
                      { label: 'Sexo',             value: afiliado.sexo },
                    ].filter((f) => f.value).map(({ label, value }) => (
                      <Stack key={label} gap={4}>
                        <Text fw={600} size="sm">{label}:</Text>
                        <Text size="sm">{value || 'No especificado'}</Text>
                      </Stack>
                    ))}
                  </Group>
                </Stack>
              </Group>
            </Paper>

            {/* Sección puestos */}
            <Box>
              <Group justify="space-between" align="center" mb="md">
                <Title order={2} className="titulo-puestos">Detalles de Puestos de Afiliado</Title>
                {esSuperAdmin && (
                  <Group gap="md">
                    <Button leftSection={<IconPlus size={18} />}
                      onClick={() => abrirModalAsignarPuesto({ idAfiliado: id })}
                      className="boton-anadir-puesto">
                      Añadir Puesto
                    </Button>
                  </Group>
                )}
              </Group>
              <TablaPuestos
                afiliadoId={id}
                refreshKey={refreshPuestos}
                onRefresh={() => { cargarAfiliado(); setRefreshPuestos((p) => p + 1); }}
                onTraspaso={handleTraspaso}
              />
            </Box>
          </>
        )}
      </Paper>

      {/* ── Modales ── */}

      {/* Historial */}
      <AfiliadoModal
        opened={modal.tipo === 'afiliado' && modal.mode === 'historial'}
        onClose={handleCerrarHistorial}
        mode="historial"
        data={{ historial, cargando: cargandoHistorial, error: errorHistorial }}
      />

      {/* Desafiliar */}
      <AfiliadoModal
        opened={modal.tipo === 'afiliado' && modal.mode === 'desafiliar'}
        onClose={cerrarModal}
        mode="desafiliar"
        data={{ afiliado }}
        onDesafiliar={handleConfirmarDesafiliar}
        loadingDesafiliar={accionActiva === 'desafiliar' && loadingAccion}
      />

      {/* Asignar puesto — lazy */}
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

      {/* Traspaso */}
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