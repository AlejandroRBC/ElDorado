// frontend/src/modules/GestionPatentesPuestos/components/ModalAsignarPuesto.jsx

// ============================================
// COMPONENTE MODAL ASIGNAR PUESTO
// ============================================

import { useState, useEffect }                              from 'react';
import { Modal, Group, Stack, Text, Loader, Box,
         Badge, Alert, Avatar }                             from '@mantine/core';
import { IconSearch, IconUserPlus, IconX, IconCheck }       from '@tabler/icons-react';
import { useDebouncedValue }                                from '@mantine/hooks';
import { notifications }                                    from '@mantine/notifications';
import { afiliadosService }                                 from '../service/afiliadosService';
import { getPerfilUrl }                                     from '../../../utils/imageHelper';
import '../Styles/gestionpatentespuestos.css';

const API_BASE = 'http://localhost:3000/api';

/**
 * Modal de dos pasos para asignar un afiliado a un puesto vacante.
 * Paso 1: buscar afiliado por nombre o CI con debounce.
 * Paso 2: confirmar la asignación mostrando datos del afiliado y del puesto.
 */
export function ModalAsignarPuesto({ opened, close, puesto, onAsignado }) {
  const [loading,              setLoading]              = useState(false);
  const [buscando,             setBuscando]             = useState(false);
  const [searchTerm,           setSearchTerm]           = useState('');
  const [resultados,           setResultados]           = useState([]);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [step,                 setStep]                 = useState(1);

  const [debouncedSearch] = useDebouncedValue(searchTerm, 400);

  useEffect(() => { if (!opened) resetModal(); }, [opened]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed.length < 2) { setResultados([]); return; }
    const buscar = async () => {
      try {
        setBuscando(true);
        const results = await afiliadosService.buscarTiempoReal(trimmed);
        setResultados(results || []);
      } catch { setResultados([]); }
      finally { setBuscando(false); }
    };
    buscar();
  }, [debouncedSearch]);

  /**
   * Resetea todos los estados del modal.
   */
  const resetModal = () => {
    setSearchTerm(''); setResultados([]);
    setAfiliadoSeleccionado(null); setStep(1);
  };

  /**
   * Selecciona un afiliado y avanza al paso 2.
   */
  const seleccionarAfiliado = (afiliado) => {
    setAfiliadoSeleccionado(afiliado);
    setStep(2);
  };

  /**
   * Ejecuta la asignación del puesto al afiliado seleccionado.
   */
  const handleAsignar = async () => {
    if (!afiliadoSeleccionado || !puesto) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/afiliados/${afiliadoSeleccionado.id_afiliado}/asignar-puesto`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fila: puesto.fila, cuadra: puesto.cuadra, nroPuesto: puesto.nroPuesto,
            rubro: puesto.rubro || '', tiene_patente: puesto.tiene_patente || false, razon: 'ASIGNADO',
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al asignar puesto');
      notifications.show({ title: '✅ Éxito', message: `Puesto asignado a ${afiliadoSeleccionado.nombre} ${afiliadoSeleccionado.paterno}`, color: 'green' });
      resetModal();
      if (onAsignado) onAsignado();
      close();
    } catch (error) {
      notifications.show({ title: '❌ Error', message: error.message || 'No se pudo asignar el puesto', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  if (!puesto) return null;

  return (
    <Modal opened={opened} onClose={close} size="lg" centered withCloseButton={false} radius="lg">
      <Box p="xl">
        <Stack gap="xl">

          {/* ── Header ── */}
          <Group justify="space-between" align="center">
            <Text className="gp-modal-titulo">ASIGNAR PUESTO</Text>
            <Badge size="lg" color="yellow" variant="filled">
              {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
            </Badge>
          </Group>

          {step === 1 ? (
            <Stack gap="md">
              <Text size="sm" c="dimmed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Busca el afiliado que recibirá este puesto
              </Text>

              {/* ── Buscador con sin-resultados ── */}
              <div style={{ position: 'relative' }}>
                <div className="gp-search-wrapper">
                  {buscando
                    ? <Loader size={14} color="dark" style={{ flexShrink: 0 }} />
                    : <IconSearch size={15} color="#999" style={{ flexShrink: 0 }} />
                  }
                  <input
                    type="text"
                    placeholder="Nombre, apellido o CI del afiliado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="gp-search-input"
                    autoFocus
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="gp-search-clear-btn">
                      <IconX size={13} />
                    </button>
                  )}
                </div>

                {/* Sin resultados */}
                {searchTerm.trim().length >= 2 && resultados.length === 0 && !buscando && (
                  <div className="buscador-sin-resultados">
                    Sin resultados para "{searchTerm}"
                  </div>
                )}
              </div>

              {/* ── Resultados ── */}
              {resultados.length > 0 && (
                <Box style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  {resultados.map((afiliado) => (
                    <div
                      key={afiliado.id_afiliado}
                      className="gp-resultado-item"
                      onClick={() => seleccionarAfiliado(afiliado)}
                    >
                      <Avatar src={getPerfilUrl(afiliado)} size="md" radius="sm">
                        {afiliado.nombre?.charAt(0)}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={600} style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
                        </Text>
                        <Text size="xs" c="dimmed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          CI: {afiliado.ci}
                        </Text>
                      </Box>
                      <IconUserPlus size={18} color="#999" />
                    </div>
                  ))}
                </Box>
              )}
            </Stack>
          ) : (
            /* ── Paso 2: confirmar asignación ── */
            <Stack gap="md">
              <Alert color="green" icon={<IconCheck size={16} />}>
                Afiliado seleccionado correctamente
              </Alert>

              <Box style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '1rem' }}>
                <Group align="center" gap="md">
                  <Avatar src={getPerfilUrl(afiliadoSeleccionado)} size="lg" radius="md">
                    {afiliadoSeleccionado?.nombre?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Text fw={700} size="lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {afiliadoSeleccionado?.nombre} {afiliadoSeleccionado?.paterno}
                    </Text>
                    <Text size="sm" c="dimmed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      CI: {afiliadoSeleccionado?.ci}
                    </Text>
                  </Box>
                </Group>
              </Box>

              <Box style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#fafafa' }}>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={600} style={{ fontFamily: 'Poppins, sans-serif' }}>Puesto a asignar:</Text>
                    <Badge color="yellow" size="lg">{puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={600} style={{ fontFamily: 'Poppins, sans-serif' }}>Rubro:</Text>
                    <Text size="sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{puesto.rubro || 'No especificado'}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={600} style={{ fontFamily: 'Poppins, sans-serif' }}>Patente:</Text>
                    <Badge color={puesto.tiene_patente ? 'green' : 'gray'} variant="dot">
                      {puesto.tiene_patente ? 'Con patente' : 'Sin patente'}
                    </Badge>
                  </Group>
                </Stack>
              </Box>

              <Text size="sm" c="dimmed" ta="center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                El puesto será asignado con razón "ASIGNADO" y quedará marcado como no disponible
              </Text>
            </Stack>
          )}

          {/* ── Botones ── */}
          <Group justify="flex-end" gap="md">
            <button
              onClick={() => { if (step === 2) { setStep(1); setAfiliadoSeleccionado(null); } else { close(); } }}
              disabled={loading}
              className="gp-btn-volver"
              style={{ padding: '0 30px', height: '42px' }}
            >
              {step === 2 ? 'Volver' : 'Cancelar'}
            </button>
            {step === 2 && (
              <button
                onClick={handleAsignar}
                disabled={loading}
                className="gp-btn-confirmar"
                style={{ padding: '0 30px', height: '42px' }}
              >
                {loading ? 'Asignando...' : 'Confirmar Asignación'}
              </button>
            )}
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}