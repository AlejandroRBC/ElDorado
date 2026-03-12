// frontend/src/modules/Afiliados/components/ModalAfiliado.jsx

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Modal, Box, Group, Stack, Text, Button, TextInput, Select, Checkbox,
  Paper, SimpleGrid, ScrollArea, Badge, ActionIcon, Alert, Tabs,
  Loader, Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPhoto, IconX, IconUser, IconId, IconPhone, IconMapPin, IconCalendar,
  IconTrash, IconMapPinFilled,
} from '@tabler/icons-react';
import { useCrearAfiliado }      from '../hooks/useCrearAfiliado';
import { useAsignarPuesto }      from '../hooks/useAsignarPuesto';
import { useVistaPreviewImagen } from '../hooks/useVistaPreviewImagen';

// ── Opciones estáticas — fuera del componente ──────────────────
const DEPARTAMENTOS = [
  { value: 'LP', label: 'La Paz' },    { value: 'CB', label: 'Cochabamba' },
  { value: 'SC', label: 'Santa Cruz' }, { value: 'OR', label: 'Oruro' },
  { value: 'PT', label: 'Potosí' },    { value: 'TJ', label: 'Tarija' },
  { value: 'CH', label: 'Chuquisaca' }, { value: 'BE', label: 'Beni' },
  { value: 'PD', label: 'Pando' },
];

const SEXOS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
];

// ── Sub-componentes memoizados ─────────────────────────────────

const PuestoItem = memo(({ puesto, onUpdate, onRemove }) => {
  const handleRubroChange   = useCallback((e) => onUpdate(puesto.id_temporal, 'rubro',         e.target.value),   [puesto.id_temporal, onUpdate]);
  const handlePatenteChange = useCallback((e) => onUpdate(puesto.id_temporal, 'tiene_patente', e.target.checked), [puesto.id_temporal, onUpdate]);
  const handleRemove        = useCallback(()  => onRemove(puesto.id_temporal),                                    [puesto.id_temporal, onRemove]);

  return (
    <Paper p="xs" withBorder style={{ backgroundColor: '#fafafa' }}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="xs" wrap="wrap">
          <Badge color="dark" size="md" variant="filled" style={{ minWidth: '90px' }}>
            {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
          </Badge>
          <TextInput placeholder="Rubro del puesto" size="xs" value={puesto.rubro || ''} onChange={handleRubroChange} style={{ width: '180px' }} />
          <Checkbox label="Patente" size="xs" checked={puesto.tiene_patente || false} onChange={handlePatenteChange} />
        </Group>
        <ActionIcon color="red" variant="subtle" onClick={handleRemove} size="sm" aria-label="Eliminar puesto">
          <IconTrash size={14} />
        </ActionIcon>
      </Group>
    </Paper>
  );
});

const PuestoDisponible = memo(({ puesto, yaSeleccionado, onAgregar }) => {
  const handleClick = useCallback(() => { if (!yaSeleccionado) onAgregar(puesto); }, [puesto, yaSeleccionado, onAgregar]);

  return (
    <Paper
      p={6} withBorder
      style={{
        cursor: yaSeleccionado ? 'not-allowed' : 'pointer',
        opacity: yaSeleccionado ? 0.5 : 1,
        backgroundColor: yaSeleccionado ? '#f5f5f5' : 'white',
        border: yaSeleccionado ? '1px solid #ccc' : '1px solid #e0e0e0',
      }}
      onClick={handleClick}
    >
      <Stack gap={2} align="center">
        <Badge color="dark" size="sm" variant="filled">{puesto.nroPuesto}</Badge>
        <Text size="xs" fw={600}>Fila {puesto.fila}</Text>
        <Text size="10px" c="dimmed" lineClamp={1}>{puesto.cuadra}</Text>
      </Stack>
    </Paper>
  );
});

// ── Componente principal ───────────────────────────────────────

const ModalAfiliado = ({ opened, onClose, onAfiliadoCreado }) => {
  const { crearAfiliadoCompleto, loading, reset } = useCrearAfiliado();
  const { puestosDisponibles, puestosCargando, cargarPuestosDisponibles } = useAsignarPuesto(null);

  const [activeTab,  setActiveTab]  = useState('datos');
  const [localError, setLocalError] = useState('');

  // ── Datos del afiliado (sin foto — la gestiona el hook) ────
  const [formData, setFormData] = useState({
    ci: '', extension: 'LP', nombre: '', paterno: '', materno: '',
    sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '',
  });

  // ── Hook de preview ────────────────────────────────────────
  // El error de tamaño usa `setLocalError` igual que el resto de
  // validaciones del modal (no notifications, para mantener coherencia).
  const {
    preview,
    archivoSeleccionado,
    isDragging,
    fileInputRef,
    alEliminarFoto,
    alCambiarInputArchivo,
    reiniciar,
    propsDragDrop,
  } = useVistaPreviewImagen({
    alReportarError: (msg) => setLocalError(msg),
  });

  // ── Puestos a asignar ──────────────────────────────────────
  const [puestosSeleccionados,   setPuestosSeleccionados]   = useState([]);
  const [paginaActual,           setPaginaActual]           = useState(0);
  const [errorPuestosOcupados,   setErrorPuestosOcupados]   = useState([]);
  const [notificacionEnviada,    setNotificacionEnviada]    = useState(false);
  const [filtroFila,             setFiltroFila]             = useState('');
  const [filtroCuadra,           setFiltroCuadra]           = useState('');
  const [filtroNumero,           setFiltroNumero]           = useState('');

  const ITEMS_POR_PAGINA = 30;

  useEffect(() => {
    if (opened) {
      resetForm();
      cargarPuestosDisponibles();
      setNotificacionEnviada(false);
      setErrorPuestosOcupados([]);
    }
  }, [opened]);

  // ── Filtros y paginación ───────────────────────────────────
  const puestosFiltrados = useMemo(() => {
    if (!puestosDisponibles?.length) return [];
    return puestosDisponibles.filter((p) => {
      if (filtroFila   && p.fila   !== filtroFila)                                return false;
      if (filtroCuadra && p.cuadra !== filtroCuadra)                              return false;
      if (filtroNumero && !p.nroPuesto.toString().includes(filtroNumero)) return false;
      return true;
    });
  }, [puestosDisponibles, filtroFila, filtroCuadra, filtroNumero]);

  const puestosPaginados = useMemo(() => {
    const start = paginaActual * ITEMS_POR_PAGINA;
    return puestosFiltrados.slice(start, start + ITEMS_POR_PAGINA);
  }, [puestosFiltrados, paginaActual]);

  // ── Handlers de puestos ────────────────────────────────────
  const agregarPuesto = useCallback((puesto) => {
    setPuestosSeleccionados((prev) => {
      if (prev.some((p) => p.id_puesto === puesto.id_puesto)) {
        notifications.show({ title: '⚠️ Puesto duplicado', message: `${puesto.nroPuesto}-${puesto.fila}-${puesto.cuadra} ya está en la lista`, color: 'yellow', autoClose: 2000 });
        return prev;
      }
      return [...prev, { ...puesto, rubro: '', tiene_patente: false, id_temporal: `${Date.now()}-${Math.random()}` }];
    });
  }, []);

  const eliminarPuesto   = useCallback((id) => setPuestosSeleccionados((prev) => prev.filter((p) => p.id_temporal !== id)), []);
  const actualizarPuesto = useCallback((id, campo, valor) => setPuestosSeleccionados((prev) => prev.map((p) => p.id_temporal === id ? { ...p, [campo]: valor } : p)), []);

  // ── Reset completo del formulario ──────────────────────────
  const resetForm = useCallback(() => {
    setFormData({ ci: '', extension: 'LP', nombre: '', paterno: '', materno: '', sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '' });
    reiniciar(null); // limpia preview y revoca blob si hay uno
    setPuestosSeleccionados([]);
    setPaginaActual(0);
    setActiveTab('datos');
    setLocalError('');
    setNotificacionEnviada(false);
    setErrorPuestosOcupados([]);
    setFiltroFila(''); setFiltroCuadra(''); setFiltroNumero('');
    reset();
  }, [reiniciar, reset]);

  // ── Validación ─────────────────────────────────────────────
  const validarFormulario = useCallback(() => {
    if (!formData.ci?.trim())      return 'El CI es requerido';
    if (!formData.nombre?.trim())  return 'El nombre es requerido';
    if (!formData.paterno?.trim()) return 'El apellido paterno es requerido';
    return null;
  }, [formData]);

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errorValidacion = validarFormulario();
    if (errorValidacion) { setLocalError(errorValidacion); setActiveTab('datos'); return; }

    const resultado = await crearAfiliadoCompleto({
      ...formData,
      foto:    archivoSeleccionado, // File | null
      puestos: puestosSeleccionados,
    });

    if (resultado.exito) {
      if (resultado.puestosFallidos?.length > 0) {
        setErrorPuestosOcupados(resultado.puestosFallidos);
        setPuestosSeleccionados((prev) => prev.filter((p) => !resultado.puestosFallidos.includes(p.id_puesto)));
        notifications.show({ title: '⚠️ Advertencia', message: `Afiliado creado pero ${resultado.puestosFallidos.length} puesto(s) no pudieron asignarse (ya estaban ocupados)`, color: 'yellow', autoClose: 5000 });
      } else {
        if (!notificacionEnviada) {
          setNotificacionEnviada(true);
          notifications.show({
            title: '✅ Éxito',
            message: puestosSeleccionados.length > 0
              ? `Afiliado creado con ${puestosSeleccionados.length} puesto${puestosSeleccionados.length !== 1 ? 's' : ''}`
              : 'Afiliado creado exitosamente (sin puestos)',
            color: 'green', autoClose: 3000,
          });
        }
        setTimeout(() => { resetForm(); onClose(); if (onAfiliadoCreado) onAfiliadoCreado(); }, 1500);
      }
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <Modal
      opened={opened}
      onClose={() => { resetForm(); onClose(); }}
      size="90%"
      title={<Group align="center" gap="xs"><IconUser size={24} color="#edbe3c" /><Text fw={700} size="xl">NUEVO AFILIADO</Text></Group>}
      centered
      styles={{
        header: { padding: '15px 20px', borderBottom: '2px solid #edbe3c', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100 },
        body:   { padding: 0, height: 'calc(90vh - 80px)', overflow: 'hidden' },
      }}
    >
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        <Tabs value={activeTab} onChange={setActiveTab} style={{ flexShrink: 0 }}>
          <Tabs.List style={{ padding: '0 20px', backgroundColor: '#fafafa' }}>
            <Tabs.Tab value="datos"   leftSection={<IconUser size={16} />}>Datos Personales</Tabs.Tab>
            <Tabs.Tab value="puestos" leftSection={<IconMapPinFilled size={16} />}>
              Puestos {puestosSeleccionados.length > 0 ? `(${puestosSeleccionados.length})` : ''}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <ScrollArea style={{ flex: 1, padding: '20px' }} scrollbarSize={8}>

          {localError && (
            <Alert icon={<IconX size={16} />} title="Error" color="red" mb="md" withCloseButton onClose={() => setLocalError('')}>
              {localError}
            </Alert>
          )}

          {errorPuestosOcupados.length > 0 && (
            <Alert icon={<IconX size={16} />} title="Puestos no disponibles" color="yellow" mb="md" withCloseButton onClose={() => setErrorPuestosOcupados([])}>
              <Stack gap="xs">
                <Text size="sm">Los siguientes puestos ya estaban ocupados y no se asignaron:</Text>
                <Group gap="xs">
                  {errorPuestosOcupados.map((id, idx) => {
                    const p = puestosSeleccionados.find((p) => p.id_puesto === id);
                    return p && <Badge key={idx} color="red" variant="outline">{p.nroPuesto}-{p.fila}-{p.cuadra}</Badge>;
                  })}
                </Group>
              </Stack>
            </Alert>
          )}

          {/* ── TAB 1: DATOS PERSONALES ──────────────────────── */}
          {activeTab === 'datos' && (
            <Stack gap="xl">
              <Paper p="lg" withBorder radius="md">
                <Group align="flex-start" gap="xl" wrap="nowrap">

                  {/* Zona de foto */}
                  <Box style={{ width: '160px', flexShrink: 0 }}>
                    <Text fw={600} size="sm" mb="xs">Foto de Perfil</Text>
                    <Box
                      {...propsDragDrop}
                      style={{
                        width: '160px', height: '160px',
                        borderRadius: '10px', overflow: 'hidden', position: 'relative',
                        border:          isDragging ? '2px solid #4CAF50' : preview ? '2px solid #ddd' : '2px dashed #ddd',
                        backgroundColor: isDragging ? '#f0fff0' : '#f9f9f9',
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <input type="file" ref={fileInputRef} accept="image/*" onChange={alCambiarInputArchivo} style={{ display: 'none' }} />

                      {preview ? (
                        <>
                          <img src={preview} alt="Vista previa de foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <ActionIcon
                            size="sm" aria-label="Eliminar foto"
                            style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', zIndex: 10 }}
                            onClick={(e) => { e.stopPropagation(); alEliminarFoto(); }}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        </>
                      ) : (
                        <Stack align="center" gap="xs" style={{ padding: '10px' }}>
                          <IconPhoto size={40} style={{ color: isDragging ? '#4CAF50' : '#999' }} />
                          <Text size="xs" ta="center" style={{ color: isDragging ? '#4CAF50' : '#666' }}>
                            {isDragging ? 'Suelta la imagen' : 'Haz clic o arrastra'}
                          </Text>
                        </Stack>
                      )}
                    </Box>
                    <Text size="xs" c="dimmed" mt={5} ta="center">JPG, PNG, GIF • Máx 5MB</Text>
                  </Box>

                  {/* Campos personales */}
                  <Box style={{ flex: 1 }}>
                    <Text fw={700} size="lg" mb="md">Información Personal</Text>
                    <SimpleGrid cols={2} spacing="md">
                      <TextInput label="CI *" placeholder="1234567" value={formData.ci} onChange={(e) => setFormData({ ...formData, ci: e.target.value })} leftSection={<IconId size={16} />} required />
                      <Select label="Expedido *" data={DEPARTAMENTOS} value={formData.extension} onChange={(v) => setFormData({ ...formData, extension: v })} />
                      <TextInput label="Nombre *" placeholder="Juan" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} leftSection={<IconUser size={16} />} required />
                      <TextInput label="Paterno *" placeholder="Pérez" value={formData.paterno} onChange={(e) => setFormData({ ...formData, paterno: e.target.value })} required />
                      <TextInput label="Materno" placeholder="García" value={formData.materno} onChange={(e) => setFormData({ ...formData, materno: e.target.value })} />
                      <Select label="Sexo" data={SEXOS} value={formData.sexo} onChange={(v) => setFormData({ ...formData, sexo: v })} />
                      <TextInput label="Fecha Nacimiento" type="date" value={formData.fecNac} onChange={(e) => setFormData({ ...formData, fecNac: e.target.value })} leftSection={<IconCalendar size={16} />} />
                      <TextInput label="Teléfono *" placeholder="76543210" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} leftSection={<IconPhone size={16} />} />
                      <TextInput label="Ocupación" placeholder="Comerciante" value={formData.ocupacion} onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })} />
                      <TextInput label="Dirección" placeholder="Av. Principal #123" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} leftSection={<IconMapPin size={16} />} style={{ gridColumn: 'span 2' }} />
                    </SimpleGrid>
                  </Box>
                </Group>
              </Paper>

              <Group justify="flex-end" mt="xl">
                <Button variant="outline" onClick={() => { resetForm(); onClose(); }} style={{ borderColor: '#0f0f0f', color: '#0f0f0f', borderRadius: '100px', padding: '0 30px', height: '45px' }}>Cancelar</Button>
                <Button variant="outline" onClick={() => setActiveTab('puestos')} style={{ borderColor: '#0f0f0f', color: '#0f0f0f', borderRadius: '100px', padding: '0 30px', height: '45px' }}>
                  {puestosSeleccionados.length > 0 ? `Ver Puestos (${puestosSeleccionados.length})` : 'Agregar Puestos'}
                </Button>
                <Button onClick={handleSubmit} loading={loading} style={{ backgroundColor: '#edbe3c', color: '#0f0f0f', borderRadius: '100px', padding: '0 30px', height: '45px', fontWeight: 600 }}>
                  {loading ? 'Creando...' : 'Crear Afiliado'}
                </Button>
              </Group>
            </Stack>
          )}

          {/* ── TAB 2: SELECCIÓN DE PUESTOS ──────────────────── */}
          {activeTab === 'puestos' && (
            <Stack gap="md">

              {puestosSeleccionados.length > 0 && (
                <Paper p="md" withBorder radius="md">
                  <Group justify="space-between" mb="md">
                    <Text fw={700} size="md">Puestos Seleccionados ({puestosSeleccionados.length})</Text>
                    <Badge color="yellow" variant="filled">{puestosSeleccionados.length} puesto{puestosSeleccionados.length !== 1 ? 's' : ''}</Badge>
                  </Group>
                  <Divider mb="md" />
                  <ScrollArea style={{ height: '200px' }} scrollbarSize={6}>
                    <Stack gap="xs">
                      {puestosSeleccionados.map((p) => (
                        <PuestoItem key={p.id_temporal} puesto={p} onUpdate={actualizarPuesto} onRemove={eliminarPuesto} />
                      ))}
                    </Stack>
                  </ScrollArea>
                </Paper>
              )}

              <Paper p="md" withBorder radius="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={700} size="md">Agregar Puestos</Text>
                    <Badge color="green" variant="light">{puestosFiltrados.length} disponibles</Badge>
                  </Group>

                  <Group grow gap="xs">
                    <Select placeholder="Fila" data={[{ value: '', label: 'Todas las filas' }, { value: 'A', label: 'Fila A' }, { value: 'B', label: 'Fila B' }]}
                      value={filtroFila} onChange={(v) => { setFiltroFila(v); setPaginaActual(0); }} clearable size="sm"
                      styles={{ input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' } }} />
                    <Select placeholder="Cuadra" data={[{ value: '', label: 'Todas las cuadras' }, { value: 'Cuadra 1', label: 'Cuadra 1' }, { value: 'Cuadra 2', label: 'Cuadra 2' }, { value: 'Cuadra 3', label: 'Cuadra 3' }, { value: 'Cuadra 4', label: 'Cuadra 4' }, { value: 'Callejón', label: 'Callejón' }]}
                      value={filtroCuadra} onChange={(v) => { setFiltroCuadra(v); setPaginaActual(0); }} clearable size="sm"
                      styles={{ input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' } }} />
                    <TextInput placeholder="N° puesto" value={filtroNumero} onChange={(e) => { setFiltroNumero(e.target.value); setPaginaActual(0); }} size="sm"
                      styles={{ input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' } }} />
                  </Group>

                  {(filtroFila || filtroCuadra || filtroNumero) && (
                    <Group justify="flex-end">
                      <Button size="xs" variant="subtle" leftSection={<IconX size={12} />}
                        onClick={() => { setFiltroFila(''); setFiltroCuadra(''); setFiltroNumero(''); setPaginaActual(0); }}>
                        Limpiar filtros
                      </Button>
                    </Group>
                  )}

                  {puestosCargando ? (
                    <Stack align="center" py="xl"><Loader /><Text size="sm" c="dimmed">Cargando puestos disponibles...</Text></Stack>
                  ) : (
                    <>
                      {puestosFiltrados.length > ITEMS_POR_PAGINA && (
                        <Group justify="flex-end" gap="xs">
                          <Button size="xs" variant="subtle" disabled={paginaActual === 0} onClick={() => setPaginaActual((p) => Math.max(0, p - 1))}>← Anterior</Button>
                          <Text size="sm" fw={500}>{paginaActual * ITEMS_POR_PAGINA + 1}–{Math.min((paginaActual + 1) * ITEMS_POR_PAGINA, puestosFiltrados.length)}</Text>
                          <Button size="xs" variant="subtle" disabled={(paginaActual + 1) * ITEMS_POR_PAGINA >= puestosFiltrados.length} onClick={() => setPaginaActual((p) => p + 1)}>Siguiente →</Button>
                        </Group>
                      )}
                      <ScrollArea style={{ height: '300px' }} scrollbarSize={6}>
                        <SimpleGrid cols={4} spacing="xs">
                          {puestosPaginados.map((p) => (
                            <PuestoDisponible key={p.id_puesto} puesto={p} yaSeleccionado={puestosSeleccionados.some((s) => s.id_puesto === p.id_puesto)} onAgregar={agregarPuesto} />
                          ))}
                        </SimpleGrid>
                      </ScrollArea>
                    </>
                  )}
                </Stack>
              </Paper>

              <Group justify="space-between" mt="xl">
                <Button variant="subtle" onClick={() => setActiveTab('datos')} leftSection={<IconX size={16} />}>Volver a Datos</Button>
                <Group>
                  <Button variant="outline" onClick={() => { resetForm(); onClose(); }} style={{ borderColor: '#0f0f0f', color: '#0f0f0f', borderRadius: '100px', padding: '0 25px', height: '45px' }}>Cancelar</Button>
                  <Button onClick={handleSubmit} loading={loading} style={{ backgroundColor: '#edbe3c', color: '#0f0f0f', borderRadius: '100px', padding: '0 25px', height: '45px', fontWeight: 600, minWidth: '200px' }}>
                    {loading ? 'Creando...' : `Crear Afiliado${puestosSeleccionados.length > 0 ? ` (${puestosSeleccionados.length})` : ''}`}
                  </Button>
                </Group>
              </Group>
            </Stack>
          )}

        </ScrollArea>
      </Box>
    </Modal>
  );
};

export default ModalAfiliado;