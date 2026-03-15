// frontend/src/modules/GestionPatentesPuestos/components/ModalTraspaso.jsx

// ============================================
// COMPONENTE MODAL TRASPASO
// ============================================

import { useState, useEffect, useRef }                from 'react';
import { Modal, Stack, Text, Box, Loader,
         Image, Badge, Radio }                        from '@mantine/core';
import {  IconUser, IconX }                          from '@tabler/icons-react';
import { useDebouncedValue }                          from '@mantine/hooks';
import { notifications }                              from '@mantine/notifications';
import { afiliadosService }                           from '../service/afiliadosService';
import { puestosService }                             from '../service/puestosService';
import { getPerfilUrl }                               from '../../../utils/imageHelper';
import '../Styles/gestionpatentespuestos.css';

const avatarPlaceholder = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

/**
 * Buscador inline con dropdown para el modal de traspaso.
 */
const BuscadorTraspaso = ({ value, onChange, onSelect, resultados, placeholder }) => {
  const ref = useRef(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div className="gp-search-wrapper">
        < IconUser size={13} color="#999" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => { onChange(e.target.value); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
          className="gp-search-input"
          style={{ fontSize: '12px' }}
        />
        {value && (
          <button onClick={() => { onChange(''); setAbierto(false); }} className="gp-search-clear-btn">
            <IconX size={11} />
          </button>
        )}
      </div>

      {abierto && resultados.length > 0 && (
        <div className="gp-search-dropdown">
          {resultados.map((a) => (
            <div
              key={a.id_afiliado}
              className="gp-search-dropdown-item"
              onMouseDown={(e) => { e.preventDefault(); onSelect(a); setAbierto(false); }}
            >
              <div className="gp-search-dropdown-icono" style={{ width: 24, height: 24 }}>
                < IconUser size={11} color="#0f0f0f" />
              </div>
              <div>
                <div className="gp-search-dropdown-nombre">{a.nombre} {a.paterno} {a.materno}</div>
                <div className="gp-search-dropdown-ci">CI: {a.ci}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {abierto && resultados.length === 0 && value.trim().length >= 2 && (
      <div className="buscador-sin-resultados">
        Sin resultados para "{value}"
      </div>
    )}
    </div>
  );
};

/**
 * Modal para realizar el traspaso de un puesto entre dos afiliados.
 * Panel izquierdo: emisor y receptor con buscador dropdown.
 * Panel derecho (negro): lista de puestos del emisor con radio button.
 * Orden de botones: Confirmar primero, Cancelar después.
 */
export function ModalTraspaso({ opened, close, puestoSeleccionado, onTraspaso }) {
  const [loadingData,          setLoadingData]          = useState(false);
  const [searchTermDesde,      setSearchTermDesde]      = useState('');
  const [searchTermA,          setSearchTermA]          = useState('');
  const [resultadosDesde,      setResultadosDesde]      = useState([]);
  const [resultadosA,          setResultadosA]          = useState([]);
  const [afiliadoDesde,        setAfiliadoDesde]        = useState(null);
  const [afiliadoA,            setAfiliadoA]            = useState(null);
  const [puestosDelAfiliado,   setPuestosDelAfiliado]   = useState([]);
  const [puestoSeleccionadoId, setPuestoSeleccionadoId] = useState(null);

  const [desdeDebounced] = useDebouncedValue(searchTermDesde, 400);
  const [aDebounced]     = useDebouncedValue(searchTermA, 400);

  useEffect(() => {
    if (!opened) return;
    if (puestoSeleccionado) cargarDatosIniciales();
    else resetModal();
  }, [opened, puestoSeleccionado]);

  useEffect(() => {
    if (desdeDebounced.trim().length < 2) { setResultadosDesde([]); return; }
    afiliadosService.buscarTiempoReal(desdeDebounced.trim()).then(setResultadosDesde).catch(() => setResultadosDesde([]));
  }, [desdeDebounced]);

  useEffect(() => {
    if (aDebounced.trim().length < 2) { setResultadosA([]); return; }
    afiliadosService.buscarTiempoReal(aDebounced.trim()).then(setResultadosA).catch(() => setResultadosA([]));
  }, [aDebounced]);

  /**
   * Carga afiliado y puestos al abrir desde la tabla.
   */
  const cargarDatosIniciales = async () => {
    setLoadingData(true);
    try {
      const res = await puestosService.obtenerInfoTraspaso(puestoSeleccionado.id_puesto);
      setAfiliadoDesde(res.afiliadoActual || null);
      setPuestosDelAfiliado(res.puestosDelAfiliado || []);
      if (puestoSeleccionado?.id_puesto) setPuestoSeleccionadoId(puestoSeleccionado.id_puesto);
      else if (res.puestosDelAfiliado?.length > 0) setPuestoSeleccionadoId(res.puestosDelAfiliado[0].id_puesto);
    } catch (err) {
      console.error('Error cargando traspaso:', err);
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * Selecciona el emisor y carga sus puestos.
   */
  const seleccionarEmisor = async (a) => {
    setAfiliadoDesde(a);
    setResultadosDesde([]);
    setSearchTermDesde(`${a.ci} — ${a.nombre}`);
    const puestos = await afiliadosService.obtenerPuestos(a.id_afiliado);
    setPuestosDelAfiliado(puestos || []);
    if (puestos?.length > 0) setPuestoSeleccionadoId(puestos[0].id_puesto);
  };

  /**
   * Selecciona el receptor.
   */
  const seleccionarReceptor = (a) => {
    setAfiliadoA(a);
    setResultadosA([]);
    setSearchTermA(`${a.ci} — ${a.nombre}`);
  };

  /**
   * Valida y ejecuta el traspaso.
   */
  const handleEjecutar = () => {
    if (!afiliadoA) { notifications.show({ title: 'Error', message: 'Debe seleccionar un destinatario', color: 'red' }); return; }
    if (!puestoSeleccionadoId) { notifications.show({ title: 'Error', message: 'Seleccione un puesto para traspasar', color: 'red' }); return; }
    onTraspaso({ desde: afiliadoDesde.id_afiliado, para: afiliadoA.id_afiliado, puestos: [puestoSeleccionadoId], motivoDetallado: 'TRASPASO' });
  };

  /**
   * Resetea todos los estados.
   */
  const resetModal = () => {
    setSearchTermDesde(''); setSearchTermA('');
    setResultadosDesde([]); setResultadosA([]);
    setAfiliadoDesde(null); setAfiliadoA(null);
    setPuestosDelAfiliado([]); setPuestoSeleccionadoId(null);
  };

  return (
    <Modal opened={opened} onClose={() => { resetModal(); close(); }} size="90%" centered withCloseButton={false} padding={0} radius="lg">
      <Box style={{ display: 'flex', minHeight: '520px', position: 'relative' }}>

        {loadingData && (
          <Box style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader color="yellow" />
          </Box>
        )}

        {/* ── Panel izquierdo ── */}
        <Box style={{ flex: 1.6, padding: '40px', backgroundColor: '#fdfdfd' }}>
          <Stack gap="xl">
            <Text className="gp-traspaso-titulo">REALIZAR TRASPASO</Text>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '1rem', flexWrap: 'wrap' }}>

              {/* EMISOR */}
              <Stack align="center" gap="xs" style={{ width: '180px' }}>
                <Text className="gp-traspaso-label">EMISOR (DESDE):</Text>
                <Box style={{ width: 160, height: 200, overflow: 'hidden', border: '2px solid #eee', borderRadius: '8px' }}>
                  <Image src={getPerfilUrl(afiliadoDesde) || avatarPlaceholder} height={200} fit="cover" />
                </Box>
                {!puestoSeleccionado ? (
                  <>
                    <BuscadorTraspaso
                      value={searchTermDesde}
                      onChange={setSearchTermDesde}
                      onSelect={seleccionarEmisor}
                      resultados={resultadosDesde}
                      placeholder="Nombre o CI"
                    />
                    {afiliadoDesde && (
                      <Text fw={700} size="xs" ta="center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {afiliadoDesde.nombre} {afiliadoDesde.paterno} {afiliadoDesde.materno}
                      </Text>
                    )}
                  </>
                ) : (
                  <Stack gap={2} align="center">
                    <Text fw={700} size="sm" ta="center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {afiliadoDesde ? `${afiliadoDesde.nombre} ${afiliadoDesde.paterno} ${afiliadoDesde.materno}` : <Loader size="xs" />}
                    </Text>
                    <Badge color="gray" variant="light" size="xs">CI: {afiliadoDesde?.ci}</Badge>
                  </Stack>
                )}
              </Stack>

              <Text size="xl" fw={300} c="gray.4" style={{ alignSelf: 'center' }}>————</Text>

              {/* RECEPTOR */}
              <Stack align="center" gap="xs" style={{ width: '180px' }}>
                <Text className="gp-traspaso-label">RECEPTOR (NUEVO):</Text>
                <Box style={{ width: 160, height: 200, overflow: 'hidden', border: '2px solid #eee', borderRadius: '8px' }}>
                  <Image src={getPerfilUrl(afiliadoA) || avatarPlaceholder} height={200} fit="cover" />
                </Box>
                <BuscadorTraspaso
                  value={searchTermA}
                  onChange={setSearchTermA}
                  onSelect={seleccionarReceptor}
                  resultados={resultadosA}
                  placeholder="Nombre o CI del nuevo dueño"
                />
                {afiliadoA && (
                  <Text fw={700} size="xs" ta="center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {afiliadoA.nombre} {afiliadoA.paterno} {afiliadoA.materno}
                  </Text>
                )}
              </Stack>
            </div>

            {/* ── Confirmar primero, Cancelar después ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => { resetModal(); close(); }}
                className="gp-btn-volver"
                style={{ padding: '0 45px', height: '42px' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEjecutar}
                disabled={!afiliadoA || !puestoSeleccionadoId || !afiliadoDesde}
                className="gp-btn-confirmar"
                style={{ padding: '0 45px', height: '42px' }}
              >
                Confirmar Traspaso
              </button>
              
            </div>
          </Stack>
        </Box>

        {/* ── Panel derecho: puestos ── */}
        <div className="gp-panel-puestos">
          <Stack gap="xl">
            <Text className="gp-panel-puestos-titulo">Selecciona un puesto</Text>
            <Stack gap="xs">
              {puestosDelAfiliado.length > 0 ? (
                puestosDelAfiliado.map((p) => {
                  const esSeleccionado = puestoSeleccionadoId === p.id_puesto;
                  return (
                    <div
                      key={p.id_puesto}
                      className={`gp-puesto-item ${esSeleccionado ? 'selected' : ''}`}
                      onClick={() => setPuestoSeleccionadoId(p.id_puesto)}
                    >
                      <Radio
                        checked={esSeleccionado}
                        onChange={() => setPuestoSeleccionadoId(p.id_puesto)}
                        color="dark" mr="md"
                        styles={{ radio: { cursor: 'pointer', backgroundColor: esSeleccionado ? 'black' : 'transparent', borderColor: esSeleccionado ? 'black' : '#666' } }}
                      />
                      <Box>
                        <Text size="xs" fw={700}>Puesto N. {p.nroPuesto}</Text>
                        <Text size="10px" style={{ opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
                          Fila {p.fila} - {p.cuadra} • {p.tiene_patente ? 'CON PATENTE' : 'SIN PATENTE'}
                        </Text>
                      </Box>
                    </div>
                  );
                })
              ) : (
                <Text c="dimmed" size="xs" ta="center" style={{ fontFamily: 'Poppins, sans-serif' }}>No hay puestos vinculados</Text>
              )}
            </Stack>
          </Stack>
        </div>
      </Box>
    </Modal>
  );
}