// frontend/src/modules/GestionPatentesPuestos/components/ModalAsignarPuesto.jsx

// ============================================
// COMPONENTE MODAL ASIGNAR PUESTO
// ============================================

import { useState, useEffect }                                    from 'react';
import { Modal, Group, Stack, Text, Loader, Box,
         Badge, Alert, Avatar }                                   from '@mantine/core';
import { IconSearch, IconUserPlus, IconX, IconCheck,
         IconChevronDown, IconAlertTriangle }                     from '@tabler/icons-react';
import { useDebouncedValue }                                      from '@mantine/hooks';
import { notifications }                                          from '@mantine/notifications';
import { afiliadosService }                                       from '../service/afiliadosService';
import { getPerfilUrl }                                           from '../../../utils/imageHelper';
import '../Styles/gestionpatentespuestos.css';

const API_BASE = 'http://localhost:3000/api';

/**
 * Modal de dos pasos para asignar un afiliado a un puesto vacante.
 * Paso 1: buscar afiliado por nombre o CI con debounce.
 * Paso 2: editar rubro y estado de patente, luego confirmar.
 *
 * Reglas de patente:
 *   - Si se escribe un nro_patente → tiene_patente se activa solo.
 *   - Si se elige "Sin patente"    → nro_patente se borra y se guarda NULL.
 *   - Si el puesto ya tenía patente y se la quitamos → aviso de advertencia.
 */
export function ModalAsignarPuesto({ opened, close, puesto, onAsignado }) {
  const [loading,              setLoading]              = useState(false);
  const [buscando,             setBuscando]             = useState(false);
  const [searchTerm,           setSearchTerm]           = useState('');
  const [resultados,           setResultados]           = useState([]);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [step,                 setStep]                 = useState(1);

  // ── Estado editable del puesto ────────────────────────────
  const [formPuesto, setFormPuesto] = useState({
    rubro:         '',
    tiene_patente: false,
    nro_patente:   '',
  });

  const [debouncedSearch] = useDebouncedValue(searchTerm, 400);

  // ── Ciclo de vida ─────────────────────────────────────────
  useEffect(() => { if (!opened) resetModal(); }, [opened]);

  useEffect(() => {
    if (puesto) {
      setFormPuesto({
        rubro:         puesto.rubro         || '',
        tiene_patente: puesto.tiene_patente === 1 || puesto.tiene_patente === true,
        nro_patente:   puesto.nro_patente   != null ? String(puesto.nro_patente) : '',
      });
    }
  }, [puesto]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed.length < 2) { setResultados([]); return; }
    const buscar = async () => {
      try {
        setBuscando(true);
        const results = await afiliadosService.buscarTiempoReal(trimmed);
        setResultados(results || []);
      } catch { setResultados([]); }
      finally   { setBuscando(false); }
    };
    buscar();
  }, [debouncedSearch]);

  // ── Handlers ──────────────────────────────────────────────
  const resetModal = () => {
    setSearchTerm(''); setResultados([]);
    setAfiliadoSeleccionado(null); setStep(1);
  };

  const seleccionarAfiliado = (afiliado) => {
    setAfiliadoSeleccionado(afiliado);
    setStep(2);
  };

  /**
   * Actualiza formPuesto aplicando las reglas de patente:
   *   nro_patente con texto → activa tiene_patente automáticamente.
   *   tiene_patente = false  → borra nro_patente.
   */
  const handleFormPuesto = (campo, valor) => {
    setFormPuesto(prev => {
      const siguiente = { ...prev, [campo]: valor };
      if (campo === 'nro_patente') {
        siguiente.tiene_patente = valor.trim() !== '';
      }
      if (campo === 'tiene_patente' && valor === false) {
        siguiente.nro_patente = '';
      }
      return siguiente;
    });
  };

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
            fila:          puesto.fila,
            cuadra:        puesto.cuadra,
            nroPuesto:     puesto.nroPuesto,
            rubro:         formPuesto.rubro,
            tiene_patente: formPuesto.tiene_patente,
            nro_patente:   formPuesto.tiene_patente
                             ? (formPuesto.nro_patente.trim() || null)
                             : null,
            razon: 'ASIGNADO',
          }),
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

  // ── ¿El puesto originalmente tenía patente y se la estamos quitando? ──
  const puestoTeniaPatente = puesto.tiene_patente === 1 ||
                             puesto.tiene_patente === true ||
                             puesto.nro_patente   != null;
  const quitandoPatente    = puestoTeniaPatente && !formPuesto.tiene_patente;

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

          {/* ══════════════════════════════════════════════ */}
          {/* PASO 1 — Buscar afiliado                       */}
          {/* ══════════════════════════════════════════════ */}
          {step === 1 && (
            <Stack gap="md">
              <Text size="sm" c="dimmed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Busca el afiliado que recibirá este puesto
              </Text>

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

                {searchTerm.trim().length >= 2 && resultados.length === 0 && !buscando && (
                  <div className="buscador-sin-resultados">
                    Sin resultados para &quot;{searchTerm}&quot;
                  </div>
                )}
              </div>

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
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* PASO 2 — Editar datos del puesto + confirmar   */}
          {/* ══════════════════════════════════════════════ */}
          {step === 2 && (
            <Stack gap="md">

              <Alert color="green" icon={<IconCheck size={16} />}>
                Afiliado seleccionado correctamente
              </Alert>

              {/* Tarjeta del afiliado */}
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

              {/* Datos editables del puesto */}
              <Box style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#fafafa' }}>
                <Stack gap="sm">

                  {/* Identificación (solo lectura) */}
                  <Group justify="space-between">
                    <Text size="sm" fw={600} style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Puesto a asignar:
                    </Text>
                    <Badge color="yellow" size="lg">
                      {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
                    </Badge>
                  </Group>

                  {/* Rubro */}
                  <div className="gp-field-group">
                    <label className="gp-field-label" htmlFor="asignar-rubro">
                      Rubro
                    </label>
                    <div className="gp-search-wrapper">
                      <input
                        id="asignar-rubro"
                        type="text"
                        placeholder="Ej: Ropa, Calzado, Comida..."
                        value={formPuesto.rubro}
                        onChange={(e) => handleFormPuesto('rubro', e.target.value)}
                        className="gp-search-input"
                      />
                      {formPuesto.rubro && (
                        <button
                          onClick={() => handleFormPuesto('rubro', '')}
                          className="gp-search-clear-btn"
                          type="button"
                        >
                          <IconX size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Patente: Select nativo con estilo gp */}
                  <div className="gp-field-group">
                    <label className="gp-field-label" htmlFor="asignar-patente">
                      Estado de patente
                    </label>
                    <div className="gp-select-wrapper">
                      <select
                        id="asignar-patente"
                        value={formPuesto.tiene_patente ? 'true' : 'false'}
                        onChange={(e) => handleFormPuesto('tiene_patente', e.target.value === 'true')}
                        className="gp-select"
                      >
                        <option value="true">Con patente</option>
                        <option value="false">Sin patente</option>
                      </select>
                      <IconChevronDown size={14} className="gp-select-icon" />
                    </div>
                  </div>

                  {/* Nro de patente — solo visible si tiene_patente = true */}
                  {formPuesto.tiene_patente && (
                    <div className="gp-field-group">
                      <label className="gp-field-label" htmlFor="asignar-nro-patente">
                        Número de patente <span style={{ color: '#aaa', fontWeight: 400 }}>(opcional)</span>
                      </label>
                      <div className="gp-search-wrapper">
                        <input
                          id="asignar-nro-patente"
                          type="text"
                          placeholder="Nro del documento físico..."
                          value={formPuesto.nro_patente}
                          onChange={(e) => handleFormPuesto('nro_patente', e.target.value)}
                          className="gp-search-input"
                        />
                        {formPuesto.nro_patente && (
                          <button
                            onClick={() => handleFormPuesto('nro_patente', '')}
                            className="gp-search-clear-btn"
                            type="button"
                          >
                            <IconX size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Aviso si se está quitando la patente a un puesto que la tenía */}
                  {quitandoPatente && (
                    <div className="gp-aviso-patente">
                      <IconAlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span>El número de patente anterior será eliminado al guardar.</span>
                    </div>
                  )}

                </Stack>
              </Box>

              <Text size="sm" c="dimmed" ta="center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                El puesto será asignado con razón &quot;ASIGNADO&quot; y quedará marcado como no disponible
              </Text>
            </Stack>
          )}

          {/* ── Botones ── */}
          <Group justify="flex-end" gap="md">
            <button
              onClick={() => {
                if (step === 2) { setStep(1); setAfiliadoSeleccionado(null); }
                else { close(); }
              }}
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