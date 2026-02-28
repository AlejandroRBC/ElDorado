// src/modules/Mapa/components/PuestosOverlay.jsx
import React from 'react';

const SVG_WIDTH = 1592;
const SVG_HEIGHT = 544;

const COLORES = {
  con_patente: { fill: 'rgba(76, 175, 80, 0.45)',  stroke: '#4caf50' },
  sin_patente: { fill: 'rgba(237, 190, 60, 0.45)', stroke: '#EDBE3C' },
  libre:       { fill: 'rgba(244, 67, 54, 0.45)',  stroke: '#f44336' },
  hover:       { fill: 'rgba(237, 190, 60, 0.35)', stroke: '#EDBE3C' },
  selected:    { fill: 'rgba(237, 190, 60, 0.6)',  stroke: '#EDBE3C' },
};

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
          // Renderizar PASO
          if (puesto.esPaso) {
            return (
              <g key={puesto.id}>
                <rect
                  x={puesto.x}
                  y={puesto.y}
                  width={puesto.width}
                  height={puesto.height}
                  fill="rgba(150, 150, 150, 0.35)"
                  stroke="#999"
                  strokeWidth={0.3}
                  style={{ pointerEvents: 'none' }}
                />
                <text
                x={puesto.x + 3}
                y={puesto.y - 1.5}
                textAnchor="middle"
                fontSize="2"
                fill="black"
                fontFamily="Arial"
                transform={`rotate(-90, ${puesto.x + puesto.width / 2}, ${puesto.y - 2})`}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                ----- PASO
              </text>
              </g>
            );
          }

          // Renderizar puesto normal
          const isSelected = puestoSeleccionado?.id === puesto.id;
          const estado = puesto.estado || 'libre';
          const color = isSelected ? COLORES.selected : COLORES[estado] || COLORES.libre;

          return (
            <rect
              key={puesto.id}
              x={puesto.x}
              y={puesto.y}
              width={puesto.width}
              height={puesto.height}
              fill={color.fill}
              stroke={color.stroke}
              strokeWidth={0.3}
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
                  e.target.setAttribute('fill', COLORES.hover.fill);
                  e.target.setAttribute('stroke', COLORES.hover.stroke);
                  e.target.setAttribute('stroke-width', '0.4');
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.setAttribute('fill', color.fill);
                  e.target.setAttribute('stroke', color.stroke);
                  e.target.setAttribute('stroke-width', '0.3');
                }
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default PuestosOverlay;
