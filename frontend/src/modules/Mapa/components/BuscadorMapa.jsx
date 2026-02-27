// src/modules/Mapa/components/BuscadorMapa.jsx
import React, { useRef, useEffect } from 'react';
import { IconSearch, IconX, IconMapPin } from '@tabler/icons-react';

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
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onCerrarResultados();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCerrarResultados]);

  const filas = [
    { value: 'todos', label: 'Todas' },
    { value: 'A', label: 'Fila A' },
    { value: 'B', label: 'Fila B' },
    { value: 'Callejon', label: 'Callejón' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        flexWrap: 'wrap',
      }}
    >
      {/* Buscador */}
      <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            border: '1.5px solid #ddd',
            borderRadius: '8px',
            padding: '6px 10px',
            gap: '8px',
            transition: 'border-color 0.2s',
          }}
          onFocus={() => {}}
        >
          <IconSearch size={15} color="#999" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por nombre, CI o N° puesto..."
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: '13px',
              color: '#333',
              backgroundColor: 'transparent',
              fontFamily: 'Arial, sans-serif',
            }}
          />
          {busqueda && (
            <button
              onClick={() => onBuscar('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                color: '#999',
              }}
            >
              <IconX size={13} />
            </button>
          )}
        </div>

        {/* Dropdown resultados */}
        {mostrarResultados && resultados.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1.5px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 200,
              overflow: 'hidden',
              maxHeight: '240px',
              overflowY: 'auto',
            }}
          >
            {resultados.map((puesto, i) => (
              <div
                key={`${puesto.fila}-${puesto.nroPuesto}`}
                onClick={() => onSeleccionar(puesto)}
                style={{
                  padding: '9px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: i < resultados.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background 0.12s',
                  fontSize: '13px',
                  fontFamily: 'Arial, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#EDBE3C',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconMapPin size={14} color="#0f0f0f" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f0f0f', fontSize: '12px' }}>
                    Puesto {puesto.nroPuesto} — {puesto.cuadra === 'Callejón' ? 'Fila A - Callejón' : `Fila ${puesto.fila}`}
                  </div>
                  {puesto.afiliado ? (
                    <div style={{ color: '#666', fontSize: '11px' }}>
                      {puesto.afiliado.nombre} · CI: {puesto.afiliado.ci}
                    </div>
                  ) : (
                    <div style={{ color: '#aaa', fontSize: '11px', fontStyle: 'italic' }}>
                      Sin afiliado asignado
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {mostrarResultados && resultados.length === 0 && busqueda.trim() && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1.5px solid #ddd',
              borderRadius: '8px',
              padding: '14px',
              textAlign: 'center',
              color: '#999',
              fontSize: '13px',
              zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            Sin resultados para "{busqueda}"
          </div>
        )}
      </div>

      {/* Filtro fila */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        {filas.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFiltroChange(value)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: filtroFila === value ? '1.5px solid #EDBE3C' : '1.5px solid #ddd',
              backgroundColor: filtroFila === value ? '#EDBE3C' : 'white',
              color: filtroFila === value ? '#0f0f0f' : '#666',
              fontWeight: filtroFila === value ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leyenda de colores - placeholder futuro */}
      <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>
        {[
          { color: '#4caf50', label: 'Con afiliado y patente' },
          { color: '#EDBE3C', label: 'Sin patente' },
          { color: '#f44336', label: 'Sin afiliado' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: color,
              borderRadius: '2px',
              opacity: 0.6,
            }} />
            <span style={{ fontSize: '11px', color: '#888', fontFamily: 'Arial, sans-serif' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuscadorMapa;
