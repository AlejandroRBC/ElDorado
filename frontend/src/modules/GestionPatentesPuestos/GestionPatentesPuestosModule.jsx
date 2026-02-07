import { useState, useEffect, useMemo } from "react";
import { 
  TextInput, Select, Button, Table, 
  Group, Stack, Title, Badge, ActionIcon, 
  Menu,Paper } from '@mantine/core';
import { 
    IconSearch, IconPlus, IconFileExport, IconDotsVertical, 
    IconEye, IconHistory, IconArrowsExchange } from '@tabler/icons-react';

import { ModalCrearPuesto } from "./components/ModalCrearPuesto";
import { useDisclosure } from "@mantine/hooks";
import { puestosService } from "./service/puestosService";


function GestionPatentesPuestosModule() {
  const [puestos, setPuestos] = useState([]);
  const [search, setSearch] = useState('');
  const [filtroPatente, setFiltroPatente] = useState(null);
  const [opened, {open, close}] = useDisclosure(false);
  const [filtroFila, setFiltroFila] = useState(null);
  const [filtroCuadra, setFiltroCuadra] = useState(null);

  // Función de filtrado
  const puestosFiltrados = useMemo(() => {
    return puestos.filter((puesto) => {

      const coincideBusqueda =
        search === '' ||
        String(puesto.nroPuesto || '').includes(search) ||
        (puesto.apoderado || '').toLowerCase().includes(search.toLowerCase()) ||
        (puesto.ci || '').includes(search);

      let coincidePatente = true;
      if (filtroPatente && filtroPatente !== 'Todo') {
        if (filtroPatente === 'si') {
          coincidePatente = Boolean(puesto.tiene_patente);
        } else {
          coincidePatente = !Boolean(puesto.tiene_patente);
        }
      }

      const coincideFila =
         !filtroFila || filtroFila === 'Todo' || 
         String(puesto.fila || '') === filtroFila;

      const coincideCuadra =
        !filtroCuadra || filtroCuadra === 'Todo' || 
        String(puesto.cuadra || '') === filtroCuadra;

      return coincideBusqueda && coincidePatente && coincideFila && coincideCuadra;
    });
  }, [puestos, search, filtroPatente, filtroFila, filtroCuadra]);


  const handleSavePuesto = async (data) => {
    try {
      await puestosService.crear(data);
      console.log("Guardado OK");
      close();
      cargarPuestos();   
    } catch (e) {
      console.error(e);
    }
  };


  useEffect(() => {
    cargarPuestos();
  }, []);

  const cargarPuestos = async () => {
    try {
      const data = await puestosService.listar();
      setPuestos(data);
    } catch (e) {
      console.error("Error al cargar puestos", e);
    }
  };



  return (
    <Stack gap="md" p="md">
        
      <ModalCrearPuesto 
        opened={opened} 
        close={close} 
        onSave={handleSavePuesto} 
      />
      <Title order={2}>Gestión de Puestos</Title>

      <Paper shadow="xs" p="md" withBorder>
        <Stack gap="md">
          <Group>
            <TextInput 
              placeholder="Buscar por ID, Apoderado o CI..." 
              leftSection={<IconSearch size={16} />} 
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="md"
              style={{flex: 1}}
            />
            <Select 
              placeholder="Todo"
              style={{ width: '120px' }}
              data={[
                { value: 'Todo', label: 'Todo'},
                { value: 'si', label: 'Con Patente' },
                { value: 'no', label: 'Sin Patente' }
              ]}
              value={filtroPatente}
              onChange={setFiltroPatente}
              clearable
            />
            <Select 
              placeholder="Todas las Filas"
              style={{ width: '180px' }}
              data={[
                { value: 'Todo', label: 'Todas las Filas'},
                { value: 'A', label: 'A' },
                { value: 'B', label: 'B' },
                { value: 'C', label: 'C' }
              ]}
              value={filtroFila}
              onChange={setFiltroFila}
              clearable
              styles={{
                input: { paddingLeft: 8, paddingRight: 8 },
                item:{whiteSpace: 'normal'}
              }}
            />
            <Select 
              placeholder="Todas las Cuadras"
              style={{ width: '180px' }}
              data={[
                { value: 'Todo', label: 'Todas las Cuadras'},
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' }
              ]}
              value={filtroCuadra}
              onChange={setFiltroCuadra}
              clearable
              styles={{
                input: { paddingLeft: 8, paddingRight: 8 },
                item:{whiteSpace: 'normal'}
              }}
            />
          </Group>

          <Group > 
            <Button 
                leftSection={<IconPlus size={18} />} 
                onClick={open}
                variant="filled" 
                color="black"
                radius="xl">
              Añadir Puesto
            </Button>
            <Button 
                leftSection={<IconFileExport size={18} />} 
                variant="filled" 
                color="black"
                radius="xl">
              Generar Reporte
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="xs" withBorder>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead> 
            <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
              <Table.Th>ID Puesto</Table.Th>
              <Table.Th>Fila/Cuadra</Table.Th>
              <Table.Th>Apoderado</Table.Th>
              <Table.Th>C.I.</Table.Th>
              <Table.Th>Fecha Adquisición</Table.Th>
              <Table.Th>Rubros</Table.Th>
              <Table.Th>Estado Patente</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {puestosFiltrados.map((puesto) => (
              <Table.Tr key={puesto.id}>
                <Table.Td>{puesto.nroPuesto || puesto.id}</Table.Td>
                <Table.Td>{`${puesto.fila} - ${puesto.cuadra}`}</Table.Td>
                <Table.Td>{puesto.apoderado ? puesto.apoderado : 'Vacante'}</Table.Td>
                <Table.Td>{puesto.ci || '-'}</Table.Td>
                <Table.Td>{puesto.fecha_adquisicion || puesto.fecha || '-'}</Table.Td>
                <Table.Td>{puesto.rubro || puesto.rubros || '-'}</Table.Td>
                <Table.Td>
                  {puesto.tiene_patente || puesto.patente ?(
                    <Badge key="con-patente" color="green">CON PATENTE</Badge>
                  ) : (
                    <Badge key="sin-patente" color="yellow">SIN PATENTE</Badge>
                  )}

                </Table.Td>
                <Table.Td>
                   <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="light" color="blue">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Opciones</Menu.Label>
                      <Menu.Item key = "ver-detalles" leftSection={<IconEye size={14} />}>Ver Detalles</Menu.Item>
                      <Menu.Item key = "ver-historial" leftSection={<IconHistory size={14} />}>Ver Historial</Menu.Item>
                      <Menu.Divider />
                      <Menu.Item key = "traspaso" color="orange" leftSection={<IconArrowsExchange size={14} />}>
                        Traspaso
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
export default GestionPatentesPuestosModule;