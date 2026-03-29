// frontend/src/modules/Afiliados/Pages/AfiliadosPage.jsx
//
// PATCH RESPONSIVE — imitando patrón de GestionPatentesPuestosModule
// Cambios respecto al original:
//   1. Import useMediaQuery from 'react-responsive'
//   2. isMobile / isTablet aplicados en padding, Group directions, Switch labels
//   3. Botón FAB oculto en móvil (Affix) — lo reemplaza un botón fijo al fondo
//   4. Switch vista Cards/Tabla se fuerza a Cards en móvil automáticamente
//   5. ToggleDeshabilitados y Switch en columna en móvil

import { useMemo, useEffect, lazy, Suspense }          from 'react';
import {
  Container, Paper, Button, Group, Stack,
  Title, Switch, LoadingOverlay, Alert, Loader, Text, Affix, Transition,
} from '@mantine/core';
import {
  IconLayoutGrid,
  IconTable, IconAlertCircle, IconArrowUp, IconSearch,
} from '@tabler/icons-react';
import { useMediaQuery }    from 'react-responsive';

import ModuleHeader       from '../../Navegacion/components/ModuleHeader';
import ListaCards         from '../components/ListaCards';
import TablaAfiliados     from '../components/TablaAfiliados';
import AfiliadoStats      from '../components/ui/AfiliadoStats';
import { PanelFiltros, ToggleDeshabilitados } from '../components/ui/AfiliadoFilters';

import { useAfiliados }       from '../hooks/useAfiliados';
import { useFiltrosAfiliados } from '../hooks/useFiltrosAfiliados';
import { useAfiliadoUI }      from '../hooks/useAfiliadoUI';
import { exportarListaExcel } from '../handlers/export.handlers';
import { useLogin }           from '../../../context/LoginContext';
import '../styles/afiliados-gp.css';

const AfiliadoModal = lazy(() => import('../components/modals/AfiliadoModal'));

const CargandoModal = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Loader size="sm" />
  </div>
);

// ─────────────────────────────────────────────────────────────

const AfiliadosPage = () => {
  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  // ── Responsive ───────────────────────────────────────────────
  const isMobile  = useMediaQuery({ maxWidth: 640 });
  const isTablet  = useMediaQuery({ maxWidth: 1024 });

  // ── Hooks de datos ───────────────────────────────────────────
  const filtrosHook     = useFiltrosAfiliados({ soloDeshabilitados: false });
  const filtrosDeshHook = useFiltrosAfiliados({ soloDeshabilitados: true });

  const activos      = useAfiliados({ soloDeshabilitados: false });
  const deshabilitados = useAfiliados({ soloDeshabilitados: true });

  // ── Hook UI ──────────────────────────────────────────────────
  const {
    modal, abrirModalCrearAfiliado, cerrarModal,
    vistaTabla, setVistaTabla,
    mostrarDeshabilitados, toggleDeshabilitados,
  } = useAfiliadoUI();

  // En móvil forzamos siempre vista Cards (la tabla no encaja bien)
  const vistaEfectiva = isMobile ? false : vistaTabla;

  // ── Opciones de rubros formateadas para Select ───────────────
  const opcionesRubros = useMemo(
    () => activos.rubrosDisponibles.map((r) => ({ value: r, label: r })),
    [activos.rubrosDisponibles]
  );

  // ── Decidir qué hook activo usar ──────────────────────────────
  const hookActivo    = mostrarDeshabilitados ? deshabilitados : activos;
  const filtrosActivo = mostrarDeshabilitados ? filtrosDeshHook : filtrosHook;

  const { filtrosActivos, hayFiltrosActivos } = filtrosActivo;

  const handleCambiarVistaDeshabilitados = async (checked) => {
    toggleDeshabilitados(checked);
    if (checked) {
      await deshabilitados.cargar(filtrosDeshHook.filtrosActivos);
    } else {
      await activos.cargar(filtrosHook.filtrosActivos);
    }
  };

  const handleCambiarBusqueda    = (v) => filtrosActivo.setCambiarBusqueda(v);
  const handleLimpiarBusqueda    = ()  => filtrosActivo.setLimpiarBusqueda();
  const handleCambiarOrden       = async (v) => { filtrosActivo.setCambiarOrden(v);       await hookActivo.cargar({ ...filtrosActivos, orden: v || 'alfabetico' }); };
  const handleCambiarPatente     = async (v) => { filtrosActivo.setCambiarPatente(v);     await hookActivo.cargar({ ...filtrosActivos, conPatente: v }); };
  const handleCambiarPuestoCount = async (v) => { filtrosActivo.setCambiarPuestoCount(v); await hookActivo.cargar({ ...filtrosActivos, puestoCount: v ? parseInt(v) : null }); };
  const handleCambiarRubro       = async (v) => { filtrosActivo.setCambiarRubro(v);       await hookActivo.cargar({ ...filtrosActivos, rubro: v }); };

  const handleLimpiarTodos = async () => {
    filtrosActivo.limpiarTodosFiltros();
    await hookActivo.cargar(mostrarDeshabilitados
      ? { search: '', orden: 'alfabetico' }
      : { search: '', orden: 'alfabetico', conPatente: null, puestoCount: null, rubro: null }
    );
  };

  const handleLimpiarIndividual = async (tipo) => {
    filtrosActivo.limpiarFiltroIndividual(tipo);
    const nuevos = { ...filtrosActivos };
    if (tipo === 'search')      nuevos.search      = '';
    if (tipo === 'conPatente')  nuevos.conPatente  = null;
    if (tipo === 'puestoCount') nuevos.puestoCount = null;
    if (tipo === 'rubro')       nuevos.rubro       = null;
    if (tipo === 'orden')       nuevos.orden       = 'alfabetico';
    await hookActivo.cargar(nuevos);
  };

  useEffect(() => {
    hookActivo.cargar({ ...filtrosActivos, search: filtrosActivo.debouncedSearch });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrosActivo.debouncedSearch]);

  const handleExportarExcel = () =>
    exportarListaExcel(hookActivo.afiliados, mostrarDeshabilitados);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ── Renderizado ───────────────────────────────────────────────
  return (
    <Container fluid p={isMobile ? 'xs' : 'md'} className="af-module">
      <ModuleHeader title="Afiliados" />

      {activos.conexion?.error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Modo sin conexión" color="yellow" mb="md">
          Usando datos locales. Para datos reales, inicia el servidor backend.
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Ejecuta: <code>cd backend && npm start</code>
          </div>
        </Alert>
      )}

      {modal.tipo === 'afiliado' && modal.mode === 'crear' && (
        <Suspense fallback={<CargandoModal />}>
          <AfiliadoModal
            opened
            onClose={cerrarModal}
            mode="crear"
            onAfiliadoCreado={() => activos.cargar()}
          />
        </Suspense>
      )}

      <Paper
        p={isMobile ? 'sm' : 'xl'}
        radius="lg"
        style={{
          backgroundColor: 'white',
          minHeight: '70vh',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'relative',
        }}
      >
        <LoadingOverlay visible={hookActivo.cargando} zIndex={1000} overlayProps={{ blur: 2 }} />

        {hookActivo.error && !hookActivo.cargando && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {hookActivo.error}
            <Button variant="subtle" size="xs" onClick={() => hookActivo.cargar()} style={{ marginLeft: 10 }}>
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Panel filtros */}
        <PanelFiltros
          valores={{
            searchValue:       filtrosActivo.searchValue,
            selectPatente:     filtrosActivo.selectPatente,
            selectOrden:       filtrosActivo.selectOrden,
            selectPuestoCount: filtrosActivo.selectPuestoCount,
            selectRubro:       filtrosActivo.selectRubro,
          }}
          opcionesRubros={opcionesRubros}
          cargando={hookActivo.cargando}
          alCambiarBusqueda={handleCambiarBusqueda}
          alLimpiarBusqueda={handleLimpiarBusqueda}
          alCambiarPatente={handleCambiarPatente}
          alCambiarOrden={handleCambiarOrden}
          alCambiarPuestoCount={handleCambiarPuestoCount}
          alCambiarRubro={handleCambiarRubro}
          filtrosActivos={filtrosActivos}
          hayFiltrosActivos={hayFiltrosActivos}
          alLimpiarFiltro={handleLimpiarIndividual}
          alLimpiarTodos={handleLimpiarTodos}
          esSuperAdmin={esSuperAdmin}
          onAnadirAfiliado={abrirModalCrearAfiliado}
          onExportarExcel={handleExportarExcel}
          isMobile={isMobile}
        />

        {/* Barra de vista: toggle deshabilitados + switch cards/tabla */}
        <Group
          justify={isMobile ? 'center' : 'flex-end'}
          mb="md"
          style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : undefined }}
        >
          <ToggleDeshabilitados
            mostrarDeshabilitados={mostrarDeshabilitados}
            onChange={handleCambiarVistaDeshabilitados}
            totalDeshabilitados={deshabilitados.totalDeshabilitados}
          />

          {/* Separador — oculto en móvil */}
          {!isMobile && (
            <div style={{ width: '1px', height: 30, backgroundColor: '#eee', margin: '0 4px' }} />
          )}

          {/* Switch Cards/Tabla — se oculta en móvil (solo cards) */}
          {!isMobile && (
            <Group gap="xs" align="center">
              <IconLayoutGrid size={18} style={{ color: !vistaTabla ? '#0f0f0f' : '#C4C4C4' }} />
              <Switch
                checked={vistaTabla}
                onChange={(e) => setVistaTabla(e.currentTarget.checked)}
                size="lg"
                styles={{
                  track: { backgroundColor: vistaTabla ? '#0f0f0f' : '#e0e0e0', borderColor: vistaTabla ? '#0f0f0f' : '#e0e0e0', width: '50px', height: '26px' },
                  thumb: { backgroundColor: 'white', borderColor: '#0f0f0f', width: '22px', height: '22px' },
                }}
              />
              <IconTable size={18} style={{ color: vistaTabla ? '#0f0f0f' : '#C4C4C4' }} />
              <Group gap="xs">
                <span className={!vistaTabla ? 'af-vista-label-activo' : 'af-vista-label-inactivo'}>Cards</span>
                <span className="af-vista-label-inactivo">/</span>
                <span className={vistaTabla ? 'af-vista-label-activo' : 'af-vista-label-inactivo'}>Tabla</span>
              </Group>
            </Group>
          )}
        </Group>

        {/* Stats / Paginación */}
        <AfiliadoStats
          total={hookActivo.afiliados.length}
          paginaActual={hookActivo.paginaActual}
          totalPaginas={hookActivo.totalPaginas}
          onCambiarPagina={hookActivo.setPaginaActual}
          hayFiltros={hayFiltrosActivos}
          itemsPorPagina={hookActivo.itemsPorPagina}
        />

        {/* Lista/Tabla */}
        {!hookActivo.cargando && !hookActivo.error && (
          mostrarDeshabilitados
            ? vistaEfectiva
              ? <TablaAfiliados afiliados={deshabilitados.afiliadosPaginados} esDeshabilitados />
              : <ListaCards afiliados={deshabilitados.afiliadosPaginados} esDeshabilitados onRehabilitar={deshabilitados.rehabilitarAfiliado} />
            : vistaEfectiva
              ? <TablaAfiliados afiliados={activos.afiliadosPaginados} />
              : <ListaCards afiliados={activos.afiliadosPaginados} />
        )}

        {/* Sin resultados */}
        {!hookActivo.cargando && !hookActivo.error && hookActivo.afiliados.length === 0 && (
          <Stack align="center" justify="center" style={{ height: 200 }}>
            <IconSearch size={48} style={{ color: '#C4C4C4' }} />
            <Title order={4} style={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
              No se encontraron afiliados
            </Title>
            <Text style={{ color: '#999', fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
              {hayFiltrosActivos ? 'No hay resultados para los filtros aplicados' : 'No hay afiliados registrados'}
            </Text>
            {hayFiltrosActivos && (
              <Button className="af-btn-limpiar" variant="subtle" onClick={handleLimpiarTodos}>
                Limpiar todos los filtros
              </Button>
            )}
          </Stack>
        )}
      </Paper>

      {/* FAB volver arriba — solo en desktop/tablet */}
      {!isMobile && (
        <Affix position={{ bottom: 30, right: 30 }}>
          <Transition transition="slide-up" mounted>
            {(styles) => (
              <Button
                leftSection={<IconArrowUp size={18} />}
                className="af-fab"
                style={styles}
                onClick={scrollToTop}
              >
                Volver Arriba
              </Button>
            )}
          </Transition>
        </Affix>
      )}

      {/* Botón "Ir arriba" fijo en móvil — compacto */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 16,
          zIndex: 300,
        }}>
          <Button
            size="sm"
            onClick={scrollToTop}
            style={{
              backgroundColor: '#0f0f0f',
              color: 'white',
              borderRadius: '50%',
              width: 44,
              height: 44,
              padding: 0,
              minWidth: 'unset',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            <IconArrowUp size={18} />
          </Button>
        </div>
      )}
    </Container>
  );
};

export default AfiliadosPage;