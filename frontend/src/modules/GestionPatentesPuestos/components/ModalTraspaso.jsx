import { useState, useEffect } from "react";
import { 
  Modal, TextInput, Button, Group, Stack, Text, 
  Paper, Loader, Box, Image, Divider, Checkbox, Badge
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
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
  const [puestosSeleccionadosIds, setPuestosSeleccionadosIds] = useState([]);

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
      setPuestosSeleccionadosIds([puestoSeleccionado.id_puesto]);

    } catch (err) {
      console.error("Error cargando traspaso:", err);
      setAfiliadoDesde(null);
      setPuestosDelAfiliado([]);
    }

    setLoadingData(false);   // ← fuera del finally evita bug render
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
    } finally {
      setBuscandoA(false);
    }
  };

  const togglePuesto = (id_puesto) => {
    setPuestosSeleccionadosIds(prev => 
      prev.includes(id_puesto) ? prev.filter(p => p !== id_puesto) : [...prev, id_puesto]
    );
  };

  const handleEjecutar = () => {
    if (!afiliadoA) return alert("Debe seleccionar un destinatario");
    if (puestosSeleccionadosIds.length === 0) return alert("Seleccione al menos un puesto");

    onTraspaso({
      desde: afiliadoDesde.id_afiliado,
      para: afiliadoA.id_afiliado,
      puestos: puestosSeleccionadosIds,
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
    setPuestosSeleccionadosIds([]);
  };


  return (
    <Modal 
      opened={opened} 
      onClose={() => {
        resetModal();
        close();
      }}

      size="75%" 
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
                style={{ backgroundColor: '#0F0F0F' }} // Color Negro exacto
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
                style={{ backgroundColor: '#EDBE3C' }} // Color Amarillo exacto
                radius="xl" 
                px={45} 
                c="black" 
                fw={800} 
                disabled={!afiliadoA}
                onClick={handleEjecutar}
              >
                Confirmar Traspaso
              </Button>
            </Group>
          </Stack>
        </Box>

        {/* DERECHA: PUESTOS DEL EMISOR */}
        {/* DERECHA: PANEL NEGRO (PUESTOS) */}
        <Box style={{ flex: 1, backgroundColor: '#0d0d0d', padding: '40px' }}>
        <Stack gap="xl">
            <Text c="white" align="center" fw={800} size="lg">Puestos</Text>
            
            <Stack gap="xs">
            {/* Añadimos la validación puestosDelAfiliado && ... */}
            {puestosDelAfiliado && puestosDelAfiliado.length > 0 ? (
                puestosDelAfiliado.map((p) => {
                const esSeleccionado = puestosSeleccionadosIds.includes(p.id_puesto);
                
                return (
                    <Box
                    key={p.id_puesto}
                    onClick={() => togglePuesto(p.id_puesto)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: esSeleccionado ? '#f0c419' : 'transparent',
                        color: esSeleccionado ? 'black' : '#fff',
                        border: '1px solid #333'
                    }}
                    >
                    <Checkbox 
                        checked={esSeleccionado} 
                        readOnly 
                        color="dark" 
                        mr="md" 
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
                <Text c="dimmed" size="xs" ta="center">No hay otros puestos vinculados</Text>
            )}
            </Stack>
        </Stack>
</Box>
      </Box>
    </Modal>
  );
}