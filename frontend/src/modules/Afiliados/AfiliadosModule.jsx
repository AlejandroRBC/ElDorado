
import {
  Paper, Container, Button, Group, Stack,
  Title, Switch, LoadingOverlay, Alert, Loader,
  Affix, Transition, Pagination, Text,
} from '@mantine/core';
import { notifications }    from '@mantine/notifications';
import ModuleHeader          from '../Navegacion/components/ModuleHeader';
import {
  IconSearch, IconPlus, IconFileExport,
  IconLayoutGrid, IconTable, IconAlertCircle,
  IconX, IconArrowUp,
} from '@tabler/icons-react';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import ListaCards               from './components/ListaCards';
import TablaAfiliados           from './components/TablaAfiliados';
import ToggleViewDeshabilitados from './components/ToggleViewDeshabilitados';
import { useDebouncedValue }    from '@mantine/hooks';
import { exportToExcel }          from '../../utils/excelExport';
import { prepararDatosAfiliados } from '../../utils/excelTemplates';
import BarraFiltros    from './components/BarraFiltros';
import FiltrosActivos  from './components/FiltrosActivos';
import { useListaAfiliados } from './hooks/useListaAfiliados';
import { useLogin }          from '../../context/LoginContext';
import './styles/afiliados-gp.css';

const ModalAfiliado = lazy(() => import('./components/ModalAfiliado'));
const CargandoModal = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Loader size="sm" />
  </div>
);

const AfiliadosModule = () => {
  const [vistaTabla,            setVistaTabla]            = useState(false);
  const [modalAbierto,          setModalAbierto]          = useState(false);
  const [mostrarDeshabilitados, setMostrarDeshabilitados] = useState(false);

  const [selectPatente,     setSelectPatente]     = useState(null);
  const [selectOrden,       setSelectOrden]       = useState('alfabetico');
  const [selectPuestoCount, setSelectPuestoCount] = useState(null);
  const [selectRubro,       setSelectRubro]       = useState(null);
  const [searchValue,       setSearchValue]       = useState('');

  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  // ── Hook activos ──────────────────────────────────────────────
  const {
    afiliados, afiliadosPaginados,
    paginaActual, setPaginaActual, totalPaginas,
    cargando, error, conexion, filtrosActivos, rubrosDisponibles,
    cargar: cargarAfiliados, buscarPorTexto, ordenarPor,
    filtrarPorCantidadPuestos, filtrarPorPatente, filtrarPorRubro, limpiarFiltros,
  } = useListaAfiliados({ soloDeshabilitados: false });

  // ── Hook deshabilitados ───────────────────────────────────────
  const {
    afiliados: afiliadosDeshabilitados, afiliadosPaginados: afiliadosDeshPaginados,
    paginaActual: paginaActualDesh, setPaginaActual: setPaginaActualDesh,
    totalPaginas: totalPaginasDesh,
    cargando: cargandoDeshabilitados, total: totalDeshabilitados,
    cargar: cargarDeshabilitados, rehabilitarAfiliado,
  } = useListaAfiliados({ soloDeshabilitados: true });

  // ── Sync estado local ← filtrosActivos ───────────────────────
  // FIX: puestoCount viene como número del hook; lo convertimos a
  // string para que CustomSelect lo encuentre en sus opciones ('1','2'…)
  useEffect(() => {
    setSelectOrden(filtrosActivos.orden);
    setSelectPatente(filtrosActivos.conPatente);
    setSelectPuestoCount(
      filtrosActivos.puestoCount !== null && filtrosActivos.puestoCount !== undefined
        ? String(filtrosActivos.puestoCount)
        : null
    );
    setSelectRubro(filtrosActivos.rubro);
    setSearchValue(filtrosActivos.search);
  }, [filtrosActivos]);

  useEffect(() => { buscarPorTexto(debouncedSearch); }, [debouncedSearch]);

  const opcionesRubros = useMemo(
    () => rubrosDisponibles.map((r) => ({ value: r, label: r })),
    [rubrosDisponibles]
  );

  // ── Handlers ─────────────────────────────────────────────────
  const handleCambiarVistaDeshabilitados = async (checked) => {
    setMostrarDeshabilitados(checked);
    checked ? await cargarDeshabilitados() : await cargarAfiliados();
  };

  const handleCambiarBusqueda    = (v) => setSearchValue(v);
  const handleLimpiarBusqueda    = ()  => setSearchValue('');
  const handleCambiarOrden       = async (v) => { setSelectOrden(v);       await ordenarPor(v || 'alfabetico'); };
  const handleCambiarPatente     = async (v) => { setSelectPatente(v);     await filtrarPorPatente(v); };
  const handleCambiarPuestoCount = async (v) => { setSelectPuestoCount(v); await filtrarPorCantidadPuestos(v ? parseInt(v) : null); };
  const handleCambiarRubro       = async (v) => { setSelectRubro(v);       await filtrarPorRubro(v); };

  const handleLimpiarFiltros = async () => {
    setSelectPatente(null); setSelectOrden('alfabetico');
    setSelectPuestoCount(null); setSelectRubro(null); setSearchValue('');
    await limpiarFiltros();
  };

  const handleLimpiarFiltroIndividual = async (tipo) => {
    switch (tipo) {
      case 'search':      setSearchValue('');                          break;
      case 'conPatente':  setSelectPatente(null);     await filtrarPorPatente(null);           break;
      case 'puestoCount': setSelectPuestoCount(null); await filtrarPorCantidadPuestos(null);   break;
      case 'rubro':       setSelectRubro(null);       await filtrarPorRubro(null);             break;
      case 'orden':       setSelectOrden('alfabetico'); await ordenarPor('alfabetico');        break;
      default: break;
    }
  };

  const hayFiltrosActivos = () =>
    filtrosActivos.search !== '' || filtrosActivos.conPatente !== null ||
    filtrosActivos.puestoCount !== null || filtrosActivos.rubro !== null ||
    filtrosActivos.orden !== 'alfabetico';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ── Export: siempre el total filtrado, nunca la página ────────
  const handleExportarExcel = async () => {
    const listaAExportar = mostrarDeshabilitados ? afiliadosDeshabilitados : afiliados;

    if (!listaAExportar?.length) {
      notifications.show({ title: 'Sin datos para exportar', message: 'Ajusta los filtros e intenta de nuevo.', color: 'yellow', autoClose: 4000 });
      return;
    }

    try {
      const { datos, columnas } = prepararDatosAfiliados(listaAExportar);
      await exportToExcel({ data: datos, columns: columnas, sheetName: 'Afiliados', fileName: mostrarDeshabilitados ? 'afiliados_deshabilitados' : 'afiliados_activos' });
      notifications.show({
        title:   '¡Excel generado!',
        message: `${listaAExportar.length} afiliado${listaAExportar.length !== 1 ? 's' : ''} exportado${listaAExportar.length !== 1 ? 's' : ''} correctamente.`,
        color: 'green', autoClose: 3000,
      });
    } catch (err) {
      console.error('Error al exportar:', err);
      notifications.show({ title: 'Error al exportar', message: err.message || 'No se pudo generar el archivo.', color: 'red', autoClose: 5000 });
    }
  };

  // ── Paginación activa ─────────────────────────────────────────
  const listaTotalActiva   = mostrarDeshabilitados ? afiliadosDeshabilitados : afiliados;
  const paginaActivaActual = mostrarDeshabilitados ? paginaActualDesh  : paginaActual;
  const totalPaginasActual = mostrarDeshabilitados ? totalPaginasDesh  : totalPaginas;
  const setPaginaActiva    = mostrarDeshabilitados ? setPaginaActualDesh : setPaginaActual;
  const primerItem         = (paginaActivaActual - 1) * 50 + 1;
  const ultimoItem         = Math.min(paginaActivaActual * 50, listaTotalActiva.length);

  return (
    <Container fluid p="md" className="af-module">
      <ModuleHeader title="Afiliados" />

      {conexion?.error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Modo sin conexión" color="yellow" mb="md">
          Usando datos locales. Para datos reales, inicia el servidor backend.
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Ejecuta: <code>cd backend && npm start</code></div>
        </Alert>
      )}

      {modalAbierto && (
        <Suspense fallback={<CargandoModal />}>
          <ModalAfiliado opened={modalAbierto} onClose={() => setModalAbierto(false)} onAfiliadoCreado={() => cargarAfiliados()} />
        </Suspense>
      )}

      <Paper p="xl" radius="lg" style={{ backgroundColor: 'white', minHeight: '70vh', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative' }}>
        <LoadingOverlay visible={cargando} zIndex={1000} overlayProps={{ blur: 2 }} />

        {error && !cargando && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {error}
            <Button variant="subtle" size="xs" onClick={() => cargarAfiliados()} style={{ marginLeft: '10px' }}>Reintentar</Button>
          </Alert>
        )}

        {/* ── Filtros ── */}
        <BarraFiltros
          valores={{ searchValue, selectPatente, selectOrden, selectPuestoCount, selectRubro }}
          opcionesRubros={opcionesRubros}
          cargando={cargando}
          alCambiarBusqueda={handleCambiarBusqueda}
          alLimpiarBusqueda={handleLimpiarBusqueda}
          alCambiarPatente={handleCambiarPatente}
          alCambiarOrden={handleCambiarOrden}
          alCambiarPuestoCount={handleCambiarPuestoCount}
          alCambiarRubro={handleCambiarRubro}
        />

        <FiltrosActivos filtrosActivos={filtrosActivos} alLimpiarFiltro={handleLimpiarFiltroIndividual} />

        {/* ── Barra de acciones ── */}
        <Group justify="space-between" align="center" mb="xl">
          <Group gap="sm" wrap="wrap">
            {esSuperAdmin && (
              <Button leftSection={<IconPlus size={18} />} className="af-btn-primario" onClick={() => setModalAbierto(true)}>
                Añadir Afiliado
              </Button>
            )}
            <Button leftSection={<IconFileExport size={18} />} className="af-btn-exportar" onClick={handleExportarExcel}>
              Exportar lista
            </Button>
            {hayFiltrosActivos() && (
              <Button leftSection={<IconX size={16} />} className="af-btn-limpiar" variant="subtle" onClick={handleLimpiarFiltros}>
                Limpiar filtros
              </Button>
            )}
          </Group>

          <Group gap="md" align="center">
            <ToggleViewDeshabilitados mostrarDeshabilitados={mostrarDeshabilitados} onChange={handleCambiarVistaDeshabilitados} totalDeshabilitados={totalDeshabilitados} />
            <div style={{ width: '1px', height: '30px', backgroundColor: '#eee' }} />
            <Group gap="md" align="center">
              <Group gap="xs" align="center">
                <IconLayoutGrid size={18} style={{ color: !vistaTabla ? '#0f0f0f' : '#C4C4C4' }} />
                <Switch
                  checked={vistaTabla} onChange={(e) => setVistaTabla(e.currentTarget.checked)} size="lg"
                  styles={{
                    track: { backgroundColor: vistaTabla ? '#0f0f0f' : '#e0e0e0', borderColor: vistaTabla ? '#0f0f0f' : '#e0e0e0', width: '50px', height: '26px' },
                    thumb: { backgroundColor: 'white', borderColor: '#0f0f0f', width: '22px', height: '22px' },
                  }}
                />
                <IconTable size={18} style={{ color: vistaTabla ? '#0f0f0f' : '#C4C4C4' }} />
              </Group>
              <Group gap="xs">
                <span className={!vistaTabla ? 'af-vista-label-activo' : 'af-vista-label-inactivo'}>Cards</span>
                <span className="af-vista-label-inactivo">/</span>
                <span className={vistaTabla ? 'af-vista-label-activo' : 'af-vista-label-inactivo'}>Tabla</span>
              </Group>
            </Group>
          </Group>
        </Group>
        {/* ── Paginación y contador ── */}
        {!cargando && !error && listaTotalActiva.length > 0 && (
          <Stack align="center" mt="xl" gap="xs">
            {totalPaginasActual > 1 && (
              <Pagination total={totalPaginasActual} value={paginaActivaActual} onChange={setPaginaActiva} color="dark" radius="xl" size="sm" />
            )}
            <span className="af-contador">
              {listaTotalActiva.length <= 50
                ? `${listaTotalActiva.length} afiliado${listaTotalActiva.length !== 1 ? 's' : ''}${hayFiltrosActivos() ? ' (filtrados)' : ''}`
                : `Mostrando ${primerItem}–${ultimoItem} de ${listaTotalActiva.length} afiliado${listaTotalActiva.length !== 1 ? 's' : ''}${hayFiltrosActivos() ? ' (filtrados)' : ''}`
              }
            </span>
          </Stack>
        )}

        {/* ── Vista paginada ── */}
        {!cargando && !cargandoDeshabilitados && !error && (
          mostrarDeshabilitados ? (
            vistaTabla
              ? <TablaAfiliados afiliados={afiliadosDeshPaginados} esDeshabilitados={true} />
              : <ListaCards     afiliados={afiliadosDeshPaginados} esDeshabilitados={true} onRehabilitar={rehabilitarAfiliado} />
          ) : (
            vistaTabla
              ? <TablaAfiliados afiliados={afiliadosPaginados} />
              : <ListaCards     afiliados={afiliadosPaginados} />
          )
        )}

        {/* Sin resultados */}
        {!cargando && !error && listaTotalActiva.length === 0 && (
          <Stack align="center" justify="center" style={{ height: '200px' }}>
            <IconSearch size={48} style={{ color: '#C4C4C4' }} />
            <Title order={4} style={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>No se encontraron afiliados</Title>
            <Text style={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
              {hayFiltrosActivos() ? 'No hay resultados para los filtros aplicados' : 'No hay afiliados registrados'}
            </Text>
            {hayFiltrosActivos() && (
              <Button className="af-btn-limpiar" variant="subtle" onClick={handleLimpiarFiltros}>
                Limpiar todos los filtros
              </Button>
            )}
          </Stack>
        )}

        
      </Paper>

      <Affix position={{ bottom: 30, right: 30 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button leftSection={<IconArrowUp size={18} />} className="af-fab" style={transitionStyles} onClick={scrollToTop}>
              Volver Arriba
            </Button>
          )}
        </Transition>
      </Affix>
    </Container>
  );
};

export default AfiliadosModule;