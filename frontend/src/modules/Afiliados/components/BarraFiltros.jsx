import { memo, useState, useRef, useEffect } from 'react';
import { IconSearch, IconX }                 from '@tabler/icons-react';
import {
  OPCIONES_PATENTE,
  OPCIONES_ORDEN,
  OPCIONES_PUESTO_COUNT,
} from '../constantes/opcionesFiltros';
import '../styles/afiliados-gp.css';

const OPTS_PATENTE      = [{ value: '', label: 'Todas' }, ...OPCIONES_PATENTE];
const OPTS_ORDEN        = [...OPCIONES_ORDEN];
const OPTS_PUESTO_COUNT = [{ value: '', label: 'Todos' }, ...OPCIONES_PUESTO_COUNT];

// ─────────────────────────────────────────────────────────────
// CustomSelect
// ─────────────────────────────────────────────────────────────
const CustomSelect = memo(({ value, onChange, opciones, placeholder }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Coerción a string: resuelve el bug número vs string
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
            <div
              key={v}
              className="af-custom-select-option"
              onClick={() => { onChange(v === '' ? null : v); setAbierto(false); }}
            >
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
// BarraFiltros
// ─────────────────────────────────────────────────────────────
const BarraFiltros = memo(({
  valores = {}, opcionesRubros = [], cargando = false,
  alCambiarBusqueda, alLimpiarBusqueda,
  alCambiarPatente, alCambiarOrden, alCambiarPuestoCount, alCambiarRubro,
}) => {
  const {
    searchValue = '', selectPatente = null, selectOrden = 'alfabetico',
    selectPuestoCount = null, selectRubro = null,
  } = valores;

  const optsRubro = [{ value: '', label: 'Todos los rubros' }, ...opcionesRubros];

  return (
    <div className="af-filtros-paper" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>

        {/* Buscador */}
        <div style={{ flex: '2 1 220px' }}>
          <span className="af-filtro-label">Buscar</span>
          <div className="af-search-wrapper">
            <IconSearch size={15} color="#999" style={{ flexShrink: 0 }} />
            <input
              type="text"
              className="af-search-input"
              placeholder="Nombre, CI, rubro, puesto..."
              value={searchValue}
              onChange={(e) => alCambiarBusqueda(e.target.value)}
            />
            {searchValue && (
              <button className="af-search-clear-btn" onClick={alLimpiarBusqueda} aria-label="Limpiar búsqueda">
                <IconX size={13} />
              </button>
            )}
          </div>
          {searchValue && (
            <span style={{ fontSize: '11px', color: '#aaa', marginTop: '3px', display: 'block' }}>
              {cargando ? 'Buscando...' : `Resultados para "${searchValue}"`}
            </span>
          )}
        </div>

        {/* Patente */}
        <div style={{ flex: '1 1 150px' }}>
          <span className="af-filtro-label">Patente</span>
          <CustomSelect value={selectPatente} onChange={alCambiarPatente} opciones={OPTS_PATENTE} placeholder="Todas" />
        </div>

        {/* Orden */}
        <div style={{ flex: '1 1 150px' }}>
          <span className="af-filtro-label">Ordenar</span>
          <CustomSelect value={selectOrden} onChange={alCambiarOrden} opciones={OPTS_ORDEN} placeholder="Ordenar por..." />
        </div>

        {/* # Puestos */}
        <div style={{ flex: '1 1 150px' }}>
          <span className="af-filtro-label"># Puestos</span>
          <CustomSelect value={selectPuestoCount} onChange={alCambiarPuestoCount} opciones={OPTS_PUESTO_COUNT} placeholder="Todos" />
        </div>

        {/* Rubro */}
        <div style={{ flex: '1 1 160px' }}>
          <span className="af-filtro-label">Rubro</span>
          <CustomSelect value={selectRubro} onChange={alCambiarRubro} opciones={optsRubro} placeholder="Todos los rubros" />
        </div>

      </div>
    </div>
  );
});
BarraFiltros.displayName = 'BarraFiltros';

export default BarraFiltros;