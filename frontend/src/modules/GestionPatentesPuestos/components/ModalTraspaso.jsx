import { useState, useEffect } from "react";
import { 
  Modal, TextInput, Button, Group, Stack, Text, 
  Paper, Loader, Box, Image, Divider, Checkbox, Badge
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { afiliadosService } from "../service/afiliadosService";
import { puestosService } from "../service/puestosService";

export function ModalTraspaso({ opened, close, puestoSeleccionado, onTraspaso }) {
  const [loadingData, setLoadingData] = useState(false);
  const [searchTermA, setSearchTermA] = useState('');
  
  // Datos del Emisor (Desde)
  const [afiliadoDesde, setAfiliadoDesde] = useState(null);
  const [puestosDelAfiliado, setPuestosDelAfiliado] = useState([]);
  const [puestosSeleccionadosIds, setPuestosSeleccionadosIds] = useState([]);

  // Datos del Receptor (A)
  const [afiliadoA, setAfiliadoA] = useState(null);
  const [buscandoA, setBuscandoA] = useState(false);


  const [searchTermDesde, setSearchTermDesde] = useState('');

  const avatarPlaceholder = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // 1. CARGAR DATOS AL ABRIR
  useEffect(() => {
    if (opened) {
      if (puestoSeleccionado) {
        // Caso A: Viene de la tabla (Automático)
        cargarDatosIniciales();
      } else {
        // Caso B: Viene del botón superior (Resetear para búsqueda manual)
        setAfiliadoDesde(null);
        setPuestosDelAfiliado([]);
        setPuestosSeleccionadosIds([]);
      }
    }
  }, [opened, puestoSeleccionado]);
  // Función para buscar al emisor manualmente (si no se seleccionó puesto en la tabla)
  const buscarAfiliadoEmisor = async () => {
    if (!searchTermDesde) return;
    try {
      setLoadingData(true);
      // Buscamos al afiliado emisor por CI
      const afiliado = await afiliadosService.buscarPorCI(searchTermDesde);
      setAfiliadoDesde(afiliado);
      
      // Cargamos sus puestos usando su ID
      const puestos = await afiliadosService.obtenerPuestos(afiliado.id);
      setPuestosDelAfiliado(puestos || []);
    } catch (error) {
      console.error("No se encontró el emisor");
      setAfiliadoDesde(null);
    } finally {
      setLoadingData(false);
    }
  };
  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);
      // Obtenemos info del dueño actual y sus puestos
      const res = await puestosService.obtenerInfoTraspaso(puestoSeleccionado.id_puesto || puestoSeleccionado.id);
      
      setAfiliadoDesde(res.afiliadoActual);
      setPuestosDelAfiliado(res.puestosDelAfiliado);
      // Por defecto, seleccionamos el puesto desde el que se hizo clic
      setPuestosSeleccionadosIds([puestoSeleccionado.id_puesto || puestoSeleccionado.id]);
    } catch (error) {
      console.error("Error cargando info de traspaso", error);
    } finally {
      setLoadingData(false);
    }
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

  const togglePuesto = (id) => {
    setPuestosSeleccionadosIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleEjecutar = () => {
    if (!afiliadoA) return alert("Debe seleccionar un destinatario");
    if (puestosSeleccionadosIds.length === 0) return alert("Seleccione al menos un puesto");

    onTraspaso({
      desde: afiliadoDesde.id,
      para: afiliadoA.id,
      puestos: puestosSeleccionadosIds,
      motivoDetallado: "Traspaso de puesto(s) solicitado por el usuario."
    });
  };

  return (
    <Modal opened={opened} onClose={close} size="75%" centered withCloseButton={false} padding={0} radius="lg">
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
                  <Image src={afiliadoDesde?.url_perfil || avatarPlaceholder} height={200} fit="cover" />
                </Paper>
                
                {!puestoSeleccionado ? (
                  // CASO MANUAL: Buscador activo
                  <TextInput
                    placeholder="CI del emisor"
                    variant="filled" size="xs"
                    value={searchTermDesde}
                    onChange={(e) => setSearchTermDesde(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarAfiliadoEmisor()}
                    rightSection={<IconSearch size={14} style={{cursor:'pointer'}} onClick={buscarAfiliadoEmisor}/>}
                    styles={{ input: { textAlign: 'center' } }}
                  />
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
                   <Image src={afiliadoA?.url_perfil || avatarPlaceholder} height={200} fit="cover" />
                </Paper>
                <TextInput
                  placeholder="CI del nuevo dueño"
                  variant="filled" size="xs"
                  rightSection={buscandoA ? <Loader size={10}/> : <IconSearch size={14} onClick={buscarNuevoAfiliado} style={{cursor:'pointer'}}/>}
                  value={searchTermA}
                  onChange={(e) => setSearchTermA(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarNuevoAfiliado()}
                />
                {afiliadoA && <Text fw={700} size="xs" ta="center">{afiliadoA.nombre} {afiliadoA.paterno}</Text>}
              </Stack>
            </Group>

            <Group justify="center" mt={30}>
              <Button 
                variant="filled"
                style={{ backgroundColor: '#0F0F0F' }} // Color Negro exacto
                radius="xl" 
                px={45} 
                onClick={close}>
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
                const esSeleccionado = puestosSeleccionadosIds.includes(p.id);
                
                return (
                    <Box
                    key={p.id}
                    onClick={() => togglePuesto(p.id)}
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