// frontend/src/modules/Afiliados/components/modals/AfiliadoModal.jsx
//
// FUSIONA: ModalAfiliado.jsx (crear) + ModalDesafiliarAfiliado.jsx +
//          Modalhistorialafiliado.jsx
//
// Un solo punto de entrada para todas las acciones sobre el afiliado.
// Se controla por la prop `mode`:
//   'crear'      → formulario de alta de afiliado
//   'desafiliar' → confirmación de baja
//   'historial'  → tabla de historial
//
// Cada modo renderiza su propio contenido; el shell del Modal es compartido.

import { memo, useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Modal, Stack, Group, Text, Button, Paper, Box, Badge,
  Alert, ScrollArea, Loader, Center,
  Tabs, TextInput, Select, Checkbox, ActionIcon, Pagination,
} from '@mantine/core';
import {
  IconAlertTriangle, IconUserOff, IconX, IconClockHour4,
  IconUserPlus, IconEdit, IconUserCheck, IconAward, IconAwardOff,
  IconTrash,
} from '@tabler/icons-react';

import { useAfiliadoActions }    from '../../hooks/useAfiliadoActions';
import { useAfiliadoUI }         from '../../hooks/useAfiliadoUI';
import { afiliadosApi }          from '../../services/afiliados.api';
import {
  formatearFecha,
  etiquetaTipo,
  metadatosTipo,
} from '../../handlers/afiliados.handlers';
import '../../styles/Estilos.css';

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const EXTENSIONES  = ['LP', 'CB', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PD', 'EN'];
const SEXOS        = [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }];
const ITEMS_PAGINA = 30;

const FILAS   = [{ value: '', label: 'Todas las filas' },   { value: 'A', label: 'Fila A' }, { value: 'B', label: 'Fila B' }];
const CUADRAS = [
  { value: '', label: 'Todas las cuadras' },
  { value: 'Cuadra 1', label: 'Cuadra 1' }, { value: 'Cuadra 2', label: 'Cuadra 2' },
  { value: 'Cuadra 3', label: 'Cuadra 3' }, { value: 'Cuadra 4', label: 'Cuadra 4' },
  { value: 'Callejón', label: 'Callejón' },
];

// ─────────────────────────────────────────────────────────────
// MODO HISTORIAL
// ─────────────────────────────────────────────────────────────

const ICONOS_HISTORIAL = {
  AFILIACION:    <IconUserPlus  size={14} />,
  MODIFICACION:  <IconEdit      size={14} />,
  DESAFILIACION: <IconUserOff   size={14} />,
  REAFILIACION:  <IconUserCheck size={14} />,
  INGRESO:       <IconAward     size={14} />,
  EGRESO:        <IconAwardOff  size={14} />,
};

const claseBadgeHistorial = (tipo, origen) => {
  if (origen === 'directorio') return tipo === 'INGRESO' ? 'historial-badge tipo-directorio-ingreso' : 'historial-badge tipo-directorio-egreso';
  if (tipo === 'MODIFICACION')  return 'historial-badge tipo-modificacion';
  if (tipo === 'DESAFILIACION') return 'historial-badge tipo-desafiliacion';
  return 'historial-badge';
};

const ContenidoHistorial = memo(({ historial, cargando, error }) => {
  if (cargando) return (
    <Center py="xl">
      <Loader size="sm" color="dark" />
      <Text size="sm" ml="sm" style={{ color: '#374567' }}>Cargando historial...</Text>
    </Center>
  );
  if (error) return (
    <div className="historial-vacio">
      <IconClockHour4 size={36} />
      <Text>No se pudo cargar el historial</Text>
      <Text size="xs" style={{ color: '#C4C4C4' }}>{error}</Text>
    </div>
  );
  if (!historial.length) return (
    <div className="historial-vacio">
      <IconClockHour4 size={36} />
      <Text>Sin historial registrado</Text>
    </div>
  );
  return (
    <ScrollArea style={{ maxHeight: '65vh' }} offsetScrollbars>
      <div className="historial-tabla">
        <table>
          <thead>
            <tr>
              <th style={{ width: 200 }}>Evento</th>
              <th>Descripción</th>
              <th style={{ width: 120 }}>Fecha</th>
              <th style={{ width: 220 }}>Realizado por</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((r, idx) => {
              const { color } = metadatosTipo(r.tipo, r.origen);
              return (
                <tr key={`${r.origen}-${r.id}-${idx}`}>
                  <td>
                    <span className={claseBadgeHistorial(r.tipo, r.origen)} style={{ color }}>
                      {ICONOS_HISTORIAL[r.tipo] || null}
                      {etiquetaTipo(r.tipo)}
                    </span>
                  </td>
                  <td><Text size="sm" fw={500} style={{ color: '#0F0F0F' }}>{r.descripcion || '—'}</Text></td>
                  <td>
                    <Text size="sm" style={{ color: '#0F0F0F' }}>{formatearFecha(r.fecha)}</Text>
                    {r.hora && <div className="historial-detalle">{r.hora.slice(0, 5)}</div>}
                  </td>
                  <td><span className="historial-responsable">{r.responsable}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
});
ContenidoHistorial.displayName = 'ContenidoHistorial';

// ─────────────────────────────────────────────────────────────
// MODO DESAFILIAR
// ─────────────────────────────────────────────────────────────

const ContenidoDesafiliar = memo(({ afiliado, onConfirmar, onCerrar, loading }) => {
  const nombre = afiliado?.nombreCompleto || afiliado?.nombre || '';
  return (
    <Stack gap="xl" p="md" className="modal-desafiliar-contenido">
      <Paper p="md" withBorder className="modal-desafiliar-paper">
        <Group justify="space-between">
          <Box>
            <Text size="sm" className="modal-desafiliar-label">Afiliado</Text>
            <Text fw={700} size="xl" className="modal-desafiliar-nombre">{nombre}</Text>
            <Text size="sm" className="modal-desafiliar-ci" mt={4}>CI: {afiliado?.ci}</Text>
          </Box>
          <Badge size="lg" color="red" variant="filled" className="modal-desafiliar-badge">DESAFILIAR</Badge>
        </Group>
      </Paper>

      <Alert color="red" icon={<IconAlertTriangle size={20} />} title="Acción irreversible"
        className="modal-desafiliar-alerta">
        <Stack gap="xs">
          <Text size="sm" className="modal-desafiliar-alerta-texto">Vas a DESAFILIAR a este miembro. Esta acción:</Text>
          <ul className="modal-desafiliar-lista">
            <li><span className="modal-desafiliar-lista-destacado">TODOS sus puestos serán DESPOJADOS automáticamente</span></li>
            <li>Los puestos quedarán disponibles para otros afiliados</li>
            <li>Se registrará en el historial como DESPOJADO por deshabilitación</li>
            <li>El afiliado no podrá iniciar sesión ni realizar operaciones</li>
            <li><span className="modal-desafiliar-lista-destacado">Serás redirigido a la lista de afiliados</span></li>
          </ul>
        </Stack>
      </Alert>

      <Group justify="space-between" mt="xl" className="modal-desafiliar-botones">
        <Button variant="outline" onClick={onCerrar} disabled={loading}
          leftSection={<IconX size={16} />} className="modal-desafiliar-boton-cancelar">
          Cancelar
        </Button>
        <Button onClick={onConfirmar} loading={loading}
          leftSection={<IconUserOff size={16} />} className="modal-desafiliar-boton-confirmar">
          {loading ? 'Procesando...' : 'Sí, Desafiliar'}
        </Button>
      </Group>
    </Stack>
  );
});
ContenidoDesafiliar.displayName = 'ContenidoDesafiliar';

// ─────────────────────────────────────────────────────────────
// MODO CREAR
// ─────────────────────────────────────────────────────────────

const ContenidoCrear = memo(({ onAfiliadoCreado, onCerrar }) => {
  const { crear, loading } = useAfiliadoActions();
  const { preview, archivoSeleccionado, isDragging, fileInputRef,
          alEliminarFoto, alCambiarInputArchivo, reiniciarPreview, propsDragDrop } = useAfiliadoUI();

  const [activeTab,   setActiveTab]   = useState('datos');
  const [localError,  setLocalError]  = useState('');
  const [formData,    setFormData]    = useState({
    ci: '', extension: 'LP', nombre: '', paterno: '', materno: '',
    sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '',
  });
  const [puestosSeleccionados, setPuestosSeleccionados] = useState([]);
  const [puestosDisponibles,   setPuestosDisponibles]   = useState([]);
  const [puestosCargando,      setPuestosCargando]      = useState(false);
  const [pagina,               setPagina]               = useState(0);
  const [filtroFila,           setFiltroFila]           = useState('');
  const [filtroCuadra,         setFiltroCuadra]         = useState('');
  const [filtroNumero,         setFiltroNumero]         = useState('');
  const [errorPuestos,         setErrorPuestos]         = useState([]);

  useEffect(() => {
    setPuestosCargando(true);
    afiliadosApi.obtenerPuestosDisponibles()
      .then(setPuestosDisponibles)
      .catch(() => {})
      .finally(() => setPuestosCargando(false));
  }, []);

  const puestosFiltrados = useMemo(() => {
    return (puestosDisponibles || []).filter((p) => {
      if (filtroFila   && p.fila   !== filtroFila)                         return false;
      if (filtroCuadra && p.cuadra !== filtroCuadra)                       return false;
      if (filtroNumero && !p.nroPuesto.toString().includes(filtroNumero))  return false;
      return true;
    });
  }, [puestosDisponibles, filtroFila, filtroCuadra, filtroNumero]);

  const puestosPaginados = useMemo(() => {
    const start = pagina * ITEMS_PAGINA;
    return puestosFiltrados.slice(start, start + ITEMS_PAGINA);
  }, [puestosFiltrados, pagina]);

  const agregarPuesto = useCallback((puesto) => {
    setPuestosSeleccionados((prev) => {
      if (prev.some((p) => p.id_puesto === puesto.id_puesto)) return prev;
      return [...prev, { ...puesto, rubro: '', tiene_patente: false, id_temporal: `${Date.now()}-${Math.random()}` }];
    });
  }, []);

  const eliminarPuesto = useCallback((id) => {
    setPuestosSeleccionados((prev) => prev.filter((p) => p.id_temporal !== id));
  }, []);

  const actualizarPuesto = useCallback((id, campo, valor) => {
    setPuestosSeleccionados((prev) =>
      prev.map((p) => p.id_temporal === id ? { ...p, [campo]: valor } : p)
    );
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ ci: '', extension: 'LP', nombre: '', paterno: '', materno: '', sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '' });
    reiniciarPreview(null);
    setPuestosSeleccionados([]);
    setPagina(0);
    setActiveTab('datos');
    setLocalError('');
    setErrorPuestos([]);
    setFiltroFila('');
    setFiltroCuadra('');
    setFiltroNumero('');
  }, [reiniciarPreview]);

  const handleSubmit = async () => {
    if (!formData.ci || !formData.nombre || !formData.paterno) {
      setLocalError('CI, Nombre y Apellido Paterno son requeridos');
      setActiveTab('datos');
      return;
    }
    setLocalError('');
    const resultado = await crear({
      ...formData,
      foto:    archivoSeleccionado,
      puestos: puestosSeleccionados,
    });
    if (resultado.exito) {
      resetForm();
      onAfiliadoCreado?.();
      onCerrar();
    }
  };

  const handleClose = () => { resetForm(); onCerrar(); };

  return (
    <Stack gap="md" p="md">
      {localError && (
        <Alert color="red" icon={<IconAlertTriangle size={16} />}>{localError}</Alert>
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="datos">Datos personales</Tabs.Tab>
          <Tabs.Tab value="puestos">Puestos ({puestosSeleccionados.length})</Tabs.Tab>
        </Tabs.List>

        {/* ── Datos ── */}
        <Tabs.Panel value="datos" pt="md">
          {/* Layout horizontal: campos izquierda / foto derecha */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* Columna izquierda — campos del formulario */}
            <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
              <Group grow>
                <TextInput label="CI *" value={formData.ci}
                  onChange={(e) => setFormData((p) => ({ ...p, ci: e.target.value }))} />
                <Select label="Extensión" value={formData.extension}
                  onChange={(v) => setFormData((p) => ({ ...p, extension: v }))}
                  data={EXTENSIONES} />
              </Group>
              <TextInput label="Nombre *" value={formData.nombre}
                onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))} />
              <Group grow>
                <TextInput label="Paterno *" value={formData.paterno}
                  onChange={(e) => setFormData((p) => ({ ...p, paterno: e.target.value }))} />
                <TextInput label="Materno" value={formData.materno}
                  onChange={(e) => setFormData((p) => ({ ...p, materno: e.target.value }))} />
              </Group>
              <Group grow>
                <Select label="Sexo" value={formData.sexo}
                  onChange={(v) => setFormData((p) => ({ ...p, sexo: v }))} data={SEXOS} />
                <TextInput label="Fecha nacimiento" type="date" value={formData.fecNac}
                  onChange={(e) => setFormData((p) => ({ ...p, fecNac: e.target.value }))} />
              </Group>
              <TextInput label="Teléfono" value={formData.telefono}
                onChange={(e) => setFormData((p) => ({ ...p, telefono: e.target.value }))} />
              <TextInput label="Ocupación" value={formData.ocupacion}
                onChange={(e) => setFormData((p) => ({ ...p, ocupacion: e.target.value }))} />
              <TextInput label="Dirección" value={formData.direccion}
                onChange={(e) => setFormData((p) => ({ ...p, direccion: e.target.value }))} />
            </Stack>

            {/* Columna derecha — foto de perfil */}
            <div style={{
              width: '200px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              paddingTop: '4px',
            }}>
              <Box style={{ width: '100%' }}>
                <Text size="sm" fw={600} mb={8} style={{ textAlign: 'center' }}>
                  Foto de perfil
                </Text>

                {/* Zona de drop / preview */}
                <div
                  {...propsDragDrop}
                  style={{
                    width: '160px',
                    height: '160px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    border: isDragging ? '2px dashed #0f0f0f' : '2px dashed #C4C4C4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    backgroundColor: '#F6F9FF',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Stack align="center" gap={6} style={{ padding: '16px', textAlign: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
                        fill="none" stroke="#C4C4C4" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <Text size="xs" c="dimmed">Arrastra o haz clic</Text>
                    </Stack>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => alCambiarInputArchivo(e, setLocalError)}
                />

                {preview && (
                  <Button
                    variant="subtle"
                    size="xs"
                    mt={8}
                    leftSection={<IconTrash size={12} />}
                    onClick={alEliminarFoto}
                    style={{ display: 'block', margin: '8px auto 0' }}
                  >
                    Quitar foto
                  </Button>
                )}
              </Box>
            </div>
          </div>
        </Tabs.Panel>

        {/* ── Puestos ── */}
        <Tabs.Panel value="puestos" pt="md">
          <Stack gap="sm">
            {/* Seleccionados */}
            {puestosSeleccionados.length > 0 && (
              <Box>
                <Text size="sm" fw={600} mb={6}>Puestos seleccionados</Text>
                <Stack gap={6}>
                  {puestosSeleccionados.map((p) => (
                    <Paper key={p.id_temporal} p="xs" withBorder>
                      <Group justify="space-between" align="center" wrap="nowrap">
                        <Group gap="xs" wrap="wrap">
                          <Badge color="dark" size="md" variant="filled">{p.nroPuesto}-{p.fila}-{p.cuadra}</Badge>
                          <TextInput placeholder="Rubro" size="xs" value={p.rubro || ''}
                            onChange={(e) => actualizarPuesto(p.id_temporal, 'rubro', e.target.value)} />
                          <Checkbox label="Patente" size="xs" checked={p.tiene_patente || false}
                            onChange={(e) => actualizarPuesto(p.id_temporal, 'tiene_patente', e.currentTarget.checked)} />
                        </Group>
                        <ActionIcon color="red" variant="subtle" onClick={() => eliminarPuesto(p.id_temporal)} size="sm">
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Filtros */}
            <Group gap="xs">
              <Select size="xs" placeholder="Fila" data={FILAS} value={filtroFila}
                onChange={(v) => { setFiltroFila(v || ''); setPagina(0); }} style={{ width: 110 }} />
              <Select size="xs" placeholder="Cuadra" data={CUADRAS} value={filtroCuadra}
                onChange={(v) => { setFiltroCuadra(v || ''); setPagina(0); }} style={{ width: 130 }} />
              <TextInput size="xs" placeholder="N° puesto" value={filtroNumero}
                onChange={(e) => { setFiltroNumero(e.target.value); setPagina(0); }} style={{ width: 100 }} />
            </Group>

            {/* Grid de disponibles */}
            {puestosCargando
              ? <Center py="md"><Loader size="sm" /></Center>
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                  {puestosPaginados.map((p) => {
                    const yaSeleccionado = puestosSeleccionados.some((s) => s.id_puesto === p.id_puesto);
                    return (
                      <Paper key={p.id_puesto} p={6} withBorder
                        className={yaSeleccionado ? 'puesto-disponible seleccionado' : 'puesto-disponible'}
                        onClick={() => !yaSeleccionado && agregarPuesto(p)}
                        style={{ cursor: yaSeleccionado ? 'default' : 'pointer', textAlign: 'center' }}>
                        <Badge color="dark" size="sm" variant="filled">{p.nroPuesto}</Badge>
                        <Text size="xs" fw={600}>Fila {p.fila}</Text>
                        <Text size="10px" c="dimmed">{p.cuadra}</Text>
                      </Paper>
                    );
                  })}
                </div>
              )
            }

            {/* Paginación */}
            {puestosFiltrados.length > ITEMS_PAGINA && (
              <Pagination
                total={Math.ceil(puestosFiltrados.length / ITEMS_PAGINA)}
                value={pagina + 1}
                onChange={(p) => setPagina(p - 1)}
                size="xs" color="dark" />
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={handleClose}>Cancelar</Button>
        <Button loading={loading} onClick={handleSubmit} className="af-btn-primario">
          {loading ? 'Guardando...' : 'Crear Afiliado'}
        </Button>
      </Group>
    </Stack>
  );
});
ContenidoCrear.displayName = 'ContenidoCrear';

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL — AfiliadoModal
// ─────────────────────────────────────────────────────────────

/**
 * Modal unificado para acciones sobre el afiliado.
 *
 * opened           - Controla visibilidad
 * onClose          - Callback al cerrar
 * mode             - 'crear' | 'desafiliar' | 'historial'
 * data             - Payload dependiente del mode:
 *                    crear      → null
 *                    desafiliar → { afiliado }
 *                    historial  → { afiliado, historial, cargando, error }
 * onAfiliadoCreado - Callback tras crear exitosamente
 * onDesafiliar     - Callback(id) al confirmar desafiliación
 * loadingDesafiliar- Estado de loading externo para desafiliar
 */
const AfiliadoModal = memo(({
  opened,
  onClose,
  mode,
  data = {},
  onAfiliadoCreado,
  onDesafiliar,
  loadingDesafiliar = false,
}) => {
  const titulos = {
    crear:      'Añadir Afiliado',
    desafiliar: (
      <Group align="center" gap="xs">
        <IconAlertTriangle size={24} color="#F44336" />
        <Text fw={700} size="xl">Desafiliar Afiliado</Text>
      </Group>
    ),
    historial: (
      <div className="historial-header-row">
        <h2 className="historial-titulo">HISTORIAL DEL AFILIADO</h2>
        <hr className="historial-title-underline" />
      </div>
    ),
  };

  const tamanos = { crear: 'xl', desafiliar: 'lg', historial: '80%' };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={titulos[mode] || ''}
      size={tamanos[mode] || 'lg'}
      centered
      classNames={mode === 'desafiliar' ? { header: 'modal-desafiliar-header', body: 'modal-desafiliar-body' } : {}}
      styles={mode === 'historial' ? {
        header: { paddingBottom: 0, borderBottom: 'none' },
        body:   { paddingTop: '8px' },
      } : {}}
    >
      {mode === 'crear' && (
        <ContenidoCrear onAfiliadoCreado={onAfiliadoCreado} onCerrar={onClose} />
      )}

      {mode === 'desafiliar' && (
        <ContenidoDesafiliar
          afiliado={data.afiliado}
          onConfirmar={() => onDesafiliar?.(data.afiliado?.id)}
          onCerrar={onClose}
          loading={loadingDesafiliar}
        />
      )}

      {mode === 'historial' && (
        <ContenidoHistorial
          historial={data.historial  || []}
          cargando={data.cargando    || false}
          error={data.error          || null}
        />
      )}
    </Modal>
  );
});

AfiliadoModal.displayName = 'AfiliadoModal';
export default AfiliadoModal;