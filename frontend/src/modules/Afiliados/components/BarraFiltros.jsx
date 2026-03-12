import { memo } from 'react';
import { Text, TextInput, Select, Group, Box, Button } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

import {
  OPCIONES_PATENTE,
  OPCIONES_ORDEN,
  OPCIONES_PUESTO_COUNT,
} from '../constantes/opcionesFiltros';

// ── Estilos compartidos — fuera del componente ────────────────
const estiloInput = {
  input: {
    backgroundColor: '#f6f8fe',
    border: '1px solid #f6f8fe',
    borderRadius: '8px',
    height: '45px',
  },
};

const estiloInputConPlaceholder = {
  input: {
    backgroundColor: '#f6f8fe',
    border: '1px solid #f6f8fe',
    borderRadius: '8px',
    height: '45px',
    '&::placeholder': { color: '#999', fontSize: '14px' },
  },
};

/**
 * Panel de filtros del módulo de afiliados.
 * Componente puramente presentacional: recibe valores actuales
 * y callbacks; no maneja estado propio ni llama servicios.
 */
const BarraFiltros = memo(({
  valores = {},
  opcionesRubros = [],
  cargando = false,
  alCambiarBusqueda,
  alLimpiarBusqueda,
  alCambiarPatente,
  alCambiarOrden,
  alCambiarPuestoCount,
  alCambiarRubro,
}) => {
  const {
    searchValue      = '',
    selectPatente    = null,
    selectOrden      = 'alfabetico',
    selectPuestoCount = null,
    selectRubro      = null,
  } = valores;

  return (
    <>
      <Group gap="md" wrap="wrap" align="flex-end" mb="xl">

        {/* Buscador */}
        <Box style={{ flex: 2, minWidth: '250px' }}>
          <label htmlFor="filtro-busqueda">
            <Text size="sm" fw={600} mb={4} component="span">Buscar</Text>
          </label>
          <TextInput
            id="filtro-busqueda"
            placeholder="Nombre, CI, rubro, puesto... (búsqueda automática)"
            leftSection={<IconSearch size={18} />}
            size="md"
            value={searchValue}
            onChange={(e) => alCambiarBusqueda(e.target.value)}
            aria-label="Buscar afiliados por nombre, CI, rubro o puesto"
            rightSection={
              searchValue && (
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={alLimpiarBusqueda}
                  aria-label="Limpiar búsqueda"
                  style={{ padding: 0, minWidth: 'auto' }}
                >
                  <IconX size={16} />
                </Button>
              )
            }
            styles={estiloInputConPlaceholder}
          />
        </Box>

        {/* Filtro Patente */}
        <Box style={{ flex: 1, minWidth: '160px' }}>
          <label htmlFor="filtro-patente">
            <Text size="sm" fw={600} mb={4} component="span">Patente</Text>
          </label>
          <Select
            id="filtro-patente"
            placeholder="Filtrar por patente"
            data={OPCIONES_PATENTE}
            value={selectPatente}
            onChange={alCambiarPatente}
            clearable
            size="md"
            aria-label="Filtrar por estado de patente"
            styles={estiloInput}
          />
        </Box>

        {/* Ordenar */}
        <Box style={{ flex: 1, minWidth: '160px' }}>
          <label htmlFor="filtro-orden">
            <Text size="sm" fw={600} mb={4} component="span">Ordenar</Text>
          </label>
          <Select
            id="filtro-orden"
            placeholder="Ordenar por..."
            data={OPCIONES_ORDEN}
            value={selectOrden}
            onChange={alCambiarOrden}
            size="md"
            aria-label="Ordenar afiliados"
            styles={estiloInput}
          />
        </Box>

        {/* Cantidad de Puestos */}
        <Box style={{ flex: 1, minWidth: '160px' }}>
          <label htmlFor="filtro-puesto-count">
            <Text size="sm" fw={600} mb={4} component="span"># Puestos</Text>
          </label>
          <Select
            id="filtro-puesto-count"
            placeholder="Cantidad de puestos"
            data={OPCIONES_PUESTO_COUNT}
            value={selectPuestoCount}
            onChange={alCambiarPuestoCount}
            clearable
            size="md"
            aria-label="Filtrar por cantidad de puestos"
            styles={estiloInput}
          />
        </Box>

        {/* Rubro */}
        <Box style={{ flex: 1, minWidth: '160px' }}>
          <label htmlFor="filtro-rubro">
            <Text size="sm" fw={600} mb={4} component="span">Rubro</Text>
          </label>
          <Select
            id="filtro-rubro"
            placeholder="Filtrar por rubro"
            data={opcionesRubros}
            value={selectRubro}
            onChange={alCambiarRubro}
            clearable
            searchable
            size="md"
            aria-label="Filtrar por rubro"
            styles={estiloInput}
          />
        </Box>

      </Group>

      {searchValue && (
        <Text size="xs" style={{ color: '#666', marginTop: '-10px', marginBottom: '10px' }}>
          Buscando: &ldquo;{searchValue}&rdquo; {cargando ? '(buscando...)' : ''}
        </Text>
      )}
    </>
  );
});

BarraFiltros.displayName = 'BarraFiltros';

export default BarraFiltros;