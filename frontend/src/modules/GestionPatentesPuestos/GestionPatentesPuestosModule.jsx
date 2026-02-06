import { useState, useMemo, useEffect } from "react";
import {Table, Button, Group, Title, Badge, Select, Loader, 
        Text, Paper,Container, ActionIcon, Menu} from "@mantine/core";
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import FormularioPuestoPatente from './components/FormularioPuestoPatente';
import FiltroPuesto from "./components/FiltroPuesto"; 
import { filtrarPuestos, obtenerInfo } from "./servicios/PuestosService";
import DetalleModal from "./components/DetalleModal";
import ModalHistorialPuesto from "./components/ModalHistorialPuesto";
import FormularioTraspaso from "./components/FormularioTraspaso";

const GestionPatentesPuestos = () => {
    const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
    const [showModalDetalles, setShowModalDetalles] = useState(false);
    const [showModalHistorial, setShowModalHistorial] = useState(false);
    const [showModalTraspaso, setShowModalTraspaso] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    
    const [tenencias, setTenencias] = useState([]);
    const [afiliados, setAfiliados] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [patentes, setPatentes] = useState([]);
    
    const [criterios, setCriterios] = useState({ texto: "", patente: "todos" });
    const [loading, setLoading] = useState(true);

    // Fetch de datos
    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const [resPuestos, resAfiliados, resTenencias] = await Promise.all([
                    axios.get('http://localhost:3000/api/puestos/listar'),
                    axios.get('http://localhost:3000/api/afiliados/listar'),
                    axios.get('http://localhost:3000/api/tenencias/listar')
                ]);
                setPuestos(resPuestos.data);
                setAfiliados(resAfiliados.data);
                setTenencias(resTenencias.data);
            } catch (error) {
                notifications.show({ title: 'Error', message: 'No se pudieron cargar los datos', color: 'red' });
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    const puestosFiltrados = useMemo(() => 
        filtrarPuestos(puestos, patentes, tenencias, afiliados, criterios), 
        [puestos, patentes, tenencias, afiliados, criterios]
    );

    // Manejador de acciones
    const ejecutarAccion = (valor, puesto) => {
        setPuestoSeleccionado(puesto);
        if (valor === "detalles") setShowModalDetalles(true);
        if (valor === "historial") setShowModalHistorial(true);
        if (valor === "traspaso") setShowModalTraspaso(true);
    };

    // Filas de la tabla procesadas
    const rows = puestosFiltrados.map((puesto) => {
        const data = obtenerInfo(puesto, tenencias, afiliados, patentes);
        const esVacante = data.nombreCompleto === "PUESTO VACANTE";

        return (
            <Table.Tr key={puesto.id_puesto} style={{ backgroundColor: esVacante ? '#fff5f5' : 'transparent' }}>
                <Table.Td fw={700}>{puesto.id_puesto}</Table.Td>
                <Table.Td>{puesto.fila} - {puesto.cuadra}</Table.Td>
                <Table.Td>
                    <Text size="sm" fw={esVacante ? 700 : 400} c={esVacante ? 'red' : 'dark'}>
                        {data.nombreCompleto}
                    </Text>
                </Table.Td>
                <Table.Td>{data.ci || '---'}</Table.Td>
                <Table.Td>{data.fechaAdquisicion || '---'}</Table.Td>
                <Table.Td>
                    <Group gap={4}>
                        {puesto.rubro?.split(',').map((r, i) => (
                            <Badge key={i} variant="light" size="xs" color="blue">{r.trim()}</Badge>
                        ))}
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Badge color={data.tienePatente ? "green" : "orange"} variant="dot">
                        {data.tienePatente ? "Patentado" : "Pendiente"}
                    </Badge>
                </Table.Td>
                <Table.Td>
                    <Select
                        placeholder="Acciones"
                        size="xs"
                        data={[
                            { value: 'detalles', label: '🔍 Ver Detalles' },
                            { value: 'historial', label: '📜 Ver Historial' },
                            { value: 'traspaso', label: '🔄 Realizar Traspaso' },
                        ]}
                        onChange={(val) => ejecutarAccion(val, puesto)}
                    />
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Container size="xl" py="xl">
            <Paper shadow="sm" p="lg" withBorder>
                <Group justify="space-between" mb="lg">
                    <div>
                        <Title order={2} c="dark">Gestión de Puestos y Patentes</Title>
                        <Text c="dimmed" size="sm">Administración general del mercado ElDorado</Text>
                    </div>
                    <Group>
                        <Button color="blue" onClick={() => setModalOpen(true)}>+ Nuevo Puesto</Button>
                        <Button variant="light" color="teal">Generar Reporte</Button>
                    </Group>
                </Group>

                <FiltroPuesto onFiltrar={setCriterios} />

                <Table.ScrollContainer minWidth={800} mt="xl">
                    <Table verticalSpacing="sm" highlightOnHover withTableBorder>
                        <Table.Thead bg="gray.0">
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Ubicación</Table.Th>
                                <Table.Th>Afiliado</Table.Th>
                                <Table.Th>C.I.</Table.Th>
                                <Table.Th>Adquisición</Table.Th>
                                <Table.Th>Rubros</Table.Th>
                                <Table.Th>Estado</Table.Th>
                                <Table.Th>Acciones</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {loading ? (
                                <Table.Tr>
                                    <Table.Td colSpan={8}>
                                        <Group justify="center" py="xl"><Loader size="md" /> <Text>Cargando datos...</Text></Group>
                                    </Table.Td>
                                </Table.Tr>
                            ) : rows.length > 0 ? rows : (
                                <Table.Tr>
                                    <Table.Td colSpan={8} align="center"><Text c="dimmed">No se encontraron resultados</Text></Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Paper>

            {/* Modales - Se mantienen igual en lógica */}
            <FormularioPuestoPatente isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
            <DetalleModal isOpen={showModalDetalles} onClose={() => setShowModalDetalles(false)} puesto={puestoSeleccionado} datos={{ tenencias, afiliados, patentes }} />
            <ModalHistorialPuesto isOpen={showModalHistorial} onClose={() => setShowModalHistorial(false)} idPuesto={puestoSeleccionado?.id_puesto} tenencias={tenencias} afiliados={afiliados} />
            <FormularioTraspaso isOpen={showModalTraspaso} onClose={() => setShowModalTraspaso(false)} puesto={puestoSeleccionado} afiliados={afiliados} />
        </Container>
    );
};

export default GestionPatentesPuestos;