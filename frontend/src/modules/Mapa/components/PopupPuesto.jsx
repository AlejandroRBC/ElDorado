// src/modules/Mapa/components/PopupPuesto.jsx
import React, { useEffect, useRef } from 'react';
import { IconUser, IconHistory, IconX } from '@tabler/icons-react';

const PopupPuesto = ({
  puesto,
  opened,
  onClose,
  onVerAfiliado,
  onVerHistorial,
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

  // Calcular posición del popup en pantalla a partir de coords SVG
  const puestoCentroX = puesto.x + puesto.width / 2;
  const puestoCentroY = puesto.y;

  const screenX = posicion.x + puestoCentroX * zoom;
  const screenY = posicion.y + puestoCentroY * zoom;

  // Ajustar para que no se salga de pantalla
  const popupWidth = 180;
  const popupHeight = 110;
  const offsetY = 12;

  let left = screenX - popupWidth / 2;
  let top = screenY - popupHeight - offsetY;

  // Si el popup se va arriba de la pantalla, mostrarlo abajo del puesto
  if (top < 10) {
    top = screenY + puesto.height * zoom + offsetY;
  }

  // Clamp horizontal
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
        <button
          onClick={onVerAfiliado}
          disabled={!puesto?.id_afiliado}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: puesto?.id_afiliado
              ? 'rgba(237, 190, 60, 0.1)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${puesto?.id_afiliado
              ? 'rgba(237, 190, 60, 0.25)'
              : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '6px',
            cursor: puesto?.id_afiliado ? 'pointer' : 'not-allowed',
            color: puesto?.id_afiliado ? '#EDBE3C' : '#555',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Arial, sans-serif',
            transition: 'all 0.15s ease',
            width: '100%',
            opacity: puesto?.id_afiliado ? 1 : 0.5,
          }}
          onMouseEnter={e => {
            if (!puesto?.id_afiliado) return;
            e.currentTarget.style.backgroundColor = 'rgba(237, 190, 60, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(237, 190, 60, 0.5)';
          }}
          onMouseLeave={e => {
            if (!puesto?.id_afiliado) return;
            e.currentTarget.style.backgroundColor = 'rgba(237, 190, 60, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(237, 190, 60, 0.25)';
          }}
        >
          <IconUser size={14} />
          {puesto?.id_afiliado ? 'Afiliado' : 'Sin afiliado'}
        </button>

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
