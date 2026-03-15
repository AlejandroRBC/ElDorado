// src/modules/Mapa/components/PopupPuesto.jsx

// ============================================
// COMPONENTE POPUP PUESTO
// ============================================

import React, { useEffect, useRef }                    from 'react';
import { IconUser, IconHistory, IconX, IconUserPlus }  from '@tabler/icons-react';
import { useLogin }                                     from '../../../context/LoginContext';
import '../Styles/mapa.css';

/**
 * Popup flotante que aparece al hacer click en un puesto del mapa.
 * Muestra acciones según si el puesto tiene afiliado asignado o no.
 *
 * Con afiliado:    botón "Afiliado" (amarillo) + "Historial Puesto" (amarillo)
 * Sin afiliado:    botón "Asignar Afiliado" (rojo) solo si es SUPERADMIN
 *                  + "Historial Puesto" (amarillo) siempre
 *
 * puesto            - Datos del puesto seleccionado
 * opened            - Si el popup está visible
 * onClose           - Callback para cerrar el popup
 * onVerAfiliado     - Callback para ver el afiliado
 * onVerHistorial    - Callback para ver el historial
 * onAsignarAfiliado - Callback para asignar afiliado
 * zoom              - Zoom actual del mapa
 * posicion          - Posición actual del mapa {x, y}
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
  const { user } = useLogin();

  const esSuperAdmin = user?.rol === 'superadmin';

  // ── Cerrar al click fuera ──
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

  // ── Calcular posición en pantalla ──
  const puestoCentroX = puesto.x + puesto.width / 2;
  const puestoCentroY = puesto.y;
  const screenX       = posicion.x + puestoCentroX * zoom;
  const screenY       = posicion.y + puestoCentroY * zoom;

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
      {/* ── Header ── */}
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

        {/* Ver afiliado — solo si el puesto tiene afiliado */}
        {puesto?.id_afiliado && (
          <button onClick={onVerAfiliado} className="popup-btn popup-btn-amarillo">
            <IconUser size={14} />
            Afiliado
          </button>
        )}

        {/* Asignar afiliado — solo si NO tiene afiliado Y es SUPERADMIN */}
        {!puesto?.id_afiliado && esSuperAdmin && (
          <button onClick={onAsignarAfiliado} className="popup-btn popup-btn-rojo">
            <IconUserPlus size={14} />
            Asignar Afiliado
          </button>
        )}

        {/* Historial — siempre visible */}
        <button onClick={onVerHistorial} className="popup-btn popup-btn-amarillo">
          <IconHistory size={14} />
          Historial Puesto
        </button>

      </div>
    </div>
  );
};

export default PopupPuesto;