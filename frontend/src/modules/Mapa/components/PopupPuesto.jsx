// src/modules/Mapa/components/PopupPuesto.jsx
import React, { useEffect, useRef } from 'react';
import { IconUser, IconHistory, IconX, IconUserPlus } from '@tabler/icons-react';

const PopupPuesto = ({
  puesto,
  opened,
  onClose,
  onVerAfiliado,
  onVerHistorial,
  onAsignarAfiliado,
  zoom,
  posicion,
}) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (opened) {
      setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [opened, onClose]);

  if (!opened || !puesto) return null;

  const puestoCentroX = puesto.x + puesto.width / 2;
  const puestoCentroY = puesto.y;
  const screenX = posicion.x + puestoCentroX * zoom;
  const screenY = posicion.y + puestoCentroY * zoom;

  const popupWidth = 180;
  const offsetY = 12;
  let left = screenX - popupWidth / 2;
  let top = screenY - offsetY;

  // Calcular altura dinámica según botones
  const popupHeight = puesto.id_afiliado ? 130 : 155;

  if (top - popupHeight < 10) {
    top = screenY + puesto.height * zoom + offsetY;
  } else {
    top = screenY - popupHeight - offsetY;
  }

  left = Math.max(8, left);

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        left,
        top,
        width: popupWidth,
        backgroundColor: '#1a1f2e',
        borderRadius: '8px',
        border: '1px solid rgba(237, 190, 60, 0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        zIndex: 100,
        overflow: 'hidden',
        animation: 'popupFadeIn 0.15s ease',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #EDBE3C, #d4a82e)',
        padding: '6px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontWeight: 700,
          fontSize: '11px',
          color: '#0f0f0f',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.5px',
        }}>
          P.{puesto.nroPuesto} · {puesto.cuadra === 'Callejón' ? 'FILA A - CALLEJÓN' : `F.${puesto.fila} · ${puesto.cuadra}`}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            color: '#0f0f0f',
            opacity: 0.7,
          }}
        >
          <IconX size={13} />
        </button>
      </div>

      {/* Botones */}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>

        {/* Botón Afiliado - solo si tiene */}
        {puesto?.id_afiliado && (
          <button
            onClick={onVerAfiliado}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(237, 190, 60, 0.1)',
              border: '1px solid rgba(237, 190, 60, 0.25)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#EDBE3C',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Arial, sans-serif',
              transition: 'all 0.15s ease',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(237, 190, 60, 0.22)';
              e.currentTarget.style.borderColor = 'rgba(237, 190, 60, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(237, 190, 60, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(237, 190, 60, 0.25)';
            }}
          >
            <IconUser size={14} />
            Afiliado
          </button>
        )}

        {/* Botón Asignar Afiliado - solo si NO tiene */}
        {!puesto?.id_afiliado && (
          <button
            onClick={onAsignarAfiliado}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.25)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#4caf50',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Arial, sans-serif',
              transition: 'all 0.15s ease',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.22)';
              e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.25)';
            }}
          >
            <IconUserPlus size={14} />
            Asignar Afiliado
          </button>
        )}

        {/* Botón Historial - siempre visible */}
        <button
          onClick={onVerHistorial}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(237, 190, 60, 0.1)',
            border: '1px solid rgba(237, 190, 60, 0.25)',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#EDBE3C',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Arial, sans-serif',
            transition: 'all 0.15s ease',
            width: '100%',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(237, 190, 60, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(237, 190, 60, 0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(237, 190, 60, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(237, 190, 60, 0.25)';
          }}
        >
          <IconHistory size={14} />
          Historial Puesto
        </button>
      </div>
    </div>
  );
};

export default PopupPuesto;
