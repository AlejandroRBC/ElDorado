// frontend/src/modules/Afiliados/components/ui/AfiliadoStats.jsx
//
// PATCH RESPONSIVE
// Cambios:
//   1. useMediaQuery para isMobile
//   2. Paginación centrada en móvil
//   3. Contador texto reducido en móvil
//   4. Pagination size="sm" en móvil

import { Group, Pagination, Text, Stack } from '@mantine/core';
import { useMediaQuery } from 'react-responsive';

/**
 * Muestra el contador de resultados y la paginación.
 * Responsive: en móvil se centra y reduce tamaño.
 */
const AfiliadoStats = ({
  total,
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  hayFiltros,
  itemsPorPagina,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });

  const primerItem = total === 0 ? 0 : (paginaActual - 1) * itemsPorPagina + 1;
  const ultimoItem = Math.min(paginaActual * itemsPorPagina, total);

  const textoContador = total === 0
    ? 'Sin resultados'
    : total <= itemsPorPagina
      ? `${total} afiliado${total !== 1 ? 's' : ''}`
      : `Mostrando ${primerItem}–${ultimoItem} de ${total} afiliados`;

  return (
    <Stack align="center" mb="md" gap="xs">
      {totalPaginas > 1 && (
        <Pagination
          total={totalPaginas}
          value={paginaActual}
          onChange={onCambiarPagina}
          color="dark"
          radius="xl"
          size={isMobile ? 'xs' : 'sm'}
          withEdges={!isMobile}
        />
      )}
      <Text className="af-contador" size={isMobile ? 'xs' : 'sm'}>
        {textoContador}
        {hayFiltros && total > 0 ? ' (filtrado)' : ''}
      </Text>
    </Stack>
  );
};

export default AfiliadoStats;