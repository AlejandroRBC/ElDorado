import { TextInput, Select, Button, Group, Stack, Paper } from "@mantine/core";
import { IconSearch, IconX, IconArrowsExchange, IconFileExport } from "@tabler/icons-react";
import { exportarPuestosExcel } from "../exports/puestosExport";
import { TablaPuestos } from "./TablaPuestos";

export function FiltrosPuestos({
  puestos,
  search, setSearch,
  filtroPatente, setFiltroPatente,
  filtroFila, setFiltroFila,
  filtroCuadra, setFiltroCuadra,
  limpiarFiltros,
  onTraspaso
}) {

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">

        <Group grow>

          <TextInput
            placeholder="Buscar Apoderado o CI..."
            leftSection={<IconSearch size={18} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="sm"
            radius="md"
          />

          <Select
            placeholder="Estado Patente"
            data={[
              { value: 'Todo', label: 'Todo'},
              { value: 'si', label: 'Con Patente' },
              { value: 'no', label: 'Sin Patente' }
            ]}
            value={filtroPatente}
            onChange={setFiltroPatente}
          />

          <Select
            placeholder="Fila"
            data={['Todo','A','B']}
            value={filtroFila}
            onChange={setFiltroFila}
          />

          <Select
            placeholder="Cuadra"
            data={['Todo','1','2','3','4','Callejon']}
            value={filtroCuadra}
            onChange={setFiltroCuadra}
          />

        </Group>

        <Group justify="space-between">

          <Group>

            <Button
              leftSection={<IconArrowsExchange size={18}/>}
              color="dark"
              radius="xl"
              style={{ backgroundColor:'#0f0f0f' }}
              onClick={onTraspaso}
            >
              Realizar Traspaso
            </Button>

            <Button
              leftSection={<IconFileExport size={18}/>}
              radius="xl"
              style={{ backgroundColor:'#EDBE3C', color:'black' }}
              onClick={() => exportarPuestosExcel(puestos)}
            >
              Generar Reporte General
            </Button>

          </Group>

          {(search || filtroPatente || filtroFila || filtroCuadra) && (
            <Button
              variant="subtle"
              size="xs"
              onClick={limpiarFiltros}
              leftSection={<IconX size={14}/>}
            >
              Limpiar Filtros
            </Button>
          )}

        </Group>

      </Stack>
    </Paper>
  );
}
