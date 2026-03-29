// ============================================================
// COMPONENTE FILTROS PUESTOS
// ============================================================

import { useRef, useEffect, useState }                   from 'react';
import { Group, Stack, Paper, Button }                   from '@mantine/core';
import { IconSearch, IconX, IconArrowsExchange,
         IconFileExport, IconMapPin }                    from '@tabler/icons-react';
import { useMediaQuery }                                 from 'react-responsive';
import { useLogin }                                      from '../../../context/LoginContext';
import { exportarPuestosExcel }                          from '../exports/puestosExport';
import '../Styles/gestionpatentespuestos.css';

// Reutilizamos los estilos af- para los badges (ya creados)
import '../../../modules/Afiliados/styles/afiliados-gp.css';

const OPCIONES_PATENTE = [
  { value: 'Todo', label: 'Todo' },
  { value: 'si',   label: 'Con Patente' },
  { value: 'no',   label: 'Sin Patente' },
];

const OPCIONES_FILA = [
  { value: 'Todo', label: 'Todo' },
  { value: 'A',    label: 'Fila A' },
  { value: 'B',    label: 'Fila B' },
];

const OPCIONES_CUADRA = [
  { value: 'Todo',     label: 'Todo'     },
  { value: 'Cuadra 1', label: 'Cuadra 1' },
  { value: 'Cuadra 2', label: 'Cuadra 2' },
  { value: 'Cuadra 3', label: 'Cuadra 3' },
  { value: 'Cuadra 4', label: 'Cuadra 4' },
  { value: 'Callejón', label: 'Callejón' },
];

// ── Custom select ─────────────────────────────────────────────
const CustomSelect = ({ value, onChange, opciones, placeholder }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label = opciones.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="gp-custom-select" ref={ref}>
      <div className="gp-custom-select-selected" onClick={() => setAbierto(!abierto)}>
        <span>{label}</span>
        <span className={`gp-custom-select-icon ${abierto ? 'open' : ''}`}>▾</span>
      </div>
      {abierto && (
        <div className="gp-custom-select-dropdown">
          {opciones.map(({ value: v, label: l }) => (
            <div key={v} className="gp-custom-select-option" onClick={() => { onChange(v); setAbierto(false); }}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Helpers para etiquetas de filtros activos ─────────────────
const esActivo = (val) => val && val !== 'Todo';

const etiquetaPatente = (val) =>
  val === 'si' ? 'Con Patente' : val === 'no' ? 'Sin Patente' : val;

// ── FiltrosActivosPuestos ─────────────────────────────────────
/**
 * Muestra los badges de filtros activos del módulo de puestos.
 * Usa las clases af- de afiliados-gp.css para consistencia visual.
 */
const FiltrosActivosPuestos = ({ search, filtroPatente, filtroFila, filtroCuadra, setSearch, setFiltroPatente, setFiltroFila, setFiltroCuadra }) => {
  const filtros = [
    esActivo(search)        && { key: 'search',   label: `Búsqueda: ${search}`,       clear: () => setSearch('') },
    esActivo(filtroPatente) && { key: 'patente',  label: etiquetaPatente(filtroPatente), clear: () => setFiltroPatente(null) },
    esActivo(filtroFila)    && { key: 'fila',     label: `Fila ${filtroFila}`,         clear: () => setFiltroFila(null) },
    esActivo(filtroCuadra)  && { key: 'cuadra',   label: filtroCuadra,                 clear: () => setFiltroCuadra(null) },
  ].filter(Boolean);

  if (filtros.length === 0) return null;

  return (
    <div className="af-filtros-activos" style={{ marginTop: '4px' }}>
      <span className="af-filtros-activos-label">Filtros:</span>
      {filtros.map(({ key, label, clear }) => (
        <span key={key} className="af-filtro-badge">
          {label}
          <button className="af-filtro-badge-x" onClick={clear} aria-label={`Quitar filtro: ${label}`}>
            <IconX size={11} />
          </button>
        </span>
      ))}
    </div>
  );
};

// ── FiltrosPuestos ────────────────────────────────────────────
/**
 * Panel de filtros con buscador dropdown, selects custom y
 * badges de filtros activos.
 */
export function FiltrosPuestos({
  puestos,
  puestosFiltrados,
  search,        setSearch,
  filtroPatente, setFiltroPatente,
  filtroFila,    setFiltroFila,
  filtroCuadra,  setFiltroCuadra,
  limpiarFiltros,
  onTraspaso,
}) {
  const isMobile     = useMediaQuery({ maxWidth: 640 });
  const hayFiltros   = esActivo(search) || esActivo(filtroPatente) || esActivo(filtroFila) || esActivo(filtroCuadra);
  const wrapperRef   = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const resultadosDropdown = search.trim().length >= 1
    ? puestos
        .filter(p => {
          if (Number(p.nroPuesto) > 10000) return false;
          const t = search.toLowerCase().trim();
          return (
            String(p.nroPuesto).includes(t) ||
            (p.apoderado || '').toLowerCase().includes(t) ||
            (p.ci || '').includes(t)
          );
        })
        .sort((a, b) => {
          const nroA = Number(a.nroPuesto);
          const nroB = Number(b.nroPuesto);
          if (nroA !== nroB) return nroA - nroB;
          return (a.fila || '').localeCompare(b.fila || '');
        })
        .slice(0, 10)
    : [];

  return (
    <Paper className="gp-filtros-paper" p="lg" mb="xl">
      <Stack gap="md">

        {/* ── Fila de controles ── */}
        <Group gap="md" align="center" style={{ flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>

          {/* Buscador con dropdown */}
          <div ref={wrapperRef} style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '2' }}>
            <div className="gp-search-wrapper">
              <IconSearch size={15} color="#999" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Buscar por apoderado, CI o N° puesto..."
                value={search}
                onChange={(e) => { setSearch(e.currentTarget.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="gp-search-input"
              />
              {search && (
                <button onClick={() => { setSearch(''); setShowDropdown(false); }} className="gp-search-clear-btn">
                  <IconX size={13} />
                </button>
              )}
            </div>

            {showDropdown && resultadosDropdown.length > 0 && (
              <div className="gp-search-dropdown">
                {resultadosDropdown.map((p) => (
                  <div
                    key={p.id_puesto}
                    className="gp-search-dropdown-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const t = search.toLowerCase().trim();
                      let valorSeleccionado;
                      if (p.ci && p.ci.includes(t)) {
                        valorSeleccionado = p.ci;
                      } else if (p.apoderado && p.apoderado.toLowerCase().includes(t)) {
                        valorSeleccionado = p.apoderado;
                      } else {
                        valorSeleccionado = String(p.nroPuesto);
                      }
                      setSearch(valorSeleccionado);
                      setShowDropdown(false);
                    }}
                  >
                    <div className="gp-search-dropdown-icono">
                      <IconMapPin size={14} color="#0f0f0f" />
                    </div>
                    <div>
                      <div className="gp-search-dropdown-nombre">
                        Puesto {p.nroPuesto} — Fila {p.fila} {p.cuadra}
                      </div>
                      <div className="gp-search-dropdown-ci">
                        {p.apoderado || 'Vacante'}{p.ci ? ` · CI: ${p.ci}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showDropdown && search.trim().length >= 1 && resultadosDropdown.length === 0 && (
              <div className="buscador-sin-resultados">
                Sin resultados para &ldquo;{search}&rdquo;
              </div>
            )}
          </div>

          <CustomSelect value={filtroPatente} onChange={setFiltroPatente} opciones={OPCIONES_PATENTE} placeholder="Estado Patente" />
          <CustomSelect value={filtroFila}    onChange={setFiltroFila}    opciones={OPCIONES_FILA}    placeholder="Fila" />
          <CustomSelect value={filtroCuadra}  onChange={setFiltroCuadra}  opciones={OPCIONES_CUADRA}  placeholder="Cuadra" />
        </Group>

        {/* ── Botones de acción ── */}
        <Group justify="space-between" style={{ flexDirection: isMobile ? 'column' : 'row' }}>
          <Group gap="md" style={{ flexWrap: 'wrap' }}>
            {esSuperAdmin && (
              <Button leftSection={<IconArrowsExchange size={18} />} className="gp-btn-traspaso" onClick={onTraspaso}>
                Realizar Traspaso
              </Button>
            )}
            <Button
              leftSection={<IconFileExport size={18} />}
              className="gp-btn-exportar"
              onClick={() => exportarPuestosExcel(puestosFiltrados)} 
            >
              Generar Reporte General
            </Button>
          </Group>

          {hayFiltros && (
            <Button variant="subtle" size="xs" onClick={limpiarFiltros} leftSection={<IconX size={14} />} className="gp-btn-limpiar">
              Limpiar Filtros
            </Button>
          )}
        </Group>

        {/* ── Badges filtros activos ── */}
        <FiltrosActivosPuestos
          search={search}
          filtroPatente={filtroPatente}
          filtroFila={filtroFila}
          filtroCuadra={filtroCuadra}
          setSearch={setSearch}
          setFiltroPatente={setFiltroPatente}
          setFiltroFila={setFiltroFila}
          setFiltroCuadra={setFiltroCuadra}
        />

      </Stack>
    </Paper>
  );
}