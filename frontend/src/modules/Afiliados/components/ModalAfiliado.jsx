import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Modal, Box, Group, Stack, Text, Button, TextInput, Select, Checkbox, Paper, SimpleGrid, ScrollArea, Badge, ActionIcon, Alert, Tabs, CloseButton, Loader, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconPhoto, IconX, IconUser, IconId, IconPhone, IconMapPin, IconCalendar, IconTrash, IconMapPinFilled, IconSearch } from '@tabler/icons-react';
import { useCrearAfiliado } from '../hooks/useCrearAfiliado';
import { useAsignarPuesto } from '../hooks/useAsignarPuesto';

// ============ COMPONENTE PUESTO ITEM - MEMOIZADO ============
const PuestoItem = memo(({ puesto, onUpdate, onRemove }) => {
  const handleRubroChange = useCallback((e) => {
    onUpdate(puesto.id_temporal, 'rubro', e.target.value);
  }, [puesto.id_temporal, onUpdate]);

  const handlePatenteChange = useCallback((e) => {
    onUpdate(puesto.id_temporal, 'tiene_patente', e.target.checked);
  }, [puesto.id_temporal, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(puesto.id_temporal);
  }, [puesto.id_temporal, onRemove]);

  return (
    <Paper p="xs" withBorder style={{ backgroundColor: '#fafafa' }}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="xs" wrap="wrap">
          <Badge color="dark" size="md" variant="filled" style={{ minWidth: '90px' }}>
            {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
          </Badge>
          <TextInput
            placeholder="Rubro del puesto"
            size="xs"
            value={puesto.rubro || ''}
            onChange={handleRubroChange}
            style={{ width: '180px' }}
          />
          <Checkbox
            label="Patente"
            size="xs"
            checked={puesto.tiene_patente || false}
            onChange={handlePatenteChange}
          />
        </Group>
        <ActionIcon color="red" variant="subtle" onClick={handleRemove} size="sm">
          <IconTrash size={14} />
        </ActionIcon>
      </Group>
    </Paper>
  );
});

// ============ COMPONENTE PUESTO DISPONIBLE - MEMOIZADO ============
const PuestoDisponible = memo(({ puesto, yaSeleccionado, onAgregar }) => {
  const handleClick = useCallback(() => {
    if (!yaSeleccionado) {
      onAgregar(puesto);
    }
  }, [puesto, yaSeleccionado, onAgregar]);

  return (
    <Paper
      p={6}
      withBorder
      style={{
        cursor: yaSeleccionado ? 'not-allowed' : 'pointer',
        opacity: yaSeleccionado ? 0.5 : 1,
        backgroundColor: yaSeleccionado ? '#f5f5f5' : 'white',
        border: yaSeleccionado ? '1px solid #ccc' : '1px solid #e0e0e0',
      }}
      onClick={handleClick}
    >
      <Stack gap={2} align="center">
        <Badge color="dark" size="sm" variant="filled">
          {puesto.nroPuesto}
        </Badge>
        <Text size="xs" fw={600}>Fila {puesto.fila}</Text>
        <Text size="10px" c="dimmed" lineClamp={1}>{puesto.cuadra}</Text>
      </Stack>
    </Paper>
  );
});

// ============ COMPONENTE PRINCIPAL ============
const ModalAfiliado = ({ opened, onClose, onAfiliadoCreado }) => {
  const { crearAfiliadoCompleto, loading, reset } = useCrearAfiliado();
  const { puestosDisponibles, puestosCargando, cargarPuestosDisponibles } = useAsignarPuesto(null);
  
  const [activeTab, setActiveTab] = useState('datos');
  const [localError, setLocalError] = useState('');
  
  // ============ DATOS DEL AFILIADO ============
  const [formData, setFormData] = useState({
    ci: '', extension: 'LP', nombre: '', paterno: '', materno: '',
    sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '',
    foto: null, fotoPreview: null
  });

  // ============ PUESTOS A ASIGNAR ============
  const [puestosSeleccionados, setPuestosSeleccionados] = useState([]);
  const [busquedaPuestos, setBusquedaPuestos] = useState('');
  const [paginaActual, setPaginaActual] = useState(0);
  
  const ITEMS_POR_PAGINA = 30;
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false);

  const departamentos = [
    { value: 'LP', label: 'La Paz' }, { value: 'CB', label: 'Cochabamba' },
    { value: 'SC', label: 'Santa Cruz' }, { value: 'OR', label: 'Oruro' },
    { value: 'PT', label: 'Potosí' }, { value: 'TJ', label: 'Tarija' },
    { value: 'CH', label: 'Chuquisaca' }, { value: 'BE', label: 'Beni' },
    { value: 'PD', label: 'Pando' }
  ];

  const sexos = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' }
  ];

  // ============ CARGAR PUESTOS DISPONIBLES ============
  useEffect(() => {
    if (opened) {
      cargarPuestosDisponibles();
      resetForm();
      setNotificacionEnviada(false);
    }
  }, [opened]);

  // ============ FILTRAR PUESTOS DISPONIBLES ============
  const puestosFiltrados = useMemo(() => {
    if (!puestosDisponibles?.length) return [];
    if (!busquedaPuestos) return puestosDisponibles.slice(0, 200);
    
    const search = busquedaPuestos.toLowerCase().trim();
    return puestosDisponibles.filter(puesto => 
      puesto.nroPuesto.toString().includes(search) ||
      puesto.fila.toLowerCase().includes(search) ||
      puesto.cuadra.toLowerCase().includes(search)
    ).slice(0, 200);
  }, [puestosDisponibles, busquedaPuestos]);

  // ============ PUESTOS PAGINADOS ============
  const puestosPaginados = useMemo(() => {
    const start = paginaActual * ITEMS_POR_PAGINA;
    return puestosFiltrados.slice(start, start + ITEMS_POR_PAGINA);
  }, [puestosFiltrados, paginaActual]);

  // ============ AGREGAR PUESTO ============
  const agregarPuesto = useCallback((puesto) => {
    setPuestosSeleccionados(prev => {
      if (prev.some(p => p.id_puesto === puesto.id_puesto)) {
        return prev;
      }
      return [
        ...prev,
        {
          ...puesto,
          rubro: '',
          tiene_patente: false,
          id_temporal: `${Date.now()}-${Math.random()}`
        }
      ];
    });
  }, []);

  // ============ ELIMINAR PUESTO ============
  const eliminarPuesto = useCallback((idTemporal) => {
    setPuestosSeleccionados(prev => prev.filter(p => p.id_temporal !== idTemporal));
  }, []);

  // ============ ACTUALIZAR PUESTO ============
  const actualizarPuesto = useCallback((idTemporal, campo, valor) => {
    setPuestosSeleccionados(prev => 
      prev.map(p => p.id_temporal === idTemporal ? { ...p, [campo]: valor } : p)
    );
  }, []);

  // ============ FUNCIONES PARA FOTO ============
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    }
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('La imagen es demasiado grande (máximo 5MB)');
      return;
    }
    
    if (formData.fotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(formData.fotoPreview);
    }
    
    setFormData(prev => ({
      ...prev,
      foto: file,
      fotoPreview: URL.createObjectURL(file)
    }));
    setLocalError('');
  }, [formData.fotoPreview]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removePhoto = useCallback(() => {
    if (formData.fotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(formData.fotoPreview);
    }
    setFormData(prev => ({ ...prev, foto: null, fotoPreview: null }));
  }, [formData.fotoPreview]);

  // ============ RESETEAR FORMULARIO ============
  const resetForm = useCallback(() => {
    if (formData.fotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(formData.fotoPreview);
    }
    setFormData({
      ci: '', extension: 'LP', nombre: '', paterno: '', materno: '',
      sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '',
      foto: null, fotoPreview: null
    });
    setPuestosSeleccionados([]);
    setBusquedaPuestos('');
    setPaginaActual(0);
    setActiveTab('datos');
    setLocalError('');
    setNotificacionEnviada(false);
    reset();
  }, [formData.fotoPreview, reset]);

  // ============ VALIDAR FORMULARIO ============
  const validarFormulario = useCallback(() => {
    if (!formData.ci?.trim()) return 'El CI es requerido';
    if (!formData.nombre?.trim()) return 'El nombre es requerido';
    if (!formData.paterno?.trim()) return 'El apellido paterno es requerido';
    if (!formData.telefono?.trim()) return 'El teléfono es requerido';
    return null;
  }, [formData]);

  // ============ ENVIAR FORMULARIO ============
  const handleSubmit = async () => {
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setLocalError(errorValidacion);
      setActiveTab('datos');
      return;
    }

    if (puestosSeleccionados.length === 0) {
      setLocalError('Debe asignar al menos un puesto');
      setActiveTab('puestos');
      return;
    }

    const resultado = await crearAfiliadoCompleto({
      ...formData,
      puestos: puestosSeleccionados
    });

    if (resultado.exito && !notificacionEnviada) {
      setNotificacionEnviada(true);
      notifications.show({
        title: '✅ Éxito',
        message: `Afiliado creado con ${puestosSeleccionados.length} puesto${puestosSeleccionados.length !== 1 ? 's' : ''}`,
        color: 'green',
        autoClose: 3000
      });
      
      setTimeout(() => {
        resetForm();
        onClose();
        if (onAfiliadoCreado) onAfiliadoCreado();
      }, 1500);
    }
  };

  // ============ LIMPIAR RECURSOS ============
  useEffect(() => {
    return () => {
      if (formData.fotoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.fotoPreview);
      }
    };
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={resetForm}
      size="90%"
      title={
        <Group align="center" gap="xs">
          <IconUser size={24} color="#edbe3c" />
          <Text fw={700} size="xl">NUEVO AFILIADO</Text>
        </Group>
      }
      centered
      styles={{
        header: { 
          padding: '15px 20px', 
          borderBottom: '2px solid #edbe3c',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 100
        },
        body: { 
          padding: 0,
          height: 'calc(90vh - 80px)',
          overflow: 'hidden'
        }
      }}
    >
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* TABS */}
        <Tabs value={activeTab} onChange={setActiveTab} style={{ flexShrink: 0 }}>
          <Tabs.List style={{ padding: '0 20px', backgroundColor: '#fafafa' }}>
            <Tabs.Tab value="datos" leftSection={<IconUser size={16} />}>
              📋 Datos Personales
            </Tabs.Tab>
            <Tabs.Tab value="puestos" leftSection={<IconMapPinFilled size={16} />}>
              🏪 Puestos ({puestosSeleccionados.length})
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* CONTENIDO CON SCROLL */}
        <ScrollArea style={{ flex: 1, padding: '20px' }} scrollbarSize={8}>
          
          {/* ERRORES */}
          {localError && (
            <Alert icon={<IconX size={16} />} title="Error" color="red" mb="md" withCloseButton onClose={() => setLocalError('')}>
              {localError}
            </Alert>
          )}

          {/* ============ TAB 1: DATOS PERSONALES ============ */}
          {activeTab === 'datos' && (
            <Stack gap="xl">
              {/* SECCIÓN FOTO DE PERFIL + DATOS - AHORA EN LA MISMA FILA */}
              <Paper p="lg" withBorder radius="md">
                <Group align="flex-start" gap="xl" wrap="nowrap">
                  
                  {/* COLUMNA IZQUIERDA - FOTO */}
                  <Box style={{ width: '160px', flexShrink: 0 }}>
                    <Text fw={600} size="sm" mb="xs">Foto de Perfil</Text>
                    <Box
                      ref={dropZoneRef}
                      onClick={triggerFileInput}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative',
                        border: isDragging ? '2px solid #4CAF50' : formData.fotoPreview ? '2px solid #ddd' : '2px dashed #ddd',
                        backgroundColor: isDragging ? '#f0fff0' : '#f9f9f9',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handleFileInputChange} 
                        style={{ display: 'none' }} 
                      />
                      {formData.fotoPreview ? (
                        <>
                          <img 
                            src={formData.fotoPreview} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <ActionIcon
                            size="sm"
                            style={{ 
                              position: 'absolute', 
                              top: 5, 
                              right: 5, 
                              backgroundColor: 'rgba(0,0,0,0.7)', 
                              color: 'white',
                              zIndex: 10
                            }}
                            onClick={(e) => { e.stopPropagation(); removePhoto(); }}
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
                    <Text size="xs" c="dimmed" mt={5} ta="center">
                      JPG, PNG, GIF • Máx 5MB
                    </Text>
                  </Box>

                  {/* COLUMNA DERECHA - TODOS LOS DATOS */}
                  <Box style={{ flex: 1 }}>
                    <Text fw={700} size="lg" mb="md">Información Personal</Text>
                    <SimpleGrid cols={2} spacing="md">
                      <TextInput
                        label="CI *"
                        placeholder="1234567"
                        value={formData.ci}
                        onChange={(e) => setFormData({...formData, ci: e.target.value})}
                        leftSection={<IconId size={16} />}
                        required
                      />
                      <Select
                        label="Expedido *"
                        data={departamentos}
                        value={formData.extension}
                        onChange={(v) => setFormData({...formData, extension: v})}
                      />
                      <TextInput
                        label="Nombre *"
                        placeholder="Juan"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        leftSection={<IconUser size={16} />}
                        required
                      />
                      <TextInput
                        label="Paterno *"
                        placeholder="Pérez"
                        value={formData.paterno}
                        onChange={(e) => setFormData({...formData, paterno: e.target.value})}
                        required
                      />
                      <TextInput
                        label="Materno"
                        placeholder="García"
                        value={formData.materno}
                        onChange={(e) => setFormData({...formData, materno: e.target.value})}
                      />
                      <Select
                        label="Sexo"
                        data={sexos}
                        value={formData.sexo}
                        onChange={(v) => setFormData({...formData, sexo: v})}
                      />
                      <TextInput
                        label="Fecha Nacimiento"
                        type="date"
                        value={formData.fecNac}
                        onChange={(e) => setFormData({...formData, fecNac: e.target.value})}
                        leftSection={<IconCalendar size={16} />}
                      />
                      <TextInput
                        label="Teléfono *"
                        placeholder="76543210"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        leftSection={<IconPhone size={16} />}
                        required
                      />
                      <TextInput
                        label="Ocupación"
                        placeholder="Comerciante"
                        value={formData.ocupacion}
                        onChange={(e) => setFormData({...formData, ocupacion: e.target.value})}
                      />
                      <TextInput
                        label="Dirección"
                        placeholder="Av. Principal #123"
                        value={formData.direccion}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                        leftSection={<IconMapPin size={16} />}
                        style={{ gridColumn: 'span 2' }}
                      />
                    </SimpleGrid>
                  </Box>
                </Group>
              </Paper>

              <Group justify="flex-end" mt="xl">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  style={{ borderColor: '#0f0f0f', color: '#0f0f0f', borderRadius: '100px', padding: '0 30px', height: '45px' }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => setActiveTab('puestos')}
                  style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '100px', padding: '0 30px', height: '45px' }}
                >
                  Continuar a Puestos ({puestosSeleccionados.length})
                </Button>
              </Group>
            </Stack>
          )}

          {/* ============ TAB 2: SELECCIÓN DE PUESTOS ============ */}
          {activeTab === 'puestos' && (
            <Stack gap="md" style={{ height: '100%' }}>
              
              {/* LISTA DE PUESTOS SELECCIONADOS - CON SCROLL PROPIO */}
              {puestosSeleccionados.length > 0 && (
                <Paper p="md" withBorder radius="md">
                  <Group justify="space-between" mb="md">
                    <Text fw={700} size="md">Puestos Seleccionados ({puestosSeleccionados.length})</Text>
                    {puestosSeleccionados.length > 0 && (
                      <Badge color="yellow" variant="filled">
                        {puestosSeleccionados.length} puesto{puestosSeleccionados.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </Group>
                  <Divider mb="md" />
                  <ScrollArea style={{ height: '200px' }} scrollbarSize={6}>
                    <Stack gap="xs">
                      {puestosSeleccionados.map((puesto) => (
                        <PuestoItem
                          key={puesto.id_temporal}
                          puesto={puesto}
                          onUpdate={actualizarPuesto}
                          onRemove={eliminarPuesto}
                        />
                      ))}
                    </Stack>
                  </ScrollArea>
                </Paper>
              )}

              {/* BUSCADOR DE PUESTOS */}
              <Paper p="md" withBorder radius="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={700} size="md">Agregar Puestos</Text>
                    <Badge color="green" variant="light">
                      {puestosFiltrados.length} disponibles
                    </Badge>
                  </Group>

                  <TextInput
                    placeholder="Buscar por número, fila o cuadra..."
                    leftSection={<IconSearch size={16} />}
                    value={busquedaPuestos}
                    onChange={(e) => {
                      setBusquedaPuestos(e.target.value);
                      setPaginaActual(0);
                    }}
                    rightSection={busquedaPuestos && <CloseButton onClick={() => setBusquedaPuestos('')} />}
                  />

                  {puestosCargando ? (
                    <Stack align="center" py="xl">
                      <Loader />
                      <Text size="sm" c="dimmed">Cargando puestos disponibles...</Text>
                    </Stack>
                  ) : (
                    <>
                      {/* PAGINACIÓN */}
                      {puestosFiltrados.length > ITEMS_POR_PAGINA && (
                        <Group justify="flex-end" gap="xs">
                          <Button 
                            size="xs" 
                            variant="subtle"
                            disabled={paginaActual === 0}
                            onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
                          >
                            ← Anterior
                          </Button>
                          <Text size="sm" fw={500}>
                            {paginaActual * ITEMS_POR_PAGINA + 1}-
                            {Math.min((paginaActual + 1) * ITEMS_POR_PAGINA, puestosFiltrados.length)}
                          </Text>
                          <Button 
                            size="xs" 
                            variant="subtle"
                            disabled={(paginaActual + 1) * ITEMS_POR_PAGINA >= puestosFiltrados.length}
                            onClick={() => setPaginaActual(p => p + 1)}
                          >
                            Siguiente →
                          </Button>
                        </Group>
                      )}

                      {/* GRILLA DE PUESTOS - CON SCROLL PROPIO */}
                      <ScrollArea style={{ height: '300px' }} scrollbarSize={6}>
                        <SimpleGrid cols={4} spacing="xs">
                          {puestosPaginados.map((puesto) => (
                            <PuestoDisponible
                              key={puesto.id_puesto}
                              puesto={puesto}
                              yaSeleccionado={puestosSeleccionados.some(p => p.id_puesto === puesto.id_puesto)}
                              onAgregar={agregarPuesto}
                            />
                          ))}
                        </SimpleGrid>
                      </ScrollArea>
                    </>
                  )}
                </Stack>
              </Paper>

              {/* BOTONES DE ACCIÓN */}
              <Group justify="space-between" mt="xl" style={{ flexShrink: 0 }}>
                <Button 
                  variant="subtle" 
                  onClick={() => setActiveTab('datos')}
                  leftSection={<IconX size={16} />}
                >
                  Volver a Datos
                </Button>
                <Group>
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    style={{ borderColor: '#0f0f0f', color: '#0f0f0f', borderRadius: '100px', padding: '0 25px', height: '45px' }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={puestosSeleccionados.length === 0}
                    style={{
                      backgroundColor: '#edbe3c',
                      color: '#0f0f0f',
                      borderRadius: '100px',
                      padding: '0 25px',
                      height: '45px',
                      fontWeight: 600,
                      minWidth: '200px'
                    }}
                  >
                    {loading ? 'Creando...' : `Crear Afiliado (${puestosSeleccionados.length})`}
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