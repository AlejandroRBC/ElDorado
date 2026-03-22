// ============================================
// MÓDULO GESTIÓN DE PUESTOS Y PATENTES
// ============================================

import { useState }                                     from 'react';
import { Button, Affix, Transition, Stack, Text,
         Loader, Pagination, Group }                    from '@mantine/core';
import { IconArrowUp }                                  from '@tabler/icons-react';
import { useDisclosure }                                from '@mantine/hooks';
import { useMediaQuery }                                from 'react-responsive';
import ModuleHeader                                     from '../Navegacion/components/ModuleHeader';
import { usePuestos }                                   from './hooks/usePuestos';
import { usePuestosFiltros }                            from './hooks/usePuestosFiltros';
import { FiltrosPuestos }                               from './components/FiltrosPuestos';
import { TablaPuestos }                                 from './components/TablaPuestos';
import { ModalMostrarHistorial }                        from './components/ModalMostrarHistorial';
import { ModalTraspaso }                                from './components/ModalTraspaso';
import { ModalEditarPuesto }                            from './components/ModalEditarPuesto';
import { ModalAsignarPuesto }                           from './components/ModalAsignarPuesto';
import './Styles/gestionpatentespuestos.css';

/**
 * Módulo principal de gestión de puestos y patentes.
 * Orquesta los filtros, la tabla y los modales de edición,
 * traspaso, historial y asignación de afiliados.
 */
function GestionPatentesPuestosModule() {
  const isMobile = useMediaQuery({ maxWidth: 640 });

  const [editarOpened,   { open: openEditar,   close: closeEditar   }] = useDisclosure(false);
  const [traspasoOpened, { open: openTraspaso, close: closeTraspaso }] = useDisclosure(false);
  const [historialOpened,{ open: openHistorial,close: closeHistorial}] = useDisclosure(false);
  const [asignarOpened,  { open: openAsignar,  close: closeAsignar  }] = useDisclosure(false);

  const {
    puestos, loading, error,
    puestoParaTraspaso,  setPuestoParaTraspaso,
    puestoParaAsignar,   setPuestoParaAsignar,
    puestoSeleccionado,  setPuestoSeleccionado,
    handleGuardarEdicion,
    handleEjecutarTraspaso,
    handleAsignacionExitosa,
  } = usePuestos(closeEditar, closeTraspaso, closeAsignar);

  // filtros contiene: puestosFiltrados (completo → export),
  // puestosPaginados (slice → tabla), paginaActual, totalPaginas, etc.
  const filtros = usePuestosFiltros(puestos);

  const [puestoEditar,    setPuestoEditar]    = useState(null);
  const [puestoHistorial, setPuestoHistorial] = useState(null);

  /**
   * Navega suavemente al inicio de la página.
   */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (loading && puestos.length === 0) {
    return (
      <Stack align="center" justify="center" style={{ height: '50vh' }}>
        <Loader size="xl" color="yellow" />
        <Text style={{ fontFamily: 'Poppins, sans-serif' }}>Cargando puestos...</Text>
      </Stack>
    );
  }

  const primerItem = (filtros.paginaActual - 1) * filtros.itemsPorPagina + 1;
  const ultimoItem = Math.min(filtros.paginaActual * filtros.itemsPorPagina, filtros.puestosFiltrados.length);

  return (
    <div className="gp-module" style={{ padding: isMobile ? '0.75rem' : '1.5rem' }}>

      {/* ── Título del módulo ── */}
      <ModuleHeader title="Gestión de Puestos" />

      {/* ── Modales ── */}
      <ModalMostrarHistorial
        opened={historialOpened}
        close={closeHistorial}
        puesto={puestoHistorial}
      />

      <ModalTraspaso
        opened={traspasoOpened}
        close={closeTraspaso}
        puestoSeleccionado={puestoParaTraspaso}
        onTraspaso={handleEjecutarTraspaso}
      />

      <ModalEditarPuesto
        opened={editarOpened}
        close={closeEditar}
        puesto={puestoEditar}
        onGuardar={handleGuardarEdicion}
      />

      <ModalAsignarPuesto
        opened={asignarOpened}
        close={closeAsignar}
        puesto={puestoParaAsignar}
        onAsignado={handleAsignacionExitosa}
      />

      {/* ── Panel de filtros ──
          puestos={filtros.puestosFiltrados} → el export en FiltrosPuestos
          usa la lista filtrada completa, no la paginada              ── */}
      <FiltrosPuestos
        {...filtros}
        puestos={filtros.puestosFiltrados}
        onTraspaso={() => { setPuestoParaTraspaso(null); openTraspaso(); }}
      />
            {/* ── Paginación y contador ────────────────────────────── */}
            {!loading && filtros.puestosFiltrados.length > 0 && (
        <Stack align="center" mt="xl" gap="xs">
          {filtros.totalPaginas > 1 && (
            <Pagination
              total={filtros.totalPaginas}
              value={filtros.paginaActual}
              onChange={filtros.setPaginaActual}
              color="dark"
              radius="xl"
              size="sm"
            />
          )}
          <Text size="sm" style={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
            {filtros.puestosFiltrados.length <= filtros.itemsPorPagina
              ? `${filtros.puestosFiltrados.length} puesto${filtros.puestosFiltrados.length !== 1 ? 's' : ''}`
              : `Mostrando ${primerItem}–${ultimoItem} de ${filtros.puestosFiltrados.length} puestos`
            }
          </Text>
        </Stack>
      )}

      {/* ── Tabla de puestos → recibe solo la página actual ── */}
      <TablaPuestos
        puestos={filtros.puestosPaginados}
        loading={loading}
        onEditar={(p)       => { setPuestoEditar(p);    openEditar();   }}
        onVerHistorial={(p) => { setPuestoHistorial(p); openHistorial();}}
        onTraspaso={(p)     => { setPuestoParaTraspaso(p); openTraspaso(); }}
        onAsignar={(p)      => { setPuestoParaAsignar(p);  openAsignar();  }}
      />

      {/* ── FAB volver arriba ── */}
      <Affix position={{ bottom: 30, right: 30 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button
              leftSection={<IconArrowUp size={18} />}
              className="gp-fab"
              style={transitionStyles}
              onClick={scrollToTop}
            >
              Volver arriba
            </Button>
          )}
        </Transition>
      </Affix>
    </div>
  );
}

export default GestionPatentesPuestosModule;