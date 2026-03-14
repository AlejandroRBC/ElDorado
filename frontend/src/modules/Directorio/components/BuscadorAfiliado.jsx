import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal }                             from 'react-dom';
import { TextInput, ActionIcon, Loader }            from '@mantine/core';
import { IconSearch, IconX }                        from '@tabler/icons-react';
import { useDebouncedValue }                        from '@mantine/hooks';
import { directorioService }                        from '../services/directorioService';
import '../styles/directorio.css';

// ============================================================
// BUSCADOR AFILIADO
// Dropdown renderizado via createPortal para evitar el clipping
// del ScrollArea / overflow del modal. La posición se calcula
// con getBoundingClientRect y se actualiza en resize y scroll.
// ============================================================

const BuscadorAfiliado = ({
  value         = '',
  onChange,
  onSeleccionar,
  placeholder   = 'Buscar por nombre o CI...',
  disabled      = false,
}) => {
  const inputRef = useRef(null);
  const wrapRef  = useRef(null);

  const [textoBusq,  setTextoBusq]  = useState(value);
  const [resultados, setResultados] = useState([]);
  const [buscando,   setBuscando]   = useState(false);
  const [abierto,    setAbierto]    = useState(false);
  const [pos,        setPos]        = useState({ top: 0, left: 0, width: 0 });

  // Sincroniza cuando el padre limpia externamente
  useEffect(() => { setTextoBusq(value); }, [value]);

  const [debouncedTexto] = useDebouncedValue(textoBusq, 280);

  // ── Búsqueda debounced ──────────────────────────────────
  useEffect(() => {
    if (debouncedTexto.trim().length < 2) {
      setResultados([]);
      setAbierto(false);
      return;
    }
    let activo = true;
    setBuscando(true);
    directorioService.buscarAfiliados(debouncedTexto)
      .then((data) => {
        if (!activo) return;
        setResultados(data.slice(0, 8));
        setAbierto(data.length > 0);
      })
      .catch(() => { if (activo) setResultados([]); })
      .finally(() => { if (activo) setBuscando(false); });
    return () => { activo = false; };
  }, [debouncedTexto]);

  // ── Calcula la posición del dropdown bajo el input ──────
  const calcularPos = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPos({
      top:   rect.bottom + window.scrollY + 4,
      left:  rect.left   + window.scrollX,
      width: rect.width,
    });
  }, []);

  // Recalcular al abrir y en cualquier resize / scroll
  useEffect(() => {
    if (!abierto) return;
    calcularPos();
    window.addEventListener('resize', calcularPos);
    window.addEventListener('scroll', calcularPos, true);
    return () => {
      window.removeEventListener('resize', calcularPos);
      window.removeEventListener('scroll', calcularPos, true);
    };
  }, [abierto, calcularPos]);

  // ── Cerrar al hacer clic fuera ──────────────────────────
  useEffect(() => {
    if (!abierto) return;
    const handler = (e) => {
      const portalEl = document.getElementById('dir-buscador-portal');
      if (
        wrapRef.current && !wrapRef.current.contains(e.target) &&
        !(portalEl && portalEl.contains(e.target))
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [abierto]);

  // ── Handlers ────────────────────────────────────────────
  const handleCambioTexto = (e) => {
    const texto = e.target.value;
    setTextoBusq(texto);
    if (onChange) onChange(texto);
    if (!texto && onSeleccionar) onSeleccionar(null);
  };

  const handleSeleccionar = useCallback((afiliado) => {
    const nombre = `${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno || ''}`.trim();
    setTextoBusq(nombre);
    setAbierto(false);
    setResultados([]);
    if (onSeleccionar) onSeleccionar(afiliado);
  }, [onSeleccionar]);

  const handleLimpiar = () => {
    setTextoBusq('');
    setResultados([]);
    setAbierto(false);
    if (onSeleccionar) onSeleccionar(null);
    if (onChange) onChange('');
  };

  // ── Dropdown en portal ──────────────────────────────────
  const dropdown = abierto && createPortal(
    <div
      id="dir-buscador-portal"
      style={{
        position:     'absolute',
        top:          pos.top,
        left:         pos.left,
        width:        pos.width,
        zIndex:       99999,
        background:   '#FFFFFF',
        border:       '1px solid #E2ECFF',
        borderRadius: '8px',
        boxShadow:    '0 6px 20px rgba(0,0,0,0.12)',
        maxHeight:    '220px',
        overflowY:    'auto',
      }}
    >
      {resultados.length === 0 ? (
        <div className="dir-buscador-vacio">Sin resultados</div>
      ) : (
        resultados.map((af) => (
          <div
            key={af.id || af.id_afiliado}
            className="dir-buscador-item"
            onMouseDown={(e) => { e.preventDefault(); handleSeleccionar(af); }}
          >
            <span className="dir-buscador-item-nombre">
              {af.nombre} {af.paterno} {af.materno || ''}
            </span>
            <span className="dir-buscador-item-ci">
              CI: {af.ci} {af.extension || ''}
            </span>
          </div>
        ))
      )}
    </div>,
    document.body
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <TextInput
        ref={inputRef}
        value={textoBusq}
        onChange={handleCambioTexto}
        placeholder={placeholder}
        disabled={disabled}
        size="sm"
        leftSection={
          buscando
            ? <Loader size={14} color="dark" />
            : <IconSearch size={14} />
        }
        rightSection={
          textoBusq ? (
            <ActionIcon variant="subtle" size="sm" onClick={handleLimpiar} aria-label="Limpiar">
              <IconX size={13} />
            </ActionIcon>
          ) : null
        }
        styles={{
          input: {
            fontFamily:      'Poppins, sans-serif',
            fontSize:        '13px',
            backgroundColor: '#F6F9FF',
            border:          '1px solid #E2ECFF',
            borderRadius:    '8px',
          },
        }}
        onFocus={() => {
          if (resultados.length > 0) {
            calcularPos();
            setAbierto(true);
          }
        }}
      />
      {dropdown}
    </div>
  );
};

export default BuscadorAfiliado;