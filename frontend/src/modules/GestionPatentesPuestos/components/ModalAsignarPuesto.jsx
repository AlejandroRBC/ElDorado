// frontend/src/modules/GestionPatentesPuestos/components/ModalAsignarPuesto.jsx
import { useState, useEffect } from "react";
import {
  Modal, TextInput, Button, Group, Stack, Text,
  Paper, Loader, Box, Badge, Alert, Avatar, Select, Divider
} from '@mantine/core';
import { IconSearch, IconUserPlus, IconX, IconCheck, IconMapPin } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { afiliadosService } from "../service/afiliadosService";
import { getPerfilUrl } from '../../../utils/imageHelper';

const API_BASE = 'http://localhost:3000/api';

// ─── estilos compartidos ──────────────────────────────────────────
const estiloInput = {
  input: {
    backgroundColor: '#f6f8fe',
    border: '1px solid #e8eaf0',
    borderRadius: '8px',
  },
};

export function ModalAsignarPuesto({ opened, close, puesto, onAsignado }) {
  const [loading,              setLoading]              = useState(false);
  const [buscando,             setBuscando]             = useState(false);
  const [searchTerm,           setSearchTerm]           = useState('');
  const [resultados,           setResultados]           = useState([]);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [step,                 setStep]                 = useState(1); // 1: buscar, 2: editar + confirmar

  // ── Estado editable del puesto ────────────────────────────────
  // Se inicializa cuando el usuario llega al paso 2
  const [formPuesto, setFormPuesto] = useState({
    rubro:         '',
    tiene_patente: false,
    nro_patente:   '',
  });

  const [debouncedSearch] = useDebouncedValue(searchTerm, 400);

  // ── Reset al abrir/cerrar ─────────────────────────────────────
  useEffect(() => {
    if (!opened) resetModal();
  }, [opened]);

  // ── Inicializar el formulario cuando entra el puesto ─────────
  useEffect(() => {
    if (puesto) {
      setFormPuesto({
        rubro:         puesto.rubro         || '',
        tiene_patente: puesto.tiene_patente === 1 || puesto.tiene_patente === true,
        nro_patente:   puesto.nro_patente   != null ? String(puesto.nro_patente) : '',
      });
    }
  }, [puesto]);

  // ── Búsqueda en tiempo real ───────────────────────────────────
  useEffect(() => {
    if (debouncedSearch.length < 2) { setResultados([]); return; }

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

  // ── Manejo del formulario del puesto ─────────────────────────
  const handleFormPuesto = (campo, valor) => {
    setFormPuesto(prev => {
      const siguiente = { ...prev, [campo]: valor };

      // Si el usuario escribe un nro_patente → patente = true automáticamente
      if (campo === 'nro_patente') {
        siguiente.tiene_patente = valor.trim() !== '';
      }

      // Si el usuario selecciona "Sin patente" → se borra el nro_patente
      if (campo === 'tiene_patente' && valor === false) {
        siguiente.nro_patente = '';
      }

      return siguiente;
    });
  };

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

  // ── Confirmar asignación ──────────────────────────────────────
  const handleAsignar = async () => {
    if (!afiliadoSeleccionado || !puesto) return;

    try {
      setLoading(true);

      const datosAsignacion = {
        fila:          puesto.fila,
        cuadra:        puesto.cuadra,
        nroPuesto:     puesto.nroPuesto,
        rubro:         formPuesto.rubro,
        tiene_patente: formPuesto.tiene_patente,
        // nro_patente se envía para que el backend lo persista / borre
        nro_patente:   formPuesto.tiene_patente
                         ? (formPuesto.nro_patente.trim() || null)
                         : null,
        razon: 'ASIGNADO',
      };

      const response = await fetch(
        `${API_BASE}/afiliados/${afiliadoSeleccionado.id_afiliado}/asignar-puesto`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(datosAsignacion),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al asignar puesto');

      notifications.show({
        title:   '✅ Éxito',
        message: `Puesto asignado a ${afiliadoSeleccionado.nombre} ${afiliadoSeleccionado.paterno}`,
        color:   'green',
      });

      resetModal();
      if (onAsignado) onAsignado();
      close();

    } catch (error) {
      console.error('Error asignando puesto:', error);
      notifications.show({
        title:   '❌ Error',
        message: error.message || 'No se pudo asignar el puesto',
        color:   'red',
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

          {/* ── Header ─────────────────────────────────────── */}
          <Group justify="space-between" align="center">
            <Text fw={900} size="xl" style={{ letterSpacing: '1px' }}>
              ASIGNAR PUESTO
            </Text>
            <Badge
              size="lg"
              style={{ backgroundColor: '#EDBE3C', color: '#0f0f0f', fontWeight: 700 }}
            >
              <Group gap={4} align="center">
                <IconMapPin size={13} />
                {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
              </Group>
            </Badge>
          </Group>

          {/* ═══════════════════════════════════════════════ */}
          {/* PASO 1 — Buscar afiliado                        */}
          {/* ═══════════════════════════════════════════════ */}
          {step === 1 && (
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
                styles={estiloInput}
              />

              {resultados.length > 0 && (
                <Paper withBorder p="xs" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Stack gap="xs">
                    {resultados.map((afiliado) => (
                      <Box
                        key={afiliado.id_afiliado}
                        p="sm"
                        onClick={() => seleccionarAfiliado(afiliado)}
                        style={{
                          display:       'flex',
                          alignItems:    'center',
                          gap:           '12px',
                          cursor:        'pointer',
                          borderRadius:  '8px',
                          border:        '1px solid transparent',
                          transition:    'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#f6f8fe';
                          e.currentTarget.style.borderColor     = '#edbe3c';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor     = 'transparent';
                        }}
                      >
                        <Avatar src={getPerfilUrl(afiliado)} size="xl" radius="sm" color="blue">
                          {afiliado.nombre?.charAt(0)}
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={600}>
                            {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
                          </Text>
                          <Text size="xs" c="dimmed">CI: {afiliado.ci}</Text>
                        </Box>
                        <IconUserPlus size={20} color="#666" />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}

              {searchTerm.length > 1 && resultados.length === 0 && !buscando && (
                <Alert color="yellow" icon={<IconX size={16} />}>
                  No se encontraron afiliados con &quot;{searchTerm}&quot;
                </Alert>
              )}
            </Stack>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* PASO 2 — Editar datos del puesto + confirmar    */}
          {/* ═══════════════════════════════════════════════ */}
          {step === 2 && (
            <Stack gap="md">

              {/* Afiliado seleccionado */}
              <Alert color="green" icon={<IconCheck size={16} />} radius="md">
                Afiliado seleccionado correctamente
              </Alert>

              <Paper withBorder p="md" radius="md">
                <Group align="center" gap="md">
                  <Avatar
                    src={getPerfilUrl(afiliadoSeleccionado)}
                    size="lg"
                    radius="md"
                    color="blue"
                  >
                    {afiliadoSeleccionado?.nombre?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Text fw={700} size="lg">
                      {afiliadoSeleccionado?.nombre} {afiliadoSeleccionado?.paterno}
                    </Text>
                    <Text size="sm" c="dimmed">CI: {afiliadoSeleccionado?.ci}</Text>
                  </Box>
                </Group>
              </Paper>

              <Divider label="Datos del puesto" labelPosition="left" />

              {/* ── Campos editables ─────────────────────── */}
              <Paper withBorder p="md" radius="md" bg="gray.0">
                <Stack gap="sm">

                  {/* Identificación (solo lectura) */}
                  <Group justify="space-between" align="center">
                    <Text size="sm" fw={600} c="dimmed">Puesto</Text>
                    <Badge
                      style={{ backgroundColor: '#EDBE3C', color: '#0f0f0f', fontWeight: 700 }}
                    >
                      {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
                    </Badge>
                  </Group>

                  {/* Rubro */}
                  <TextInput
                    label="Rubro"
                    placeholder="Ej: Ropa, Calzado, Comida..."
                    value={formPuesto.rubro}
                    onChange={(e) => handleFormPuesto('rubro', e.target.value)}
                    styles={estiloInput}
                  />

                  {/* Patente */}
                  <Select
                    label="Estado de patente"
                    data={[
                      { value: 'true',  label: 'Con patente'  },
                      { value: 'false', label: 'Sin patente'  },
                    ]}
                    value={formPuesto.tiene_patente ? 'true' : 'false'}
                    onChange={(v) => handleFormPuesto('tiene_patente', v === 'true')}
                    styles={estiloInput}
                  />

                  {/* Nro de patente — visible solo si tiene_patente = true */}
                  {formPuesto.tiene_patente && (
                    <TextInput
                      label="Número de patente"
                      placeholder="Nro del documento físico (opcional)"
                      value={formPuesto.nro_patente}
                      onChange={(e) => handleFormPuesto('nro_patente', e.target.value)}
                      styles={estiloInput}
                    />
                  )}

                  {/* Aviso cuando el usuario quita la patente */}
                  {!formPuesto.tiene_patente && (puesto.tiene_patente || puesto.nro_patente) && (
                    <Alert
                      color="orange"
                      icon={<IconX size={14} />}
                      radius="md"
                      py={6}
                      styles={{ message: { fontSize: '12px' } }}
                    >
                      El número de patente anterior será eliminado al guardar.
                    </Alert>
                  )}
                </Stack>
              </Paper>

              <Text size="xs" c="dimmed" ta="center">
                El puesto quedará marcado como no disponible tras la asignación.
              </Text>
            </Stack>
          )}

          {/* ── Botones ────────────────────────────────────── */}
          <Group justify="flex-end" gap="md" mt="xs">
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
                style={{ backgroundColor: '#EDBE3C', color: '#0f0f0f' }}
                radius="xl"
                px={30}
                fw={700}
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