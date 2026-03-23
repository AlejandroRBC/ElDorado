// frontend/src/modules/Afiliados/components/ui/AfiliadoFilters.jsx
//
// FUSIONA: BarraFiltros + FiltrosActivos + botones de acción
// Todo vive dentro de un único af-filtros-paper.
//
// Exports:
//   PanelFiltros         ← componente principal unificado
//   ToggleDeshabilitados
//   CustomSelect

import { memo, useState, useRef, useEffect } from 'react';
import { Switch, Button }                     from '@mantine/core';
import {
  IconSearch, IconX, IconTrash,
  IconPlus, IconFileExport,
} from '@tabler/icons-react';
import {
  OPCIONES_PATENTE,
  OPCIONES_ORDEN,
  OPCIONES_PUESTO_COUNT,
} from '../../constantes/opcionesFiltros';
import '../../styles/afiliados-gp.css';

// ─────────────────────────────────────────────────────────────
// CustomSelect — nativo, sin Mantine Select
// ─────────────────────────────────────────────────────────────

const OPTS_PATENTE      = [{ value: '', label: 'Todas' },      ...OPCIONES_PATENTE];
const OPTS_ORDEN        = [...OPCIONES_ORDEN];
const OPTS_PUESTO_COUNT = [{ value: '', label: 'Todos' },      ...OPCIONES_PUESTO_COUNT];

export const CustomSelect = memo(({ value, onChange, opciones, placeholder }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const valorStr     = value === null || value === undefined ? '' : String(value);
  const opcionActual = opciones.find((o) => o.value === valorStr);
  const label        = opcionActual?.label || placeholder;

  return (
    <div className="af-custom-select" ref={ref}>
      <div className="af-custom-select-selected" onClick={() => setAbierto((v) => !v)}>
        <span>{label}</span>
        <span className={`af-custom-select-icon ${abierto ? 'open' : ''}`}>▾</span>
      </div>
      {abierto && (
        <div className="af-custom-select-dropdown">
          {opciones.map(({ value: v, label: l }) => (
            <div key={v} className="af-custom-select-option"
              onClick={() => { onChange(v === '' ? null : v); setAbierto(false); }}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
CustomSelect.displayName = 'CustomSelect';

// ─────────────────────────────────────────────────────────────
// Helper de etiqueta para los badges
// ─────────────────────────────────────────────────────────────

const obtenerEtiqueta = (tipo, valor) => {
  switch (tipo) {
    case 'search':      return `Búsqueda: ${valor}`;
    case 'conPatente':  return valor === 'true' ? 'Con patente' : 'Sin patente';
    case 'puestoCount': return valor === '5' ? '5+ puestos' : `${valor} puesto${valor !== '1' ? 's' : ''}`;
    case 'rubro':       return `Rubro: ${valor}`;
    case 'orden':       return `Orden: ${valor === 'registro' ? 'Fecha registro' : valor}`;
    default:            return valor;
  }
};

// ─────────────────────────────────────────────────────────────
// PanelFiltros — todo dentro del af-filtros-paper
// ─────────────────────────────────────────────────────────────

/**
 * Props filtros:
 *   valores             — { searchValue, selectPatente, selectOrden, selectPuestoCount, selectRubro }
 *   opcionesRubros      — [{ value, label }]
 *   cargando
 *   alCambiarBusqueda / alLimpiarBusqueda
 *   alCambiarPatente / alCambiarOrden / alCambiarPuestoCount / alCambiarRubro
 *
 * Props badges:
 *   filtrosActivos      — objeto del hook
 *   hayFiltrosActivos   — boolean
 *   alLimpiarFiltro     — (tipo) => void
 *   alLimpiarTodos      — () => void
 *
 * Props acciones:
 *   esSuperAdmin
 *   onAnadirAfiliado
 *   onExportarExcel
 */
export const PanelFiltros = memo(({
  valores = {}, opcionesRubros = [], cargando = false,
  alCambiarBusqueda, alLimpiarBusqueda,
  alCambiarPatente, alCambiarOrden, alCambiarPuestoCount, alCambiarRubro,
  filtrosActivos = {}, hayFiltrosActivos = false,
  alLimpiarFiltro, alLimpiarTodos,
  esSuperAdmin = false,
  onAnadirAfiliado,
  onExportarExcel,
}) => {
  const {
    searchValue = '', selectPatente = null, selectOrden = 'alfabetico',
    selectPuestoCount = null, selectRubro = null,
  } = valores;

  const optsRubro = [{ value: '', label: 'Todos los rubros' }, ...opcionesRubros];

  const filtrosVisibles = [
    filtrosActivos.search      && { tipo: 'search',      valor: filtrosActivos.search },
    filtrosActivos.conPatente  != null && { tipo: 'conPatente',  valor: String(filtrosActivos.conPatente) },
    filtrosActivos.puestoCount != null && { tipo: 'puestoCount', valor: String(filtrosActivos.puestoCount) },
    filtrosActivos.rubro       && { tipo: 'rubro',       valor: filtrosActivos.rubro },
    filtrosActivos.orden && filtrosActivos.orden !== 'alfabetico'
      && { tipo: 'orden', valor: filtrosActivos.orden },
  ].filter(Boolean);

  return (
    <div className="af-filtros-paper" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>

      {/* ── Fila 1: inputs de filtro ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>

        <div style={{ flex: '2 1 220px' }}>
          <span className="af-filtro-label">Buscar</span>
          <div className="af-search-wrapper">
            <IconSearch size={15} color="#999" style={{ flexShrink: 0 }} />
            <input
              type="text"
              className="af-search-input"
              placeholder="Nombre, CI, apellido…"
              value={searchValue}
              onChange={(e) => alCambiarBusqueda(e.target.value)}
              disabled={cargando}
            />
            {searchValue && (
              <button className="af-search-clear" onClick={alLimpiarBusqueda} title="Limpiar búsqueda">
                <IconX size={13} />
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: '1 1 130px' }}>
          <span className="af-filtro-label">Patente</span>
          <CustomSelect value={selectPatente} onChange={alCambiarPatente}
            opciones={OPTS_PATENTE} placeholder="Todas" />
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <span className="af-filtro-label">Ordenar por</span>
          <CustomSelect value={selectOrden} onChange={alCambiarOrden}
            opciones={OPTS_ORDEN} placeholder="Orden Alfabético" />
        </div>

        <div style={{ flex: '1 1 130px' }}>
          <span className="af-filtro-label">Puestos</span>
          <CustomSelect value={selectPuestoCount} onChange={alCambiarPuestoCount}
            opciones={OPTS_PUESTO_COUNT} placeholder="Todos" />
        </div>

        <div style={{ flex: '1 1 160px' }}>
          <span className="af-filtro-label">Rubro</span>
          <CustomSelect value={selectRubro} onChange={alCambiarRubro}
            opciones={optsRubro} placeholder="Todos los rubros" />
        </div>
      </div>

      {/* ── Separador ── */}
      <div style={{ height: '1px', backgroundColor: '#eee', margin: '12px 0' }} />

      {/* ── Fila 2: botones de acción ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {esSuperAdmin && (
          <Button size="sm" leftSection={<IconPlus size={16} />}
            className="af-btn-primario" onClick={onAnadirAfiliado}>
            Añadir Afiliado
          </Button>
        )}
        <Button size="sm" leftSection={<IconFileExport size={16} />}
          className="af-btn-exportar" onClick={onExportarExcel}>
          Exportar lista
        </Button>
      </div>

      {/* ── Fila 3: badges de filtros activos (solo si hay alguno) ── */}
      {filtrosVisibles.length > 0 && (
        <div className="af-filtros-activos" style={{ margin: '10px 0 0 0' }}>
          <span className="af-filtros-activos-label">Filtros:</span>
          {filtrosVisibles.map(({ tipo, valor }) => (
            <span key={tipo} className="af-filtro-badge">
              {obtenerEtiqueta(tipo, valor)}
              <button className="af-filtro-badge-x"
                onClick={() => alLimpiarFiltro(tipo)}
                aria-label={`Quitar filtro ${tipo}`}>
                <IconX size={11} />
              </button>
            </span>
          ))}
          <button
            onClick={alLimpiarTodos}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '11px', color: '#999',
              fontFamily: 'Poppins, sans-serif',
              padding: '2px 8px', borderRadius: '100px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0f0f0f'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
          >
            Limpiar todos
          </button>
        </div>
      )}
    </div>
  );
});
PanelFiltros.displayName = 'PanelFiltros';

// ─────────────────────────────────────────────────────────────
// ToggleDeshabilitados
// ─────────────────────────────────────────────────────────────

export const ToggleDeshabilitados = memo(({ mostrarDeshabilitados, onChange, totalDeshabilitados = 0 }) => {
  const iconColor = mostrarDeshabilitados ? '#0f0f0f' : '#C4C4C4';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {totalDeshabilitados > 0 && (
        <span style={{ fontSize: '12px', color: '#999', fontFamily: 'Poppins, sans-serif' }}>
          {totalDeshabilitados} deshabilitado{totalDeshabilitados !== 1 ? 's' : ''}
        </span>
      )}
      <Switch
        checked={mostrarDeshabilitados}
        onChange={(e) => onChange(e.currentTarget.checked)}
        size="lg"
        styles={{
          track: {
            backgroundColor: mostrarDeshabilitados ? '#0f0f0f' : '#e0e0e0',
            borderColor:     mostrarDeshabilitados ? '#0f0f0f' : '#e0e0e0',
            width: '50px', height: '26px',
          },
          thumb: { backgroundColor: 'white', borderColor: '#0f0f0f', width: '22px', height: '22px' },
        }}
      />
      <IconTrash size={18} style={{ color: iconColor }} />
    </div>
  );
});
ToggleDeshabilitados.displayName = 'ToggleDeshabilitados';

// Alias de compatibilidad
export { PanelFiltros as BarraFiltros };