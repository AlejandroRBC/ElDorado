import { Paper, Container, Title, Text, Button, Group, Stack, Box, Badge, LoadingOverlay, Alert, Loader } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { IconHistory, IconFilePencil, IconArrowLeft, IconEdit, IconPlus, IconTransfer, IconAlertCircle, IconUserOff, IconUserCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState, useCallback, lazy, Suspense } from 'react';

import { useAfiliado } from '../hooks/useAfiliado';
import { useDesafiliarAfiliado } from '../hooks/useDesafiliarAfiliado';
import { useTraspasoDesdeAfiliado } from '../hooks/useTraspasoDesdeAfiliado';
import { usePDFExport } from '../hooks/usePDFExport';
import { useHistorialAfiliado } from '../hooks/useHistorialAfiliado';
import { getPerfilUrl } from '../../../utils/imageHelper';

import TablaPuestos from './TablaPuestos';
import ModalDesafiliarAfiliado from './ModalDesafiliarAfiliado';
import { ModalTraspaso } from '../../GestionPatentesPuestos/components/ModalTraspaso';
import ModalHistorialAfiliado from './ModalHistorialAfiliado';

import '../styles/Estilos.css'; // Archivo acumulador de estilos

// ==============================================
// HANDLERS DE NAVEGACIÓN Y MODALES
// ==============================================

const handleAbrirHistorial = (setModalHistorialAbierto, cargarHistorial, id) => {
  setModalHistorialAbierto(true);
  cargarHistorial(id);
};

const handleCerrarHistorial = (setModalHistorialAbierto, limpiarHistorial) => {
  setModalHistorialAbierto(false);
  limpiarHistorial();
};

// ==============================================
// COMPONENTES AUXILIARES
// ==============================================

// Con lazy(), el chunk no se descarga hasta que el usuario pulsa "Añadir Puesto"
const ModalAsignarPuesto = lazy(() => import('./ModalAsignarPuesto'));

const CargandoModal = () => (
  <div className="modal-cargando-contenedor">
    <Loader size="sm" />
  </div>
);

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

const DetallesAfiliado = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==============================================
  // ESTADOS LOCALES
  // ==============================================
  const [modalPuestoAbierto, setModalPuestoAbierto] = useState(false);
  const [modalDesafiliarAbierto, setModalDesafiliarAbierto] = useState(false);
  const [refreshPuestos, setRefreshPuestos] = useState(0);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);

  // ==============================================
  // HOOKS PERSONALIZADOS
  // ==============================================
  const { afiliado, cargando, error, cargarAfiliado } = useAfiliado(id);
  const { desafiliar, cargando: cargandoDesafiliar } = useDesafiliarAfiliado();
  const { exportando, exportarDetalleAfiliado } = usePDFExport();
  const { historial, cargando: cargandoHistorial, error: errorHistorial, cargarHistorial, limpiarHistorial } = useHistorialAfiliado();
  const {
    modalTraspasoAbierto,
    puestoParaTraspaso,
    abrirModalTraspaso,
    cerrarModalTraspaso,
    ejecutarTraspaso,
  } = useTraspasoDesdeAfiliado();

  // ==============================================
  // HANDLERS DEL COMPONENTE (memoizados)
  // ==============================================

  const handleGenerarPDF = useCallback(() => {
    exportarDetalleAfiliado(id);
  }, [exportarDetalleAfiliado, id]);

  const handlePuestoAsignado = useCallback(() => {
    cargarAfiliado();
    setRefreshPuestos((prev) => prev + 1);
    setModalPuestoAbierto(false);
  }, [cargarAfiliado]);

  const handleTraspaso = useCallback((puesto, onSuccess) => {
    if (!puesto?.id_puesto) {
      notifications.show({
        title: '❌ Error',
        message: 'El puesto seleccionado no es válido',
        color: 'red'
      });
      return;
    }
    abrirModalTraspaso({
      id_puesto: puesto.id_puesto,
      nroPuesto: puesto.nroPuesto,
      fila: puesto.fila,
      cuadra: puesto.cuadra,
      rubro: puesto.rubro,
      tiene_patente: puesto.tiene_patente,
    }, onSuccess);
  }, [abrirModalTraspaso]);

  const refrescarDatosAfiliado = useCallback(() => {
    cargarAfiliado();
    setRefreshPuestos((prev) => prev + 1);
    notifications.show({
      title: '🔄 Actualizado',
      message: 'Los datos se han actualizado',
      color: 'blue',
      autoClose: 2000
    });
  }, [cargarAfiliado]);

  const handleDesafiliar = useCallback(async () => {
    const resultado = await desafiliar(id);
    if (resultado.exito) {
      setModalDesafiliarAbierto(false);
      setTimeout(() => navigate('/afiliados'), 100);
    }
  }, [desafiliar, id, navigate]);

  const handleAbrirHistorialClick = useCallback(() => {
    handleAbrirHistorial(setModalHistorialAbierto, cargarHistorial, id);
  }, [cargarHistorial, id]);

  const handleCerrarHistorialClick = useCallback(() => {
    handleCerrarHistorial(setModalHistorialAbierto, limpiarHistorial);
  }, [limpiarHistorial]);

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = `
      <div class="foto-perfil-fallback">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    `;
  }, []);

  const handleVolverClick = useCallback(() => {
    navigate('/afiliados');
  }, [navigate]);

  const handleRehabilitarClick = useCallback(() => {
    // Implementar rehabilitación
  }, []);

  // ==============================================
  // RENDERIZADO CONDICIONAL - Afiliado no encontrado
  // ==============================================
  if (!cargando && !afiliado && !error) {
    return (
      <Container fluid p="md">
        <Group justify="space-between" mb="xl">
          <Title order={1} className="titulo-afiliado-no-encontrado">
            Afiliado no encontrado
          </Title>
          <Button
            leftSection={<IconArrowLeft size={18} />}
            onClick={handleVolverClick}
            className="boton-volver-lista"
          >
            Volver a la lista
          </Button>
        </Group>
        <Paper p="xl" radius="lg" className="paper-no-encontrado">
          <Text size="lg" className="texto-no-encontrado">
            El afiliado con ID {id} no existe o ha sido eliminado.
          </Text>
          <Button onClick={handleVolverClick} className="boton-ver-todos">
            Ver todos los afiliados
          </Button>
        </Paper>
      </Container>
    );
  }

  // ==============================================
  // RENDER PRINCIPAL
  // ==============================================
  return (
    <Container fluid p="md">
      <Group justify="space-between" mb="xl">
        <Title order={1} fw={800} className="titulo-detalle">
          Detalle Afiliado
        </Title>
        <Button
          leftSection={<IconArrowLeft size={18} />}
          onClick={handleVolverClick}
          className="boton-volver-lista"
        >
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

        {/* Botones de acción superiores */}
        <Group justify="flex-start" mb="xl">
          <Group gap="md">
            <Button
              leftSection={<IconFilePencil size={18} />}
              loading={exportando}
              onClick={handleGenerarPDF}
              className="boton-accion"
            >
              {exportando ? 'Generando PDF...' : 'Generar Reporte PDF'}
            </Button>

            <Button
              leftSection={<IconEdit size={18} />}
              component="a"
              href={`/afiliados/editar/${id}`}
              className="boton-accion"
            >
              Editar Perfil de Afiliado
            </Button>

            <Button
              leftSection={<IconHistory size={18} />}
              onClick={handleAbrirHistorialClick}
              className="boton-accion"
            >
              Historial del Afiliado
            </Button>

            {afiliado?.es_habilitado === 1 && (
              <Button
                leftSection={<IconUserOff size={18} />}
                onClick={() => setModalDesafiliarAbierto(true)}
                className="boton-desafiliar"
              >
                Desafiliar Afiliado
              </Button>
            )}

            {afiliado?.es_habilitado === 0 && (
              <Button
                leftSection={<IconUserCheck size={18} />}
                onClick={handleRehabilitarClick}
                className="boton-rehabilitar-detalle"
              >
                Rehabilitar Afiliado
              </Button>
            )}
          </Group>
        </Group>

        {afiliado && (
          <>
            {/* Información del afiliado */}
            <Paper p="lg" mb="xl" className="paper-info-afiliado">
              <Group align="flex-start" gap="lg">
                <Box className="foto-perfil-contenedor-grande">
                  <img
                    src={getPerfilUrl(afiliado)}
                    alt={`Foto de perfil de ${afiliado.nombre} ${afiliado.paterno}`}
                    loading="lazy"
                    className="foto-perfil-imagen-grande"
                    onError={handleImageError}
                  />
                </Box>

                <Stack gap={8} className="info-afiliado-stack">
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text fw={700} size="xl" className="texto-nombre">
                        {afiliado.nombreCompleto || afiliado.nombre}
                      </Text>
                      <Text className="texto-ci">CI: {afiliado.ci}</Text>
                    </Box>
                  </Group>

                  <Group gap="xl" mt="md">
                    <Box>
                      <Text fw={600} size="sm" className="subtitulo-puestos">
                        Puestos Actuales:
                      </Text>
                      <Group gap={6} wrap="wrap">
                        {afiliado.patentes?.length > 0 ? (
                          afiliado.patentes.map((puesto, index) => (
                            <Badge
                              key={index}
                              size="sm"
                              className={`badge-puesto-detalle ${puesto.tienePatente ? 'badge-puesto-patente' : 'badge-puesto-sin-patente'}`}
                            >
                              {puesto.label}
                            </Badge>
                          ))
                        ) : (
                          <Text size="sm" className="texto-sin-puestos">
                            Sin puestos asignados
                          </Text>
                        )}
                      </Group>
                    </Box>

                    <Box>
                      <Text fw={600} size="sm" className="subtitulo-ocupacion">
                        Ocupación:
                      </Text>
                      <Text size="sm" className="texto-ocupacion">
                        {afiliado.ocupacion || afiliado.rubro || 'No especificado'}
                      </Text>
                    </Box>
                  </Group>

                  <Group gap="xl" mt="md">
                    <Stack gap={4}>
                      <Text fw={600} size="sm" className="subtitulo-contacto">Contacto:</Text>
                      <Text size="sm" className="texto-contacto">{afiliado.telefono || 'No especificado'}</Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text fw={600} size="sm" className="subtitulo-direccion">Dirección:</Text>
                      <Text size="sm" className="texto-direccion">{afiliado.direccion || 'No especificado'}</Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text fw={600} size="sm" className="subtitulo-fecha">Fecha Afiliación:</Text>
                      <Text size="sm" className="texto-fecha">
                        {afiliado.fecha_afiliacion ? new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES') : 'No especificado'}
                      </Text>
                    </Stack>
                    {afiliado.edad && (
                      <Stack gap={4}>
                        <Text fw={600} size="sm" className="subtitulo-edad">Edad:</Text>
                        <Text size="sm" className="texto-edad">{afiliado.edad} años</Text>
                      </Stack>
                    )}
                    {afiliado.sexo && (
                      <Stack gap={4}>
                        <Text fw={600} size="sm" className="subtitulo-sexo">Sexo:</Text>
                        <Text size="sm" className="texto-sexo">{afiliado.sexo}</Text>
                      </Stack>
                    )}
                  </Group>
                </Stack>
              </Group>
            </Paper>

            {/* Sección de Puestos */}
            <Box>
              <Group justify="space-between" align="center" mb="md">
                <Title order={2} className="titulo-puestos">
                  Detalles de Puestos de Afiliado
                </Title>

                <Group gap="md">
                  <Button
                    leftSection={<IconPlus size={18} />}
                    onClick={() => setModalPuestoAbierto(true)}
                    className="boton-anadir-puesto"
                  >
                    Añadir Puesto
                  </Button>
                  {modalPuestoAbierto && (
                    <Suspense fallback={<CargandoModal />}>
                      <ModalAsignarPuesto
                        opened={modalPuestoAbierto}
                        onClose={() => setModalPuestoAbierto(false)}
                        idAfiliado={id}
                        onPuestoAsignado={handlePuestoAsignado}
                      />
                    </Suspense>
                  )}
                </Group>
              </Group>

              <TablaPuestos
                afiliadoId={afiliado.id}
                key={refreshPuestos}
                onTraspaso={handleTraspaso}
                onRefresh={refrescarDatosAfiliado}
              />
            </Box>

            <ModalDesafiliarAfiliado
              opened={modalDesafiliarAbierto}
              onClose={() => setModalDesafiliarAbierto(false)}
              afiliado={afiliado}
              onConfirmar={handleDesafiliar}
              loading={cargandoDesafiliar}
            />

            <ModalTraspaso
              opened={modalTraspasoAbierto}
              close={cerrarModalTraspaso}
              puestoSeleccionado={puestoParaTraspaso}
              onTraspaso={ejecutarTraspaso}
            />

            <ModalHistorialAfiliado
              opened={modalHistorialAbierto}
              onClose={handleCerrarHistorialClick}
              historial={historial}
              cargando={cargandoHistorial}
              error={errorHistorial}
              nombreAfiliado={afiliado?.nombreCompleto || afiliado?.nombre || ''}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DetallesAfiliado;