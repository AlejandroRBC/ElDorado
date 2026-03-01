// frontend/src/modules/GestionPatentesPuestos/components/ModalTraspaso.jsx
import { useState, useEffect } from "react";
import { 
  Modal, TextInput, Button, Group, Stack, Text, 
  Paper, Loader, Box, Image, Divider, Badge, Radio
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { afiliadosService } from "../service/afiliadosService";
import { puestosService } from "../service/puestosService";
import { getPerfilUrl } from '../../../utils/imageHelper';

export function ModalTraspaso({ opened, close, puestoSeleccionado, onTraspaso }) {
  const [loadingData, setLoadingData] = useState(false);
  const [searchTermA, setSearchTermA] = useState('');

  //estados para la busqueda del afliliado
  const [resultadosDesde, setResultadosDesde] = useState([]); 
  const [resultadosA, setResultadosA] = useState([]);
  

  // Datos del Emisor (Desde)
  const [afiliadoDesde, setAfiliadoDesde] = useState(null);
  const [puestosDelAfiliado, setPuestosDelAfiliado] = useState([]);
  
  // Cambiamos de array a un solo ID (radio button)
  const [puestoSeleccionadoId, setPuestoSeleccionadoId] = useState(null);

  // Datos del Receptor (A)
  const [afiliadoA, setAfiliadoA] = useState(null);
  const [buscandoA, setBuscandoA] = useState(false);


  const [searchTermDesde, setSearchTermDesde] = useState('');


  const [desdeDebounced] = useDebouncedValue(searchTermDesde, 400);
  const [aDebounced] = useDebouncedValue(searchTermA, 400);

  const avatarPlaceholder = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // 1. CARGAR DATOS AL ABRIR
  useEffect(() => {
    if (!opened) return;

    if (puestoSeleccionado) {
      cargarDatosIniciales();
    } else {
      resetModal();
    }

  }, [opened, puestoSeleccionado]);




  useEffect(() => {
    if (desdeDebounced.length < 2) return;

    afiliadosService.buscarTiempoReal(desdeDebounced)
      .then(setResultadosDesde)
      .catch(() => setResultadosDesde([]));
  }, [desdeDebounced]);


  useEffect(() => {
    if (aDebounced.length < 2) return;

    afiliadosService.buscarTiempoReal(aDebounced)
      .then(setResultadosA)
      .catch(() => setResultadosA([]));
  }, [aDebounced]);

  


  // Función para buscar al emisor manualmente (si no se seleccionó puesto en la tabla)
  const buscarAfiliadoEmisor = async () => {
    if (!searchTermDesde) return;
    try {
      setLoadingData(true);
      // Buscamos al afiliado emisor por CI
      const afiliado = await afiliadosService.buscarPorCI(searchTermDesde);
      setAfiliadoDesde(afiliado);
      
      // Cargamos sus puestos usando su ID
      const puestos = await afiliadosService.obtenerPuestos(afiliado.id_afiliado);
      setPuestosDelAfiliado(puestos || []);
      
      // Por defecto, seleccionar el primer puesto si no hay ninguno seleccionado
      if (puestos && puestos.length > 0 && !puestoSeleccionadoId) {
        setPuestoSeleccionadoId(puestos[0].id_puesto);
      }
    } catch (error) {
      console.error("No se encontró el emisor");
      setAfiliadoDesde(null);
    } finally {
      setLoadingData(false);
    }
  };
  
  const cargarDatosIniciales = async () => {
    setLoadingData(true);

    try {
      const res = await puestosService.obtenerInfoTraspaso(
        puestoSeleccionado.id_puesto
      );

      setAfiliadoDesde(res.afiliadoActual || null);
      setPuestosDelAfiliado(res.puestosDelAfiliado || []);
      
      // Seleccionar automáticamente el puesto que se clickeó en la tabla
      if (puestoSeleccionado?.id_puesto) {
        setPuestoSeleccionadoId(puestoSeleccionado.id_puesto);
      } else if (res.puestosDelAfiliado && res.puestosDelAfiliado.length > 0) {
        // Si no hay puesto específico, seleccionar el primero
        setPuestoSeleccionadoId(res.puestosDelAfiliado[0].id_puesto);
      }

    } catch (err) {
      console.error("Error cargando traspaso:", err);
      setAfiliadoDesde(null);
      setPuestosDelAfiliado([]);
    }

    setLoadingData(false);
  };


  // 2. BUSCAR NUEVO DUEÑO (POR CI)
  const buscarNuevoAfiliado = async () => {
    if (!searchTermA) return;
    try {
      setBuscandoA(true);
      const data = await afiliadosService.buscarPorCI(searchTermA);
      setAfiliadoA(data); // El backend debe retornar el objeto del afiliado
    } catch (error) {
      console.error("No se encontró el afiliado");
      setAfiliadoA(null);
      notifications.show({
        title: 'Error',
        message: 'No se encontró el afiliado',
        color: 'red'
      });
    } finally {
      setBuscandoA(false);
    }
  };

  // Función para seleccionar un puesto (radio button)
  const seleccionarPuesto = (id_puesto) => {
    setPuestoSeleccionadoId(id_puesto);
  };

  const handleEjecutar = () => {
    if (!afiliadoA) {
      notifications.show({
        title: 'Error',
        message: 'Debe seleccionar un destinatario',
        color: 'red'
      });
      return;
    }
    
    if (!puestoSeleccionadoId) {
      notifications.show({
        title: 'Error',
        message: 'Seleccione un puesto para traspasar',
        color: 'red'
      });
      return;
    }

    onTraspaso({
      desde: afiliadoDesde.id_afiliado,
      para: afiliadoA.id_afiliado,
      puestos: [puestoSeleccionadoId], // Enviar como array para mantener compatibilidad
      motivoDetallado: "TRASPASO"
    });
  };

  const resetModal = () => {
    setSearchTermDesde('');
    setSearchTermA('');

    setResultadosDesde([]);
    setResultadosA([]);

    setAfiliadoDesde(null);
    setAfiliadoA(null);

    setPuestosDelAfiliado([]);
    setPuestoSeleccionadoId(null);
  };


  return (
    <Modal 
      opened={opened} 
      onClose={() => {
        resetModal();
        close();
      }}
      size="90%" 
      centered withCloseButton={false} 
      padding={0} 
      radius="lg">
      <Box style={{ display: 'flex', minHeight: '520px', position: 'relative' }}>
        {loadingData && (
            <Box style={{position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Loader color="yellow" />
            </Box>
        )}

        {/* IZQUIERDA: FORMULARIO */}
        <Box style={{ flex: 1.6, padding: '40px', backgroundColor: '#fdfdfd' }}>
          <Stack gap="xl">
            <Text fw={900} size="xl" style={{ letterSpacing: '2px' }}>REALIZAR TRASPASO</Text>

            <Group justify="center" gap={40} mt="xl">
              {/* DESDE (AUTOMÁTICO) */}
              <Stack align="center" gap="xs" style={{ width: '180px' }}>
                <Text fw={800} size="xs" c="gray.6">EMISOR (DESDE):</Text>
                <Paper shadow="xl" radius="md" style={{ width: 160, height: 200, overflow: 'hidden', border: '2px solid #eee' }}>
                  <Image src={getPerfilUrl(afiliadoDesde) || avatarPlaceholder} height={200} fit="cover" />
                  
                </Paper>
                
                {!puestoSeleccionado ? (
                  <>
                    <TextInput
                      placeholder="Nombre o CI"
                      variant="filled"
                      size="xs"
                      value={searchTermDesde}
                      onChange={(e) => setSearchTermDesde(e.currentTarget.value)}
                      styles={{ input: { textAlign: 'center' } }}
                    />

                    {resultadosDesde.length > 0 && (
                      <Paper shadow="md" mt={4}>
                        {resultadosDesde.map(a => (
                          <Box
                            key={a.id_afiliado}
                            p="xs"
                            style={{ cursor: 'pointer' }}
                            onClick={async () => {
                              setAfiliadoDesde(a);
                              setResultadosDesde([]);
                              setSearchTermDesde(`${a.ci} — ${a.nombre}`);

                              const puestos = await afiliadosService.obtenerPuestos(a.id_afiliado);
                              setPuestosDelAfiliado(puestos || []);
                              
                              // Seleccionar el primer puesto automáticamente
                              if (puestos && puestos.length > 0) {
                                setPuestoSeleccionadoId(puestos[0].id_puesto);
                              }
                            }}
                          >
                            <Text size="sm">
                              {a.ci} — {a.nombre} {a.paterno}
                            </Text>
                          </Box>
                        ))}
                      </Paper>
                    )}
                    {afiliadoDesde && !puestoSeleccionado && (
                      <Text fw={700} size="xs" ta="center">
                        {afiliadoDesde.nombre} {afiliadoDesde.paterno} {afiliadoDesde.materno}
                      </Text>
                    )}
                  </>
                ) : (
                  // CASO AUTOMÁTICO: Solo lectura
                  <Stack gap={2} align="center">
                    <Text fw={700} size="sm" ta="center">
                      {afiliadoDesde ? `${afiliadoDesde.nombre} ${afiliadoDesde.paterno}` : <Loader size="xs" />}
                    </Text>
                    <Badge color="gray" variant="light" size="xs">CI: {afiliadoDesde?.ci}</Badge>
                  </Stack>
                )}
              </Stack>

              <Text size="xl" fw={300} c="gray.4">————</Text>

              {/* A (BÚSQUEDA) */}
              <Stack align="center" gap="xs" style={{ width: '180px' }}>
                <Text fw={800} size="xs" c="gray.6">RECEPTOR (NUEVO):</Text>
                <Paper shadow="xl" radius="md" style={{ width: 160, height: 200, overflow: 'hidden', border: '2px solid #eee' }}>
                   <Image src={getPerfilUrl(afiliadoA)  || avatarPlaceholder} height={200} fit="cover" />
                </Paper>
                <TextInput
                  placeholder="Nombre o CI del nuevo dueño"
                  variant="filled"
                  size="xs"
                  value={searchTermA}
                  onChange={(e) => setSearchTermA(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarNuevoAfiliado()}
                  rightSection={
                    buscandoA
                      ? <Loader size={10}/>
                      : <IconSearch size={14} onClick={buscarNuevoAfiliado} style={{cursor:'pointer'}}/>
                  }
                />

                {resultadosA.length > 0 && (
                  <Paper shadow="md" mt={4}>
                    {resultadosA.map(a => (
                      <Box
                        key={a.id_afiliado}
                        p="xs"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setAfiliadoA(a);
                          setResultadosA([]);
                          setSearchTermA(`${a.ci} — ${a.nombre}`);
                        }}
                      >
                        <Text size="sm">
                          {a.ci} — {a.nombre} {a.paterno}
                        </Text>
                      </Box>
                    ))}
                  </Paper>
                )}
                {afiliadoA && <Text fw={700} size="xs" ta="center">{afiliadoA.nombre} {afiliadoA.paterno} {afiliadoA.materno}</Text>}
              </Stack>
            </Group>

            <Group justify="center" mt={30}>
              <Button 
                variant="filled"
                style={{ backgroundColor: '#0F0F0F' }}
                radius="xl" 
                px={45} 
                onClick={() => {
                  resetModal();
                  close();
                }}
              >
                  Cancelar
              </Button>
              <Button 
                variant="filled"
                style={{ backgroundColor: '#EDBE3C' }}
                radius="xl" 
                px={45} 
                c="black" 
                fw={800} 
                disabled={!afiliadoA || !puestoSeleccionadoId}
                onClick={handleEjecutar}
              >
                Confirmar Traspaso
              </Button>
            </Group>
          </Stack>
        </Box>

        {/* DERECHA: PANEL NEGRO (PUESTOS) */}
        <Box style={{ flex: 1, backgroundColor: '#0d0d0d', padding: '40px' }}>
          <Stack gap="xl">
            <Text c="white" align="center" fw={800} size="lg">Selecciona un puesto</Text>
            
            <Stack gap="xs">
              {puestosDelAfiliado && puestosDelAfiliado.length > 0 ? (
                puestosDelAfiliado.map((p) => {
                  const esSeleccionado = puestoSeleccionadoId === p.id_puesto;
                  
                  return (
                    <Box
                      key={p.id_puesto}
                      onClick={() => seleccionarPuesto(p.id_puesto)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: esSeleccionado ? '#f0c419' : 'transparent',
                        color: esSeleccionado ? 'black' : '#fff',
                        border: '1px solid #333',
                        '&:hover': {
                          backgroundColor: esSeleccionado ? '#f0c419' : '#333',
                        }
                      }}
                    >
                      <Radio
                        checked={esSeleccionado}
                        onChange={() => seleccionarPuesto(p.id_puesto)}
                        color="dark"
                        mr="md"
                        styles={{
                          radio: {
                            cursor: 'pointer',
                            backgroundColor: esSeleccionado ? 'black' : 'transparent',
                            borderColor: esSeleccionado ? 'black' : '#666',
                          }
                        }}
                      />
                      <Box>
                        <Text size="xs" fw={700}>Puesto N. {p.nroPuesto}</Text>
                        <Text size="10px" style={{ opacity: 0.8 }}>
                          Fila {p.fila} - {p.cuadra}
                        </Text>
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Text c="dimmed" size="xs" ta="center">No hay puestos vinculados</Text>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
}