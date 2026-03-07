// src/modules/Mapa/components/BuscadorMapa.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { IconSearch, IconX, IconMapPin } from '@tabler/icons-react';
import '../Styles/mapa.css';

// ============================================
// COMPONENTE BUSCADOR MAPA
// ============================================

/**
 * Opciones del select de filtro por fila.
 */
const FILAS = [
  { value: 'todos',    label: 'Todos'     },
  { value: 'A',        label: 'Fila A'    },
  { value: 'B',        label: 'Fila B'    },
  { value: 'Callejon', label: 'Callejón'  },
];

/**
 * Leyenda de colores del mapa.
 */
const LEYENDA = [
  { color: '#4caf50', label: 'Con afiliado y patente' },
  { color: '#EDBE3C', label: 'Sin patente'            },
  { color: '#f44336', label: 'Sin afiliado'           },
];

/**
 * Barra superior del mapa con buscador de puestos/afiliados
 * y select de filtro por fila.
 *
 * @param {string}   busqueda           - Texto actual del buscador
 * @param {Function} onBuscar           - Callback al escribir en el buscador
 * @param {Array}    resultados         - Lista de puestos encontrados
 * @param {boolean}  mostrarResultados  - Si se muestra el dropdown
 * @param {Function} onSeleccionar      - Callback al elegir un resultado
 * @param {Function} onCerrarResultados - Callback al cerrar el dropdown
 * @param {string}   filtroFila         - Fila actualmente seleccionada
 * @param {Function} onFiltroChange     - Callback al cambiar el filtro
 */
const BuscadorMapa = ({
  busqueda,
  onBuscar,
  resultados,
  mostrarResultados,
  onSeleccionar,
  onCerrarResultados,
  filtroFila,
  onFiltroChange,
}) => {
  const inputRef   = useRef(null);
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);
  // ── Responsive ──
  const isMobile = useMediaQuery({ maxWidth: 640 });

  // ── Cerrar dropdown al hacer click fuera ──
  useEffect(() => {
    /**
     * Detecta click fuera del wrapper y cierra resultados.
     * @param {MouseEvent} e
     */
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onCerrarResultados();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCerrarResultados]);

  useEffect(() => {
    /**
     * Detecta click fuera del select y cierra resultados.
     * @param {MouseEvent} e
     */
  const handleClickOutsideSelect = (e) => {
    if (selectRef.current && !selectRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutsideSelect);

  return () => {
    document.removeEventListener('mousedown', handleClickOutsideSelect);
  };

}, []);

  return (
    <div
      className="buscador-root"
      style={{ flexDirection: isMobile ? 'column' : 'row' }}
    >

      {/* ── Input buscador ── */}
      <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
        <div className="buscador-input-wrapper">
          <IconSearch size={15} color="#999" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por Nombre/CI/N° puesto..."
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            className="buscador-input"
          />
          {busqueda && (
            <button
              onClick={() => onBuscar('')}
              className="buscador-clear-btn"
            >
              <IconX size={13} />
            </button>
          )}
        </div>

        {/* ── Dropdown resultados ── */}
        {mostrarResultados && resultados.length > 0 && (
          <div className="buscador-dropdown">
            {resultados.map((puesto) => (
              <div
                key={`${puesto.fila}-${puesto.nroPuesto}`}
                onClick={() => onSeleccionar(puesto)}
                className="buscador-resultado-item"
              >
                <div className="buscador-resultado-icono">
                  <IconMapPin size={14} color="#0f0f0f" />
                </div>
                <div>
                  <div className="buscador-resultado-nombre">
                    Puesto {puesto.nroPuesto} — {puesto.cuadra === 'Callejón' ? 'Fila A - Callejón' : `Fila ${puesto.fila}`}
                  </div>
                  {puesto.afiliadoInfo ? (
                    <div className="buscador-resultado-ci">
                      {puesto.afiliadoInfo.nombre} · CI: {puesto.afiliadoInfo.ci}
                    </div>
                  ) : (
                    <div className="buscador-resultado-sin-afiliado">
                      Sin afiliado asignado
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Sin resultados ── */}
        {mostrarResultados && resultados.length === 0 && busqueda.trim() && (
          <div className="buscador-sin-resultados">
            Sin resultados para "{busqueda}"
          </div>
        )}
      </div>

      {/* ── Select filtro fila ── */}
      <div className="custom-select" ref={selectRef}>
        <div
          className="custom-select-selected"
          onClick={() => setOpen(!open)}
        >
          <span>
            {FILAS.find(f => f.value === filtroFila)?.label}
          </span>

          <span className={`custom-select-icon ${open ? "open" : ""}`}>
            ▾
          </span>
        </div>

        {open && (
          <div className="custom-select-dropdown">
            {FILAS.map(({ value, label }) => (
              <div
                key={value}
                className="custom-select-option"
                onClick={() => {
                  onFiltroChange(value);
                  setOpen(false);
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Leyenda de colores (oculta en móvil) ── */}
      {!isMobile && (
        <div className="buscador-leyenda">
          {LEYENDA.map(({ color, label }) => (
            <div key={label} className="leyenda-item">
              <div className="leyenda-punto" style={{ backgroundColor: color }} />
              <span className="leyenda-label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuscadorMapa;