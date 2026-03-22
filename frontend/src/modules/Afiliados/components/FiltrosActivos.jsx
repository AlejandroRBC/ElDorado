// frontend/src/modules/Afiliados/components/FiltrosActivos.jsx

// ============================================================
// FILTROS ACTIVOS — estilo unificado con GestionPatentesPuestos
// ============================================================

import { IconX } from '@tabler/icons-react';
import '../styles/afiliados-gp.css';

// ============================================================
// ETIQUETAS LEGIBLES POR FILTRO
// ============================================================
/**
 * Devuelve el texto a mostrar en el badge según el tipo de
 * filtro y su valor actual.
 */
const obtenerEtiqueta = (tipo, valor) => {
  switch (tipo) {
    case 'search':
      return `Búsqueda: ${valor}`;
    case 'conPatente':
      return valor === 'true' ? 'Con patente' : 'Sin patente';
    case 'puestoCount':
      return valor === '5'
        ? '5+ puestos'
        : `${valor} puesto${valor !== '1' ? 's' : ''}`;
    case 'rubro':
      return `Rubro: ${valor}`;
    case 'orden':
      return `Orden: ${valor === 'registro' ? 'Fecha registro' : valor}`;
    default:
      return valor;
  }
};

// ============================================================
// COMPONENTE FiltrosActivos
// ============================================================
/**
 * Muestra las etiquetas de filtros activos con botón para
 * eliminar cada uno individualmente.
 * Componente puramente presentacional: no maneja estado.
 */
const FiltrosActivos = ({ filtrosActivos = {}, alLimpiarFiltro }) => {

  const filtrosVisibles = [
    filtrosActivos.search      && { tipo: 'search',      valor: filtrosActivos.search },
    filtrosActivos.conPatente  !== null && filtrosActivos.conPatente  !== undefined
                               && { tipo: 'conPatente',  valor: filtrosActivos.conPatente },
    filtrosActivos.puestoCount && { tipo: 'puestoCount', valor: String(filtrosActivos.puestoCount) },
    filtrosActivos.rubro       && { tipo: 'rubro',       valor: filtrosActivos.rubro },
    filtrosActivos.orden && filtrosActivos.orden !== 'alfabetico'
                               && { tipo: 'orden',       valor: filtrosActivos.orden },
  ].filter(Boolean);

  if (filtrosVisibles.length === 0) return null;

  return (
    <div
      className="af-filtros-activos"
      role="status"
      aria-label="Filtros activos"
    >
      <span className="af-filtros-activos-label">Filtros:</span>

      {filtrosVisibles.map(({ tipo, valor }) => (
        <span key={tipo} className="af-filtro-badge">
          {obtenerEtiqueta(tipo, valor)}
          <button
            className="af-filtro-badge-x"
            aria-label={`Quitar filtro: ${obtenerEtiqueta(tipo, valor)}`}
            onClick={() => alLimpiarFiltro(tipo)}
          >
            <IconX size={11} />
          </button>
        </span>
      ))}
    </div>
  );
};

export default FiltrosActivos;