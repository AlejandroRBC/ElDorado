// frontend/src/modules/GestionPatentesPuestos/components/ModalAsignarPuesto.jsx
import { useState, useEffect } from "react";
import { 
  Modal, TextInput, Button, Group, Stack, Text, 
  Paper, Loader, Box, Image, Badge, Alert, Radio, Avatar
} from '@mantine/core';
import { IconSearch, IconUserPlus, IconX, IconCheck } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { afiliadosService } from "../service/afiliadosService";
import { getPerfilUrl } from '../../../utils/imageHelper';

const API_BASE = 'http://localhost:3000/api';

export function ModalAsignarPuesto({ opened, close, puesto, onAsignado }) {
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState([]);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [step, setStep] = useState(1); // 1: buscar, 2: confirmar
  
  const [debouncedSearch] = useDebouncedValue(searchTerm, 400);
  
  const avatarPlaceholder = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Reset al abrir/cerrar
  useEffect(() => {
    if (!opened) {
      resetModal();
    }
  }, [opened]);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResultados([]);
      return;
    }

    const buscar = async () => {
      try {
        setBuscando(true);
        const results = await afiliadosService.buscarTiempoReal(debouncedSearch);
        setResultados(results || []);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    };

    buscar();
  }, [debouncedSearch]);

  const resetModal = () => {
    setSearchTerm('');
    setResultados([]);
    setAfiliadoSeleccionado(null);
    setStep(1);
  };

  const seleccionarAfiliado = (afiliado) => {
    setAfiliadoSeleccionado(afiliado);
    setStep(2);
  };

  const handleAsignar = async () => {
    if (!afiliadoSeleccionado || !puesto) return;

    try {
      setLoading(true);

      // Datos para asignar el puesto
      const datosAsignacion = {
        fila: puesto.fila,
        cuadra: puesto.cuadra,
        nroPuesto: puesto.nroPuesto,
        rubro: puesto.rubro || '',
        tiene_patente: puesto.tiene_patente || false,
        razon: 'ASIGNADO'
      };

      const response = await fetch(`${API_BASE}/afiliados/${afiliadoSeleccionado.id_afiliado}/asignar-puesto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosAsignacion),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al asignar puesto');
      }

      notifications.show({
        title: '✅ Éxito',
        message: `Puesto asignado a ${afiliadoSeleccionado.nombre} ${afiliadoSeleccionado.paterno}`,
        color: 'green'
      });

      resetModal();
      if (onAsignado) onAsignado();
      close();

    } catch (error) {
      console.error('Error asignando puesto:', error);
      notifications.show({
        title: '❌ Error',
        message: error.message || 'No se pudo asignar el puesto',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!puesto) return null;

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="lg"
      centered
      withCloseButton={false}
      radius="lg"
    >
      <Box p="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Text fw={900} size="xl" style={{ letterSpacing: '1px' }}>
              ASIGNAR PUESTO
            </Text>
            <Badge size="lg" color="yellow" variant="filled">
              {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
            </Badge>
          </Group>

          {step === 1 ? (
            /* PASO 1: BUSCAR AFILIADO */
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Busca el afiliado que recibirá este puesto
              </Text>

              <TextInput
                placeholder="Nombre, apellido o CI del afiliado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<IconSearch size={18} />}
                rightSection={buscando ? <Loader size="xs" /> : null}
                size="md"
                autoFocus
              />

              {/* Resultados de búsqueda - IMÁGENES MÁS PEQUEÑAS */}
              {resultados.length > 0 && (
                <Paper withBorder p="xs" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Stack gap="xs">
                    {resultados.map((afiliado) => (
                      <Box
                        key={afiliado.id_afiliado}
                        p="sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          border: '1px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderColor: '#edbe3c'
                          }
                        }}
                        onClick={() => seleccionarAfiliado(afiliado)}
                      >
                        {/* Avatar pequeño y controlado */}
                        <Avatar
                          src={getPerfilUrl(afiliado)}
                          size="xl"  // Tamaño mediano de Mantine (38px)
                          radius="sm"
                          color="blue"
                        >
                          {afiliado.nombre?.charAt(0)}
                        </Avatar>
                        
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={600}>
                            {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
                          </Text>
                          <Text size="xs" c="dimmed">
                            CI: {afiliado.ci}
                          </Text>
                        </Box>
                        <IconUserPlus size={20} color="#666" />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}

              {searchTerm.length > 1 && resultados.length === 0 && !buscando && (
                <Alert color="yellow" icon={<IconX size={16} />}>
                  No se encontraron afiliados con "{searchTerm}"
                </Alert>
              )}
            </Stack>
          ) : (
            /* PASO 2: CONFIRMAR ASIGNACIÓN */
            <Stack gap="md">
              <Alert color="green" icon={<IconCheck size={16} />}>
                Afiliado seleccionado correctamente
              </Alert>

              <Paper withBorder p="md">
                <Group align="center" gap="md">
                  {/* Avatar pequeño en la confirmación también */}
                  <Avatar
                    src={getPerfilUrl(afiliadoSeleccionado)}
                    size="lg"  // Un poco más grande pero controlado (46px)
                    radius="md"
                    color="blue"
                  >
                    {afiliadoSeleccionado?.nombre?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Text fw={700} size="lg">
                      {afiliadoSeleccionado?.nombre} {afiliadoSeleccionado?.paterno}
                    </Text>
                    <Text size="sm" c="dimmed">
                      CI: {afiliadoSeleccionado?.ci}
                    </Text>
                  </Box>
                </Group>
              </Paper>

              <Paper withBorder p="md" bg="gray.0">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>Puesto a asignar:</Text>
                    <Badge color="yellow" size="lg">
                      {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>Rubro:</Text>
                    <Text size="sm">{puesto.rubro || 'No especificado'}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>Patente:</Text>
                    <Badge color={puesto.tiene_patente ? "green" : "gray"} variant="dot">
                      {puesto.tiene_patente ? "Con patente" : "Sin patente"}
                    </Badge>
                  </Group>
                </Stack>
              </Paper>

              <Text size="sm" c="dimmed" ta="center">
                El puesto será asignado con razón "ASIGNADO" y quedará marcado como no disponible
              </Text>
            </Stack>
          )}

          {/* Botones de acción */}
          <Group justify="flex-end" gap="md" mt="xl">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 2) {
                  setStep(1);
                  setAfiliadoSeleccionado(null);
                } else {
                  close();
                }
              }}
              disabled={loading}
              style={{ borderColor: '#0f0f0f', color: '#0f0f0f' }}
              radius="xl"
              px={30}
            >
              {step === 2 ? 'Volver' : 'Cancelar'}
            </Button>
            
            {step === 2 && (
              <Button
                onClick={handleAsignar}
                loading={loading}
                style={{ backgroundColor: '#EDBE3C', color: 'black' }}
                radius="xl"
                px={30}
                fw={600}
              >
                Confirmar Asignación
              </Button>
            )}
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}