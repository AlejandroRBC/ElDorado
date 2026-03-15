// modules/Directorio/DirectorioModule.jsx

// ============================================================
// MÓDULO DIRECTORIO
// ============================================================

import { useState, useEffect, useRef }                            from 'react';
import { Container, Paper, Group, Button, LoadingOverlay, Alert } from '@mantine/core';
import { IconPlus, IconAlertCircle }                              from '@tabler/icons-react';
import { useMediaQuery }                                          from 'react-responsive';
import { useLogin }                                               from '../../context/LoginContext';
import ModuleHeader       from '../Navegacion/components/ModuleHeader';
import CuadroDirectorio   from './components/CuadroDirectorio';
import ModalGestion       from './components/ModalGestion';
import { useGestiones }   from './hooks/useGestiones';
import { useDirectorio }  from './hooks/useDirectorio';
import { directorioService } from './services/directorioService';
import './styles/directorio.css';

/**
 * Módulo principal del directorio de autoridades.
 * El select de gestiones usa custom dropdown igual al BuscadorMapa.
 * Responsive con react-responsive.
 */
const DirectorioModule = () => {
  const isMobile = useMediaQuery({ maxWidth: 640 });

  const { user } = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  const {
    gestiones, gestionActiva, gestionSeleccionada,
    setGestionSeleccionada, opcionesSelect,
    cargando: cargandoGestiones, error: errorGestiones,
    recargar: recargarGestiones,
  } = useGestiones();

  const {
    filas, cargando: cargandoCuadro, error: errorCuadro, recargar: recargarCuadro,
  } = useDirectorio(gestionSeleccionada ? parseInt(gestionSeleccionada) : null);

  // ── Catálogo de secretarías para el modal ──
  const [secretarias, setSecretarias] = useState([]);
  const [cargandoSecrets, setCargandoSecrets] = useState(false);

  useEffect(() => {
    setCargandoSecrets(true);
    directorioService.obtenerSecretarias()
      .then(setSecretarias)
      .catch(() => {})
      .finally(() => setCargandoSecrets(false));
  }, []);

  // ── Custom select de gestiones ──
  const [selectAbierto, setSelectAbierto] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    /**
     * Cierra el custom select al hacer click fuera.
     */
    const handler = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setSelectAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Modal ──
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('nueva');

  /** Abre el modal en modo nueva gestión. */
  const abrirNuevaGestion = () => { 
    setModoModal('nueva'); 
    setModalAbierto(true); 
  };

  /** Abre el modal en modo editar gestión. */
  const abrirEditarGestion = () => { 
    setModoModal('editar'); 
    setModalAbierto(true); 
  };

  /** Recarga al guardar desde el modal. */
  const handleGuardado = () => { 
    recargarGestiones(); 
    recargarCuadro(); 
  };

  // Label de la gestión seleccionada
  const gestionSeleccionadaObj = gestiones.find((g) => String(g.id_gestion) === String(gestionSeleccionada));
  const gestionLabel = gestionSeleccionadaObj
    ? `${gestionSeleccionadaObj.anio_inicio} — ${gestionSeleccionadaObj.anio_fin}`
    : '';

  // Label del custom select
  const labelSeleccionado = opcionesSelect.find((o) => o.value === gestionSeleccionada)?.label || 'Seleccionar gestión...';

  return (
    <Container fluid p="md">
      <ModuleHeader title="Directorio" />

      {errorGestiones && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error al cargar gestiones" color="red" mb="md">
          {errorGestiones}
          <Button variant="subtle" size="xs" onClick={recargarGestiones} style={{ marginLeft: '10px' }}>
            Reintentar
          </Button>
        </Alert>
      )}

      <Paper p="xl" radius="lg" className="dir-paper">
        <LoadingOverlay visible={cargandoGestiones || cargandoSecrets} zIndex={1000} overlayProps={{ blur: 2 }} />

        {/* ── Barra de controles ── */}
        <Group
          justify="flex-start"
          align="center"
          mb="xl"
          gap="md"
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
          }}
        >
          {/* Botón Nueva Gestión SOLO para superadmin */}
          {esSuperAdmin && (
            <button onClick={abrirNuevaGestion} className="dir-btn-nueva-gestion">
              <IconPlus size={18} style={{ marginRight: '8px' }} />
              Nueva Gestión
            </button>
          )}

          {/* Custom select de gestiones */}
          <div
            className="dir-custom-select"
            ref={selectRef}
            style={{
              minWidth: isMobile ? '100%' : '240px',
              marginLeft: esSuperAdmin ? '0' : '0', // queda alineado a la izquierda si no es superadmin
            }}
          >
            <div
              className="dir-custom-select-selected"
              onClick={() => {
                if (!cargandoGestiones && gestiones.length > 0) setSelectAbierto(!selectAbierto);
              }}
            >
              <span>{labelSeleccionado}</span>
              <span className={`dir-custom-select-icon ${selectAbierto ? 'open' : ''}`}>▾</span>
            </div>

            {selectAbierto && (
              <div className="dir-custom-select-dropdown">
                {opcionesSelect.map(({ value, label }) => (
                  <div
                    key={value}
                    className="dir-custom-select-option"
                    onClick={() => {
                      setGestionSeleccionada(value);
                      setSelectAbierto(false);
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <div className="dir-placeholder">Selecciona una gestión para ver el directorio</div>
          )
        )}
      </Paper>

      <ModalGestion
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
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