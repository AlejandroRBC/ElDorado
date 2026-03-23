import { memo }                    from 'react';
import { Stack, Pagination, Text } from '@mantine/core';

/**
 * Muestra el contador de resultados y el control de paginación.
 *
 * total            - Total de afiliados en la lista filtrada
 * paginaActual     - Página actualmente visible
 * totalPaginas     - Número total de páginas
 * onCambiarPagina  - Callback (pagina: number)
 * hayFiltros       - true si hay filtros activos (cambia el texto del contador)
 * itemsPorPagina   - Para calcular rango mostrado (default 50)
 */
const AfiliadoStats = memo(({
  total,
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  hayFiltros      = false,
  itemsPorPagina  = 50,
}) => {
  if (!total) return null;

  const primerItem = (paginaActual - 1) * itemsPorPagina + 1;
  const ultimoItem = Math.min(paginaActual * itemsPorPagina, total);
  const sufijo     = hayFiltros ? ' (filtrados)' : '';
  const plural     = total !== 1 ? 's' : '';

  const textoContador = total <= itemsPorPagina
    ? `${total} afiliado${plural}${sufijo}`
    : `Mostrando ${primerItem}–${ultimoItem} de ${total} afiliado${plural}${sufijo}`;

  return (
    <Stack align="center" mt="xl" gap="xs">
      {totalPaginas > 1 && (
        <Pagination
          total={totalPaginas}
          value={paginaActual}
          onChange={onCambiarPagina}
          color="dark"
          radius="xl"
          size="sm"
        />
      )}
      <Text className="af-contador" size="sm" style={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
        {textoContador}
      </Text>
    </Stack>
  );
});

AfiliadoStats.displayName = 'AfiliadoStats';
export default AfiliadoStats;