import { Text, Badge, Group } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
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
 * Muestra los badges de filtros activos con botón para
 * eliminar cada uno individualmente.
 * Componente puramente presentacional: no maneja estado,
 * no llama servicios.
 */
const FiltrosActivos = ({ filtrosActivos = {}, alLimpiarFiltro }) => {

  const filtrosVisibles = [
    filtrosActivos.search      && { tipo: 'search',      valor: filtrosActivos.search },
    filtrosActivos.conPatente  !== null && filtrosActivos.conPatente  !== undefined
                               && { tipo: 'conPatente',  valor: filtrosActivos.conPatente },
    filtrosActivos.puestoCount && { tipo: 'puestoCount', valor: filtrosActivos.puestoCount },
    filtrosActivos.rubro       && { tipo: 'rubro',       valor: filtrosActivos.rubro },
    filtrosActivos.orden && filtrosActivos.orden !== 'alfabetico'
                               && { tipo: 'orden',       valor: filtrosActivos.orden },
  ].filter(Boolean);

  if (filtrosVisibles.length === 0) return null;

  return (
    <Group mb="lg" gap="xs" align="center" role="status" aria-label="Filtros activos">
      <Text size="sm" fw={600} style={{ color: '#666' }}>
        Filtros activos:
      </Text>
      {filtrosVisibles.map(({ tipo, valor }) => (
        <Badge
          key={tipo}
          size="sm"
          variant="outline"
          rightSection={
            <IconX
              size={12}
              style={{ cursor: 'pointer' }}
              aria-label={`Quitar filtro: ${obtenerEtiqueta(tipo, valor)}`}
              role="button"
              tabIndex={0}
              onClick={() => alLimpiarFiltro(tipo)}
              onKeyDown={(e) => e.key === 'Enter' && alLimpiarFiltro(tipo)}
            />
          }
        >
          {obtenerEtiqueta(tipo, valor)}
        </Badge>
      ))}
    </Group>
  );
};

export default FiltrosActivos;