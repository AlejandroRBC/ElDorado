import { useState, useEffect } from 'react';
import { Container, Paper, Group, Button, Select, LoadingOverlay, Alert } from '@mantine/core';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import ModuleHeader      from '../Navegacion/components/ModuleHeader';
import CuadroDirectorio  from './components/CuadroDirectorio';
import ModalGestion      from './components/ModalGestion';
import { useGestiones }  from './hooks/useGestiones';
import { useDirectorio } from './hooks/useDirectorio';
import { directorioService } from './services/directorioService';

const DirectorioModule = () => {
  const {
    gestiones,
    gestionActiva,
    gestionSeleccionada,
    setGestionSeleccionada,
    opcionesSelect,
    cargando: cargandoGestiones,
    error:    errorGestiones,
    recargar: recargarGestiones,
  } = useGestiones();

  const {
    filas,
    cargando: cargandoCuadro,
    error:    errorCuadro,
    recargar: recargarCuadro,
  } = useDirectorio(gestionSeleccionada ? parseInt(gestionSeleccionada) : null);

  // ── Secretarías (catálogo para el modal) ──────────────────
  const [secretarias,     setSecretarias]     = useState([]);
  const [cargandoSecrets, setCargandoSecrets] = useState(false);

  useEffect(() => {
    setCargandoSecrets(true);
    directorioService.obtenerSecretarias()
      .then(setSecretarias)
      .catch(() => {})
      .finally(() => setCargandoSecrets(false));
  }, []);

  // ── Modal ──────────────────────────────────────────────────
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal,    setModoModal]    = useState('nueva'); // 'nueva' | 'editar'

  const abrirNuevaGestion = () => {
    setModoModal('nueva');
    setModalAbierto(true);
  };

  const abrirEditarGestion = () => {
    setModoModal('editar');
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleGuardado = () => {
    recargarGestiones();
    recargarCuadro();
  };

  // ── Label legible de la gestión seleccionada ──────────────
  const gestionSeleccionadaObj = gestiones.find(
    (g) => String(g.id_gestion) === String(gestionSeleccionada)
  );
  const gestionLabel = gestionSeleccionadaObj
    ? `${gestionSeleccionadaObj.anio_inicio} — ${gestionSeleccionadaObj.anio_fin}`
    : '';

  return (
    <Container fluid p="md">
      <ModuleHeader title="Directorio" />

      {/* ── Alert de error en gestiones ── */}
      {errorGestiones && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error al cargar gestiones"
          color="red"
          mb="md"
        >
          {errorGestiones}
          <Button
            variant="subtle" size="xs"
            onClick={recargarGestiones}
            style={{ marginLeft: '10px' }}
          >
            Reintentar
          </Button>
        </Alert>
      )}

      <Paper
        p="xl"
        radius="lg"
        style={{
          backgroundColor: 'white',
          minHeight:        '70vh',
          boxShadow:        '0 4px 20px rgba(0,0,0,0.08)',
          position:         'relative',
        }}
      >
        <LoadingOverlay
          visible={cargandoGestiones || cargandoSecrets}
          zIndex={1000}
          overlayProps={{ blur: 2 }}
        />

        {/* ── Barra de controles ── */}
        <Group justify="space-between" align="center" mb="xl">
          <Group gap="md" align="center">
            {/* Botón Nueva Gestión */}
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={abrirNuevaGestion}
              style={{
                backgroundColor: '#0F0F0F',
                color:           'white',
                borderRadius:    '100px',
                height:          '40px',
                fontWeight:      500,
                padding:         '0 24px',
                fontFamily:      'Poppins, sans-serif',
              }}
            >
              Nueva Gestión
            </Button>

            {/* Select de gestiones */}
            <Select
              placeholder="Seleccionar gestión..."
              data={opcionesSelect}
              value={gestionSeleccionada}
              onChange={setGestionSeleccionada}
              clearable={false}
              searchable={gestiones.length > 4}
              disabled={cargandoGestiones || gestiones.length === 0}
              style={{ minWidth: '220px' }}
              styles={{
                input: {
                  fontFamily:      'Poppins, sans-serif',
                  fontSize:        '14px',
                  fontWeight:      500,
                  backgroundColor: '#F6F9FF',
                  border:          '1px solid #E2ECFF',
                  borderRadius:    '100px',
                  height:          '40px',
                  color:           '#0E1528',
                },
              }}
            />
          </Group>
        </Group>

        {/* ── Cuadro del directorio ── */}
        {gestionSeleccionada ? (
          <CuadroDirectorio
            filas={filas}
            cargando={cargandoCuadro}
            error={errorCuadro}
            gestionLabel={gestionLabel}
            onEditarGestion={abrirEditarGestion}
          />
        ) : (
          !cargandoGestiones && (
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              height:         '300px',
              fontFamily:     'Poppins, sans-serif',
              fontSize:       '14px',
              color:          '#C4C4C4',
            }}>
              Selecciona una gestión para ver el directorio
            </div>
          )
        )}
      </Paper>

      {/* ── Modal unificado ── */}
      <ModalGestion
        opened={modalAbierto}
        onClose={cerrarModal}
        modo={modoModal}
        idGestion={modoModal === 'editar' ? (gestionSeleccionada ? parseInt(gestionSeleccionada) : null) : null}
        gestionLabel={gestionLabel}
        filasDirectorio={filas}
        secretarias={secretarias}
        onGuardado={handleGuardado}
      />
    </Container>
  );
};

export default DirectorioModule;