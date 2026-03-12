import {
  Text, Paper, Container, Button, Group, Stack,
  Title, Switch, LoadingOverlay, Alert, Loader,
  Affix, Transition,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ModuleHeader from '../Navegacion/components/ModuleHeader';
import {
  IconSearch, IconPlus, IconFileExport,
  IconLayoutGrid, IconTable, IconAlertCircle,
  IconX, IconArrowUp, IconCheck,
} from '@tabler/icons-react';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import ListaCards     from './components/ListaCards';
import TablaAfiliados from './components/TablaAfiliados';
import ToggleViewDeshabilitados from './components/ToggleViewDeshabilitados';
import { useDebouncedValue } from '@mantine/hooks';
import { exportToExcel }          from '../../utils/excelExport';
import { prepararDatosAfiliados } from '../../utils/excelTemplates';
import BarraFiltros   from './components/BarraFiltros';
import FiltrosActivos from './components/FiltrosActivos';
import { useListaAfiliados } from './hooks/useListaAfiliados';

const ModalAfiliado = lazy(() => import('./components/ModalAfiliado'));

const CargandoModal = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Loader size="sm" />
  </div>
);

const AfiliadosModule = () => {
  const [vistaTabla,   setVistaTabla]   = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mostrarDeshabilitados, setMostrarDeshabilitados] = useState(false);

  const [selectPatente,     setSelectPatente]     = useState(null);
  const [selectOrden,       setSelectOrden]       = useState('alfabetico');
  const [selectPuestoCount, setSelectPuestoCount] = useState(null);
  const [selectRubro,       setSelectRubro]       = useState(null);
  const [searchValue,       setSearchValue]       = useState('');

  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  const {
    afiliados,
    cargando,
    error,
    conexion,
    filtrosActivos,
    rubrosDisponibles,
    cargar:                   cargarAfiliados,
    buscarPorTexto,
    ordenarPor,
    filtrarPorCantidadPuestos,
    filtrarPorPatente,
    filtrarPorRubro,
    limpiarFiltros,
  } = useListaAfiliados({ soloDeshabilitados: false });

  const {
    afiliados: afiliadosDeshabilitados,
    cargando:  cargandoDeshabilitados,
    total:     totalDeshabilitados,
    cargar:    cargarDeshabilitados,
    rehabilitarAfiliado,
  } = useListaAfiliados({ soloDeshabilitados: true });

  useEffect(() => {
    setSelectOrden(filtrosActivos.orden);
    setSelectPatente(filtrosActivos.conPatente);
    setSelectPuestoCount(filtrosActivos.puestoCount);
    setSelectRubro(filtrosActivos.rubro);
    setSearchValue(filtrosActivos.search);
  }, [filtrosActivos]);

  useEffect(() => {
    buscarPorTexto(debouncedSearch);
  }, [debouncedSearch]);

  const opcionesRubros = useMemo(
    () => rubrosDisponibles.map((rubro) => ({ value: rubro, label: ` ${rubro}` })),
    [rubrosDisponibles]
  );

  const handleCambiarVistaDeshabilitados = async (checked) => {
    setMostrarDeshabilitados(checked);
    checked ? await cargarDeshabilitados() : await cargarAfiliados();
  };

  const handleCambiarBusqueda = (valor) => setSearchValue(valor);
  const handleLimpiarBusqueda = ()      => setSearchValue('');

  const handleCambiarOrden = async (valor) => { setSelectOrden(valor); await ordenarPor(valor); };
  const handleCambiarPatente = async (valor) => { setSelectPatente(valor); await filtrarPorPatente(valor); };
  const handleCambiarPuestoCount = async (valor) => { setSelectPuestoCount(valor); await filtrarPorCantidadPuestos(valor ? parseInt(valor) : null); };
  const handleCambiarRubro = async (valor) => { setSelectRubro(valor); await filtrarPorRubro(valor); };

  const handleLimpiarFiltros = async () => {
    setSelectPatente(null); setSelectOrden('alfabetico');
    setSelectPuestoCount(null); setSelectRubro(null); setSearchValue('');
    await limpiarFiltros();
  };

  const handleLimpiarFiltroIndividual = async (tipo) => {
    switch (tipo) {
      case 'search':      setSearchValue(''); break;
      case 'conPatente':  setSelectPatente(null);     await filtrarPorPatente(null); break;
      case 'puestoCount': setSelectPuestoCount(null); await filtrarPorCantidadPuestos(null); break;
      case 'rubro':       setSelectRubro(null);       await filtrarPorRubro(null); break;
      case 'orden':       setSelectOrden('alfabetico'); await ordenarPor('alfabetico'); break;
      default: break;
    }
  };

  const hayFiltrosActivos = () =>
    filtrosActivos.search !== '' || filtrosActivos.conPatente !== null ||
    filtrosActivos.puestoCount !== null || filtrosActivos.rubro !== null ||
    filtrosActivos.orden !== 'alfabetico';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleExportarExcel = async () => {
    const listaAExportar = mostrarDeshabilitados ? afiliadosDeshabilitados : afiliados;

    if (!listaAExportar?.length) {
      notifications.show({ title: 'Sin datos para exportar', message: 'La lista actual no tiene afiliados. Ajusta los filtros e intenta de nuevo.', color: 'yellow', autoClose: 4000 });
      return;
    }

    const idNotif = notifications.show({
      title: 'Generando Excel...', message: `Preparando ${listaAExportar.length} registro${listaAExportar.length !== 1 ? 's' : ''}`,
      color: 'blue', loading: true, autoClose: false,
    });

    try {
      const { datos, columnas } = prepararDatosAfiliados(listaAExportar);
      await exportToExcel({ data: datos, columns: columnas, sheetName: 'Afiliados', fileName: mostrarDeshabilitados ? 'afiliados_deshabilitados' : 'afiliados_activos' });
      notifications.update({ id: idNotif, title: 'Excel generado', message: `${listaAExportar.length} afiliado${listaAExportar.length !== 1 ? 's' : ''} exportado${listaAExportar.length !== 1 ? 's' : ''} correctamente.`, color: 'green', icon: <IconCheck size={16} />, loading: false, autoClose: 3000 });
    } catch (err) {
      console.error('Error al exportar a Excel:', err);
      notifications.update({ id: idNotif, title: 'Error al exportar', message: err.message || 'Ocurrió un error inesperado al generar el archivo.', color: 'red', loading: false, autoClose: 5000 });
    }
  };

  return (
    <Container fluid p="md">
      <ModuleHeader title="Afiliados" />

      {conexion?.error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Modo sin conexión" color="yellow" mb="md">
          Usando datos locales. Para datos reales, inicia el servidor backend.
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Ejecuta: <code>cd backend && npm start</code></div>
        </Alert>
      )}

      {/* ── Tarea 10: Suspense condicionado a la apertura ──────
          El chunk de ModalAfiliado solo se descarga cuando el
          usuario abre el modal por primera vez. Visitas que no
          interactúan con el botón no pagan el coste de red.    */}
      {modalAbierto && (
        <Suspense fallback={<CargandoModal />}>
          <ModalAfiliado
            opened={modalAbierto}
            onClose={() => setModalAbierto(false)}
            onAfiliadoCreado={() => cargarAfiliados()}
          />
        </Suspense>
      )}

      <Paper p="xl" radius="lg" style={{ backgroundColor: 'white', minHeight: '70vh', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'relative' }}>
        <LoadingOverlay visible={cargando} zIndex={1000} overlayProps={{ blur: 2 }} />

        {error && !cargando && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {error}
            <Button variant="subtle" size="xs" onClick={() => cargarAfiliados()} style={{ marginLeft: '10px' }}>Reintentar</Button>
          </Alert>
        )}

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

        <Group justify="space-between" align="center" mb="xl">
          <Group gap="md">
            <Button
              leftSection={<IconPlus size={18} />} size="md" aria-label="Añadir nuevo afiliado"
              style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '100px', height: '40px', fontWeight: 300, padding: '0 25px' }}
              onClick={() => setModalAbierto(true)}
            >
              Añadir Afiliado
            </Button>
            <Button
              leftSection={<IconFileExport size={18} />} size="md" aria-label="Exportar lista a Excel"
              style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '100px', height: '40px', fontWeight: 300, padding: '0 25px' }}
              onClick={handleExportarExcel}
            >
              Exportar lista
            </Button>
            {hayFiltrosActivos() && (
              <Button leftSection={<IconX size={16} />} variant="subtle" color="gray" onClick={handleLimpiarFiltros} size="md" style={{ height: '40px' }}>
                Limpiar filtros
              </Button>
            )}
          </Group>

          <Group gap="md" align="center">
            <ToggleViewDeshabilitados mostrarDeshabilitados={mostrarDeshabilitados} onChange={handleCambiarVistaDeshabilitados} totalDeshabilitados={totalDeshabilitados} />
            <div style={{ width: '1px', height: '30px', backgroundColor: '#eee' }} />
            <Group gap="md" align="center">
              <Group gap="xs" align="center">
                <IconLayoutGrid size={18} style={{ color: !vistaTabla ? '#0f0f0f' : '#999' }} />
                <Switch
                  checked={vistaTabla} onChange={(e) => setVistaTabla(e.currentTarget.checked)}
                  size="lg" aria-label="Cambiar entre vista cards y tabla"
                  styles={{
                    track: { backgroundColor: vistaTabla ? '#0f0f0f' : '#e0e0e0', borderColor: vistaTabla ? '#0f0f0f' : '#e0e0e0', width: '50px', height: '26px' },
                    thumb: { backgroundColor: 'white', borderColor: '#0f0f0f', width: '22px', height: '22px' },
                  }}
                />
                <IconTable size={18} style={{ color: vistaTabla ? '#0f0f0f' : '#999' }} />
              </Group>
              <Group gap="xs">
                <Text size="sm" style={{ color: !vistaTabla ? '#0f0f0f' : '#999', fontWeight: !vistaTabla ? 600 : 400 }}>Cards</Text>
                <Text size="sm" style={{ color: '#999' }}>/</Text>
                <Text size="sm" style={{ color: vistaTabla ? '#0f0f0f' : '#999', fontWeight: vistaTabla ? 600 : 400 }}>Tabla</Text>
              </Group>
            </Group>
          </Group>
        </Group>

        {!cargando && !cargandoDeshabilitados && !error && (
          mostrarDeshabilitados ? (
            vistaTabla
              ? <TablaAfiliados afiliados={afiliadosDeshabilitados} esDeshabilitados={true} />
              : <ListaCards     afiliados={afiliadosDeshabilitados} esDeshabilitados={true} onRehabilitar={rehabilitarAfiliado} />
          ) : (
            vistaTabla
              ? <TablaAfiliados afiliados={afiliados} />
              : <ListaCards     afiliados={afiliados} />
          )
        )}

        {!cargando && !error && afiliados.length === 0 && (
          <Stack align="center" justify="center" style={{ height: '200px' }}>
            <IconSearch size={48} style={{ color: '#ccc' }} />
            <Title order={4} style={{ color: '#999' }}>No se encontraron afiliados</Title>
            <Text style={{ color: '#999' }}>
              {hayFiltrosActivos() ? 'No hay resultados para los filtros aplicados' : 'No hay afiliados registrados'}
            </Text>
            {hayFiltrosActivos() && (
              <Button variant="subtle" onClick={handleLimpiarFiltros} style={{ color: '#0f0f0f' }}>Limpiar todos los filtros</Button>
            )}
          </Stack>
        )}

        {!cargando && !error && afiliados.length > 0 && (
          <Text size="sm" style={{ color: '#666', marginTop: '20px', textAlign: 'center' }}>
            Mostrando {afiliados.length} afiliado{afiliados.length !== 1 ? 's' : ''}
            {hayFiltrosActivos() ? ' (filtrados)' : ''}
          </Text>
        )}
      </Paper>

      <Affix position={{ bottom: 30, right: 30 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button
              leftSection={<IconArrowUp size={18} />} aria-label="Volver al inicio de la página"
              style={{ ...transitionStyles, backgroundColor: '#0f0f0f', color: 'white', borderRadius: '50px', height: '50px', padding: '0 25px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', border: '2px solid #edbe3c', fontWeight: 600 }}
              onClick={scrollToTop}
            >
              Volver arriba
            </Button>
          )}
        </Transition>
      </Affix>
    </Container>
  );
};

export default AfiliadosModule;