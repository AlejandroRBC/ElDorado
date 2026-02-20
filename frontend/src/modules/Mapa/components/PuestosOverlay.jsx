// src/modules/Mapa/components/PuestosOverlay.jsx
import React from 'react';

const SVG_WIDTH = 1592;
const SVG_HEIGHT = 544;

const PuestosOverlay = ({ puestos, zoom, posicion, onClickPuesto, puestoSeleccionado }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SVG_WIDTH,
          height: SVG_HEIGHT,
          transform: `translate(${posicion.x}px, ${posicion.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          overflow: 'visible',
        }}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      >
        {puestos.map((puesto) => {
          const isSelected = puestoSeleccionado?.nroPuesto === puesto.nroPuesto &&
                             puestoSeleccionado?.fila === puesto.fila;

          return (
            <g key={`${puesto.fila}-${puesto.nroPuesto}`}>
              {/* Rect clickeable transparente sobre el puesto */}
              <rect
                x={puesto.x}
                y={puesto.y}
                width={puesto.width}
                height={puesto.height}
                fill={isSelected ? 'rgba(237, 190, 60, 0.55)' : 'rgba(255,255,255,0)'}
                stroke={isSelected ? '#EDBE3C' : 'transparent'}
                strokeWidth={isSelected ? 0.4 : 0}
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'all',
                  transition: 'fill 0.15s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClickPuesto(puesto);
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.setAttribute('fill', 'rgba(237, 190, 60, 0.3)');
                    e.target.setAttribute('stroke', '#EDBE3C');
                    e.target.setAttribute('stroke-width', '0.3');
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.setAttribute('fill', 'rgba(255,255,255,0)');
                    e.target.setAttribute('stroke', 'transparent');
                    e.target.setAttribute('stroke-width', '0');
                  }
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default PuestosOverlay;
