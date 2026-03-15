// modules/Directorio/components/BuscadorAfiliado.jsx

// ============================================================
// COMPONENTE BUSCADOR AFILIADO
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal }      from 'react-dom';
import { IconSearch, IconX, IconUser } from '@tabler/icons-react';
import { Loader }            from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { directorioService } from '../services/directorioService';
import '../styles/directorio.css';

/**
 * Input de búsqueda de afiliados con dropdown via createPortal.
 * Diseño unificado con BuscadorMapa: fondo F6F9FF, borde negro al focus.
 *
 * value        - Texto controlado desde el padre
 * onChange      - Callback al cambiar texto
 * onSeleccionar - Callback al elegir afiliado
 * placeholder   - Placeholder del input
 * disabled      - Deshabilita el input
 */
const BuscadorAfiliado = ({
  value         = '',
  onChange,
  onSeleccionar,
  placeholder   = 'Buscar por nombre o CI...',
  disabled      = false,
}) => {
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  const [textoBusq,  setTextoBusq]  = useState(value);
  const [resultados, setResultados] = useState([]);
  const [buscando,   setBuscando]   = useState(false);
  const [abierto,    setAbierto]    = useState(false);
  const [pos,        setPos]        = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => { setTextoBusq(value); }, [value]);

  const [debouncedTexto] = useDebouncedValue(textoBusq, 280);

  // ── Búsqueda debounced ──
  useEffect(() => {
    if (debouncedTexto.trim().length < 2) { setResultados([]); setAbierto(false); return; }
    let activo = true;
    setBuscando(true);
    directorioService.buscarAfiliados(debouncedTexto)
      .then((data) => { if (!activo) return; setResultados(data.slice(0, 8)); setAbierto(data.length > 0); })
      .catch(() => { if (activo) setResultados([]); })
      .finally(() => { if (activo) setBuscando(false); });
    return () => { activo = false; };
  }, [debouncedTexto]);

  /**
   * Calcula posición del dropdown bajo el input.
   */
  const calcularPos = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
  }, []);

  useEffect(() => {
    if (!abierto) return;
    calcularPos();
    window.addEventListener('resize', calcularPos);
    window.addEventListener('scroll', calcularPos, true);
    return () => { window.removeEventListener('resize', calcularPos); window.removeEventListener('scroll', calcularPos, true); };
  }, [abierto, calcularPos]);

  useEffect(() => {
    if (!abierto) return;
    const handler = (e) => {
      const portalEl = document.getElementById('dir-buscador-portal');
      if (wrapRef.current && !wrapRef.current.contains(e.target) && !(portalEl && portalEl.contains(e.target))) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [abierto]);

  const handleCambioTexto = (e) => {
    const texto = e.target.value;
    setTextoBusq(texto);
    if (onChange) onChange(texto);
    if (!texto && onSeleccionar) onSeleccionar(null);
  };

  /**
   * Selecciona afiliado y cierra dropdown.
   */
  const handleSeleccionar = useCallback((af) => {
    const nombre = `${af.nombre} ${af.paterno} ${af.materno || ''}`.trim();
    setTextoBusq(nombre);
    setAbierto(false);
    setResultados([]);
    if (onSeleccionar) onSeleccionar(af);
  }, [onSeleccionar]);

  /**
   * Limpia el input.
   */
  const handleLimpiar = () => {
    setTextoBusq('');
    setResultados([]);
    setAbierto(false);
    if (onSeleccionar) onSeleccionar(null);
    if (onChange) onChange('');
  };

  const dropdown = abierto && createPortal(
    <div
      id="dir-buscador-portal"
      className="dir-buscador-dropdown"
      style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
    >
      {resultados.length === 0
        ? <div className="dir-buscador-vacio">Sin resultados</div>
        : resultados.map((af) => (
            <div
              key={af.id || af.id_afiliado}
              className="dir-buscador-item"
              onMouseDown={(e) => { e.preventDefault(); handleSeleccionar(af); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--dir-accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <IconUser size={14} color="#0f0f0f" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}> 
                  <span className="dir-buscador-item-nombre">{af.nombre} {af.paterno} {af.materno || ''}</span>
                  <span className="dir-buscador-item-ci">CI: {af.ci} {af.extension || ''}</span>
                </div>
              </div>
            </div>
          ))
      }
    </div>,
    document.body
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div className="dir-buscador-wrapper" ref={inputRef}>
        {buscando ? <Loader size={14} color="dark" style={{ flexShrink: 0 }} /> : <IconSearch size={14} color="#999" style={{ flexShrink: 0 }} />}
        <input
          type="text"
          value={textoBusq}
          onChange={handleCambioTexto}
          placeholder={placeholder}
          disabled={disabled}
          className="dir-buscador-input"
          onFocus={() => { if (resultados.length > 0) { calcularPos(); setAbierto(true); } }}
        />
        {textoBusq && <button onClick={handleLimpiar} className="dir-buscador-clear-btn" type="button"><IconX size={13} /></button>}
      </div>
      {dropdown}
    </div>
  );
};

export default BuscadorAfiliado;