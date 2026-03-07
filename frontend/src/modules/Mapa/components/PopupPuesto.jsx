// src/modules/Mapa/components/PopupPuesto.jsx
import React, { useEffect, useRef } from 'react';
import { IconUser, IconHistory, IconX, IconUserPlus } from '@tabler/icons-react';
import '../Styles/mapa.css';

// ============================================
// COMPONENTE POPUP PUESTO
// ============================================

/**
 * Popup flotante que aparece al hacer click en un puesto del mapa.
 * Muestra acciones según si el puesto tiene afiliado asignado o no.
 * - Con afiliado: botón "Afiliado" (amarillo) + "Historial Puesto" (amarillo)
 * - Sin afiliado: botón "Asignar Afiliado" (rojo) + "Historial Puesto" (amarillo)
 *
 * @param {Object}   puesto            - Datos del puesto seleccionado
 * @param {boolean}  opened            - Si el popup está visible
 * @param {Function} onClose           - Callback para cerrar el popup
 * @param {Function} onVerAfiliado     - Callback para ver el afiliado
 * @param {Function} onVerHistorial    - Callback para ver el historial
 * @param {Function} onAsignarAfiliado - Callback para asignar afiliado
 * @param {number}   zoom              - Zoom actual del mapa
 * @param {Object}   posicion          - Posición actual del mapa {x, y}
 */
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

  // ── Cerrar al click fuera ──
  useEffect(() => {
    /**
     * Cierra el popup si se hace click fuera de él.
     * @param {MouseEvent} e
     */
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

  // ── Calcular posición en pantalla ──
  const puestoCentroX = puesto.x + puesto.width / 2;
  const puestoCentroY = puesto.y;
  const screenX = posicion.x + puestoCentroX * zoom;
  const screenY = posicion.y + puestoCentroY * zoom;

  const popupWidth  = 180;
  const offsetY     = 12;
  const popupHeight = puesto.id_afiliado ? 130 : 155;

  let left = screenX - popupWidth / 2;
  let top  = screenY - offsetY;

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
        position:        'absolute',
        left,
        top,
        width:           popupWidth,
        backgroundColor: '#1a1f2e',
        borderRadius:    '8px',
        border:          '1px solid rgba(237, 190, 60, 0.4)',
        boxShadow:       '0 8px 32px rgba(0,0,0,0.45)',
        zIndex:          100,
        overflow:        'hidden',
        animation:       'popupFadeIn 0.15s ease',
      }}
    >
      {/* ── Header del popup ── */}
      <div className="popup-header">
        <span className="popup-header-titulo">
          P.{puesto.nroPuesto} · {puesto.cuadra === 'Callejón' ? 'FILA A - CALLEJÓN' : `F.${puesto.fila} · ${puesto.cuadra}`}
        </span>
        <button onClick={onClose} className="popup-close-btn">
          <IconX size={13} />
        </button>
      </div>

      {/* ── Botones de acción ── */}
      <div className="popup-body">

        {/* Con afiliado → botón amarillo */}
        {puesto?.id_afiliado && (
          <button
            onClick={onVerAfiliado}
            className="popup-btn popup-btn-amarillo"
          >
            <IconUser size={14} />
            Afiliado
          </button>
        )}

        {/* Sin afiliado → botón ROJO */}
        {!puesto?.id_afiliado && (
          <button
            onClick={onAsignarAfiliado}
            className="popup-btn popup-btn-rojo"
          >
            <IconUserPlus size={14} />
            Asignar Afiliado
          </button>
        )}

        {/* Historial → siempre amarillo */}
        <button
          onClick={onVerHistorial}
          className="popup-btn popup-btn-amarillo"
        >
          <IconHistory size={14} />
          Historial Puesto
        </button>
      </div>
    </div>
  );
};

export default PopupPuesto;