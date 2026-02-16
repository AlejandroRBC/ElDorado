import { Table, Text, Badge, ActionIcon, Menu, Box, Stack, Loader } from "@mantine/core";
import { IconDotsVertical, IconEye, IconArrowsExchange, IconHistory, IconEdit } from "@tabler/icons-react";


export function TablaPuestos({
  puestos,
  loading,
  onVerHistorial,
  onEditar,
  onTraspaso
}) {

  if (loading) {
    return (
      <Stack align="center" p="xl">
        <Loader color="yellow"/>
        <Text size="sm">Actualizando datos...</Text>
      </Stack>
    );
  }

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table verticalSpacing="md" horizontalSpacing="sm" variant="unstyled">
        <Table.Thead>
            <Table.Tr>
                {[
                "N° Puesto",
                "Fila/Cuadra",
                "Estado",
                "Ancho/largo",
                "Apoderado",
                "CI",
                "Fecha de Adquicision",
                "Rubro",
                "Acciones"
                ].map((titulo, i, arr) => (
                <Table.Th
                    key={titulo}
                    style={{
                    backgroundColor: "#F6F9FF",
                    textAlign: "center",
                    fontWeight: 700,
                    padding: "6px 10px",
                    borderRight: i !== arr.length - 1 ? "4px solid white" : "none"
                    }}
                >
                    {titulo}
                </Table.Th>
                ))}
            </Table.Tr>
        </Table.Thead>


        <Table.Tbody>

          {puestos.map((puesto) => (

            <Table.Tr key={puesto.id_puesto} style={{ textAlign:'center' }}>

                <Table.Td fw={700}>{puesto.nroPuesto}</Table.Td>
                <Table.Td>{puesto.fila} - {puesto.cuadra}</Table.Td>
                <Table.Td>
                    <Badge color={puesto.tiene_patente ? "green" : "yellow"} variant="dot">
                    {puesto.tiene_patente ? "CON PATENTE" : "SIN PATENTE"}
                    </Badge>
                </Table.Td>
                <Table.Td>{puesto.ancho}m - {puesto.largo}m</Table.Td>
                <Table.Td>{puesto.apoderado || "VACANTE"}</Table.Td>
                <Table.Td>{puesto.ci || "-"}</Table.Td>
                <Table.Td>{puesto.fecha_adquisicion || "-"}</Table.Td>
                <Table.Td>{puesto.rubro || "-"}</Table.Td>

              <Table.Td>

                <Menu shadow="md" width={200} position="left-start">

                  <Menu.Target>
                    <ActionIcon 
                        variant="filled"
                        color="yellow"
                        radius="xl"
                    >
                    <IconDotsVertical size={18}/>
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>

                    <Menu.Item
                      leftSection={<IconEye size={14}/>}
                      onClick={() => onVerHistorial(puesto)}
                    >
                      Ver Historial
                    </Menu.Item>

                    <Menu.Item
                      leftSection={<IconArrowsExchange size={14}/>}
                      
                        onClick={() => {
                            console.log("PUESTO TRASPASO:", puesto);
                            onTraspaso(puesto)
                        }}
                    >
                      Hacer Traspaso
                    </Menu.Item>

                    <Menu.Item
                      leftSection={<IconEdit size={14}/>}
                      onClick={() => onEditar(puesto)}
                    >
                      Editar
                    </Menu.Item>

                  </Menu.Dropdown>

                </Menu>

              </Table.Td>

            </Table.Tr>

          ))}

        </Table.Tbody>
      </Table>
    </Box>
  );
}
