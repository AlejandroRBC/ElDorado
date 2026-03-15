
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

import { useCrearAfiliado } from '../hooks/useCrearAfiliado';
import { useAsignarPuesto } from '../hooks/useAsignarPuesto';
import { useVistaPreviewImagen } from '../hooks/useVistaPreviewImagen';
import '../styles/Estilos.css'; // Archivo acumulador de estilos

// ==============================================
// CONSTANTES Y OPCIONES ESTÁTICAS
// ==============================================
const DEPARTAMENTOS = [
  { value: 'LP', label: 'La Paz' }, { value: 'CB', label: 'Cochabamba' },
  { value: 'SC', label: 'Santa Cruz' }, { value: 'OR', label: 'Oruro' },
  { value: 'PT', label: 'Potosí' }, { value: 'TJ', label: 'Tarija' },
  { value: 'CH', label: 'Chuquisaca' }, { value: 'BE', label: 'Beni' },
  { value: 'PD', label: 'Pando' }, { value: 'QR', label: 'Q.R.' },
];

const SEXOS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
];

const FILAS = [
  { value: '', label: 'Todas las filas' },
  { value: 'A', label: 'Fila A' },
  { value: 'B', label: 'Fila B' },
];

const CUADRAS = [
  { value: '', label: 'Todas las cuadras' },
  { value: 'Cuadra 1', label: 'Cuadra 1' },
  { value: 'Cuadra 2', label: 'Cuadra 2' },
  { value: 'Cuadra 3', label: 'Cuadra 3' },
  { value: 'Cuadra 4', label: 'Cuadra 4' },
  { value: 'Callejón', label: 'Callejón' },
];

const ITEMS_POR_PAGINA = 30;

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

const getBadgeColor = (puesto) => puesto.tienePatente ? 'badge-puesto-patente' : 'badge-puesto-sin-patente';

const handleImageError = (e) => {
  e.target.style.display = 'none';
  e.target.parentElement.innerHTML = `
    <div class="foto-perfil-fallback">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>`;
};

// ==============================================
// SUB-COMPONENTES MEMOIZADOS
// ==============================================

const PuestoItem = memo(({ puesto, onUpdate, onRemove }) => {
  const handleRubroChange = useCallback((e) => onUpdate(puesto.id_temporal, 'rubro', e.target.value), [puesto.id_temporal, onUpdate]);
  const handlePatenteChange = useCallback((e) => onUpdate(puesto.id_temporal, 'tiene_patente', e.target.checked), [puesto.id_temporal, onUpdate]);
  const handleRemove = useCallback(() => onRemove(puesto.id_temporal), [puesto.id_temporal, onRemove]);

  return (
    <Paper p="xs" withBorder className="puesto-item-paper">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="xs" wrap="wrap">
          <Badge color="dark" size="md" variant="filled" className="puesto-item-badge">
            {puesto.nroPuesto}-{puesto.fila}-{puesto.cuadra}
          </Badge>
          <TextInput
            placeholder="Rubro del puesto"
            size="xs"
            value={puesto.rubro || ''}
            onChange={handleRubroChange}
            className="puesto-item-input"
          />
          <Checkbox
            label="Patente"
            size="xs"
            checked={puesto.tiene_patente || false}
            onChange={handlePatenteChange}
          />
        </Group>
        <ActionIcon color="red" variant="subtle" onClick={handleRemove} size="sm" aria-label="Eliminar puesto">
          <IconTrash size={14} />
        </ActionIcon>
      </Group>
    </Paper>
  );
});

const PuestoDisponible = memo(({ puesto, yaSeleccionado, onAgregar }) => {
  const handleClick = useCallback(() => {
    if (!yaSeleccionado) onAgregar(puesto);
  }, [puesto, yaSeleccionado, onAgregar]);

  const claseBase = yaSeleccionado ? 'puesto-disponible seleccionado' : 'puesto-disponible';

  return (
    <Paper p={6} withBorder className={claseBase} onClick={handleClick}>
      <Stack gap={2} align="center">
        <Badge color="dark" size="sm" variant="filled">{puesto.nroPuesto}</Badge>
        <Text size="xs" fw={600}>Fila {puesto.fila}</Text>
        <Text size="10px" c="dimmed" lineClamp={1}>{puesto.cuadra}</Text>
      </Stack>
    </Paper>
  );
});

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

const ModalAfiliado = ({ opened, onClose, onAfiliadoCreado }) => {
  const { crearAfiliadoCompleto, loading, reset } = useCrearAfiliado();
  const { puestosDisponibles, puestosCargando, cargarPuestosDisponibles } = useAsignarPuesto(null);

  // ==============================================
  // ESTADOS LOCALES
  // ==============================================
  const [activeTab, setActiveTab] = useState('datos');
  const [localError, setLocalError] = useState('');
  const [formData, setFormData] = useState({
    ci: '', extension: 'LP', nombre: '', paterno: '', materno: '',
    sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '',
  });
  const [puestosSeleccionados, setPuestosSeleccionados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);
  const [errorPuestosOcupados, setErrorPuestosOcupados] = useState([]);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false);
  const [filtroFila, setFiltroFila] = useState('');
  const [filtroCuadra, setFiltroCuadra] = useState('');
  const [filtroNumero, setFiltroNumero] = useState('');

  // ==============================================
  // HOOK DE PREVIEW
  // ==============================================
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

  // ==============================================
  // EFECTOS
  // ==============================================
  useEffect(() => {
    if (opened) {
      resetForm();
      cargarPuestosDisponibles();
      setNotificacionEnviada(false);
      setErrorPuestosOcupados([]);
    }
  }, [opened]);

  // ==============================================
  // MEMOIZACIÓN - FILTROS Y PAGINACIÓN
  // ==============================================
  const puestosFiltrados = useMemo(() => {
    if (!puestosDisponibles?.length) return [];
    return puestosDisponibles.filter((p) => {
      if (filtroFila && p.fila !== filtroFila) return false;
      if (filtroCuadra && p.cuadra !== filtroCuadra) return false;
      if (filtroNumero && !p.nroPuesto.toString().includes(filtroNumero)) return false;
      return true;
    });
  }, [puestosDisponibles, filtroFila, filtroCuadra, filtroNumero]);

  const puestosPaginados = useMemo(() => {
    const start = paginaActual * ITEMS_POR_PAGINA;
    return puestosFiltrados.slice(start, start + ITEMS_POR_PAGINA);
  }, [puestosFiltrados, paginaActual]);

  // ==============================================
  // HANDLERS DEL COMPONENTE
  // ==============================================

  const agregarPuesto = useCallback((puesto) => {
    setPuestosSeleccionados((prev) => {
      if (prev.some((p) => p.id_puesto === puesto.id_puesto)) {
        notifications.show({
          title: '⚠️ Puesto duplicado',
          message: `${puesto.nroPuesto}-${puesto.fila}-${puesto.cuadra} ya está en la lista`,
          color: 'yellow',
          autoClose: 2000
        });
        return prev;
      }
      return [...prev, {
        ...puesto,
        rubro: '',
        tiene_patente: false,
        id_temporal: `${Date.now()}-${Math.random()}`
      }];
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
    setFormData({
      ci: '', extension: 'LP', nombre: '', paterno: '', materno: '',
      sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: ''
    });
    reiniciar(null);
    setPuestosSeleccionados([]);
    setPaginaActual(0);
    setActiveTab('datos');
    setLocalError('');
    setNotificacionEnviada(false);
    setErrorPuestosOcupados([]);
    setFiltroFila('');
    setFiltroCuadra('');
    setFiltroNumero('');
    reset();
  }, [reiniciar, reset]);

  const validarFormulario = useCallback(() => {
    if (!formData.ci?.trim()) return 'El CI es requerido';
    if (!formData.nombre?.trim()) return 'El nombre es requerido';
    return null;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setLocalError(errorValidacion);
      setActiveTab('datos');
      return;
    }

    const resultado = await crearAfiliadoCompleto({
      ...formData,
      foto: archivoSeleccionado,
      puestos: puestosSeleccionados,
    });

    if (resultado.exito) {
      if (resultado.puestosFallidos?.length > 0) {
        setErrorPuestosOcupados(resultado.puestosFallidos);
        setPuestosSeleccionados((prev) =>
          prev.filter((p) => !resultado.puestosFallidos.includes(p.id_puesto))
        );
        notifications.show({
          title: '⚠️ Advertencia',
          message: `Afiliado creado pero ${resultado.puestosFallidos.length} puesto(s) no pudieron asignarse (ya estaban ocupados)`,
          color: 'yellow',
          autoClose: 5000
        });
      } else {
        if (!notificacionEnviada) {
          setNotificacionEnviada(true);
          notifications.show({
            title: '✅ Éxito',
            message: puestosSeleccionados.length > 0
              ? `Afiliado creado con ${puestosSeleccionados.length} puesto${puestosSeleccionados.length !== 1 ? 's' : ''}`
              : 'Afiliado creado exitosamente (sin puestos)',
            color: 'green',
            autoClose: 3000,
          });
        }
        setTimeout(() => {
          resetForm();
          onClose();
          if (onAfiliadoCreado) onAfiliadoCreado();
        }, 1500);
      }
    }
  }, [validarFormulario, crearAfiliadoCompleto, formData, archivoSeleccionado, puestosSeleccionados, notificacionEnviada, resetForm, onClose, onAfiliadoCreado]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
  }, []);

  const handleFormDataChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFiltroFila('');
    setFiltroCuadra('');
    setFiltroNumero('');
    setPaginaActual(0);
  }, []);

  const handleNextPage = useCallback(() => {
    setPaginaActual((p) => p + 1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPaginaActual((p) => Math.max(0, p - 1));
  }, []);

  const handleFilterFilaChange = useCallback((value) => {
    setFiltroFila(value);
    setPaginaActual(0);
  }, []);

  const handleFilterCuadraChange = useCallback((value) => {
    setFiltroCuadra(value);
    setPaginaActual(0);
  }, []);

  const handleFilterNumeroChange = useCallback((e) => {
    setFiltroNumero(e.target.value);
    setPaginaActual(0);
  }, []);

  const handleFotoClick = useCallback((e) => {
    e.stopPropagation();
    alEliminarFoto();
  }, [alEliminarFoto]);

  // ==============================================
  // RENDERIZADO DE SECCIONES
  // ==============================================

  const renderTitulo = () => (
    <Group align="center" gap="xs">
      <IconUser size={24} color="#edbe3c" />
      <Text fw={700} size="xl" className="modal-titulo-texto">NUEVO AFILIADO</Text>
    </Group>
  );

  const renderFotoPerfil = () => (
    <Box className="modal-foto-contenedor">
      <Text fw={600} size="sm" mb="xs">Foto de Perfil</Text>
      <Box
        {...propsDragDrop}
        className={`modal-foto-zona ${isDragging ? 'modal-foto-dragging' : ''} ${preview ? 'modal-foto-con-imagen' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={alCambiarInputArchivo}
          style={{ display: 'none' }}
        />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Vista previa de foto de perfil"
              className="modal-foto-imagen"
              onError={handleImageError}
            />
            <ActionIcon
              size="sm"
              aria-label="Eliminar foto"
              className="modal-foto-boton-eliminar"
              onClick={handleFotoClick}
            >
              <IconX size={14} />
            </ActionIcon>
          </>
        ) : (
          <Stack align="center" gap="xs" className="modal-foto-placeholder">
            <IconPhoto size={40} className={isDragging ? 'icono-dragging' : 'icono-normal'} />
            <Text size="xs" ta="center" className={isDragging ? 'texto-dragging' : 'texto-normal'}>
              {isDragging ? 'Suelta la imagen' : 'Haz clic o arrastra'}
            </Text>
          </Stack>
        )}
      </Box>
      <Text size="xs" className="modal-foto-ayuda">JPG, PNG, GIF • Máx 5MB</Text>
    </Box>
  );

  const renderCamposPersonales = () => (
    <Box className="modal-campos-contenedor">
      <Text fw={700} size="lg" mb="md">Información Personal</Text>
      <SimpleGrid cols={2} spacing="md">
        <TextInput
          label="CI *"
          placeholder="1234567"
          value={formData.ci}
          onChange={(e) => handleFormDataChange('ci', e.target.value)}
          leftSection={<IconId size={16} />}
          required
          className="input-base"
        />
        <Select
          label="Expedido *"
          data={DEPARTAMENTOS}
          value={formData.extension}
          onChange={(v) => handleFormDataChange('extension', v)}
          className="input-base"
        />
        <TextInput
          label="Nombre *"
          placeholder="Juan"
          value={formData.nombre}
          onChange={(e) => handleFormDataChange('nombre', e.target.value)}
          leftSection={<IconUser size={16} />}
          required
          className="input-base"
        />
        <TextInput
          label="Paterno"
          placeholder="Pérez"
          value={formData.paterno}
          onChange={(e) => handleFormDataChange('paterno', e.target.value)}
          className="input-base"
        />
        <TextInput
          label="Materno"
          placeholder="García"
          value={formData.materno}
          onChange={(e) => handleFormDataChange('materno', e.target.value)}
          className="input-base"
        />
        <Select
          label="Sexo"
          data={SEXOS}
          value={formData.sexo}
          onChange={(v) => handleFormDataChange('sexo', v)}
          className="input-base"
        />
        <TextInput
          label="Fecha Nacimiento"
          type="date"
          value={formData.fecNac}
          onChange={(e) => handleFormDataChange('fecNac', e.target.value)}
          leftSection={<IconCalendar size={16} />}
          className="input-base"
        />
        <TextInput
          label="Teléfono *"
          placeholder="76543210"
          value={formData.telefono}
          onChange={(e) => handleFormDataChange('telefono', e.target.value)}
          leftSection={<IconPhone size={16} />}
          className="input-base"
        />
        <TextInput
          label="Ocupación"
          placeholder="Comerciante"
          value={formData.ocupacion}
          onChange={(e) => handleFormDataChange('ocupacion', e.target.value)}
          className="input-base"
        />
        <TextInput
          label="Dirección"
          placeholder="Av. Principal #123"
          value={formData.direccion}
          onChange={(e) => handleFormDataChange('direccion', e.target.value)}
          leftSection={<IconMapPin size={16} />}
          className="input-base input-span-2"
        />
      </SimpleGrid>
    </Box>
  );

  const renderBotonesDatosTab = () => (
    <Group justify="flex-end" mt="xl">
      <Button
        variant="outline"
        onClick={handleClose}
        className="boton-cancelar"
      >
        Cancelar
      </Button>
      <Button
        variant="outline"
        onClick={() => setActiveTab('puestos')}
        className="boton-ver-puestos"
      >
        {puestosSeleccionados.length > 0 ? `Ver Puestos (${puestosSeleccionados.length})` : 'Agregar Puestos'}
      </Button>
      <Button
        onClick={handleSubmit}
        loading={loading}
        className="boton-guardar"
      >
        {loading ? 'Creando...' : 'Crear Afiliado'}
      </Button>
    </Group>
  );

  const renderPuestosSeleccionados = () => {
    if (puestosSeleccionados.length === 0) return null;

    return (
      <Paper p="md" withBorder radius="md" className="modal-puestos-seleccionados">
        <Group justify="space-between" mb="md">
          <Text fw={700} size="md">Puestos Seleccionados ({puestosSeleccionados.length})</Text>
          <Badge color="yellow" variant="filled" className="modal-puestos-badge">
            {puestosSeleccionados.length} puesto{puestosSeleccionados.length !== 1 ? 's' : ''}
          </Badge>
        </Group>
        <Divider mb="md" />
        <ScrollArea style={{ height: '200px' }} scrollbarSize={6}>
          <Stack gap="xs">
            {puestosSeleccionados.map((p) => (
              <PuestoItem
                key={p.id_temporal}
                puesto={p}
                onUpdate={actualizarPuesto}
                onRemove={eliminarPuesto}
              />
            ))}
          </Stack>
        </ScrollArea>
      </Paper>
    );
  };

  const renderFiltrosPuestos = () => (
    <>
      <Group grow gap="xs">
        <Select
          placeholder="Fila"
          data={FILAS}
          value={filtroFila}
          onChange={handleFilterFilaChange}
          clearable
          size="sm"
          className="input-base"
        />
        <Select
          placeholder="Cuadra"
          data={CUADRAS}
          value={filtroCuadra}
          onChange={handleFilterCuadraChange}
          clearable
          size="sm"
          className="input-base"
        />
        <TextInput
          placeholder="N° puesto"
          value={filtroNumero}
          onChange={handleFilterNumeroChange}
          size="sm"
          className="input-base"
        />
      </Group>

      {(filtroFila || filtroCuadra || filtroNumero) && (
        <Group justify="flex-end">
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconX size={12} />}
            onClick={handleClearFilters}
            className="boton-limpiar-filtros"
          >
            Limpiar filtros
          </Button>
        </Group>
      )}
    </>
  );

  const renderPaginacion = () => {
    if (puestosFiltrados.length <= ITEMS_POR_PAGINA) return null;

    return (
      <Group justify="flex-end" gap="xs">
        <Button
          size="xs"
          variant="subtle"
          disabled={paginaActual === 0}
          onClick={handlePrevPage}
        >
          ← Anterior
        </Button>
        <Text size="sm" fw={500}>
          {paginaActual * ITEMS_POR_PAGINA + 1}–
          {Math.min((paginaActual + 1) * ITEMS_POR_PAGINA, puestosFiltrados.length)}
        </Text>
        <Button
          size="xs"
          variant="subtle"
          disabled={(paginaActual + 1) * ITEMS_POR_PAGINA >= puestosFiltrados.length}
          onClick={handleNextPage}
        >
          Siguiente →
        </Button>
      </Group>
    );
  };

  const renderPuestosDisponibles = () => {
    if (puestosCargando) {
      return (
        <Stack align="center" py="xl">
          <Loader />
          <Text size="sm" c="dimmed">Cargando puestos disponibles...</Text>
        </Stack>
      );
    }

    return (
      <>
        {renderPaginacion()}
        <ScrollArea style={{ height: '300px' }} scrollbarSize={6}>
          <SimpleGrid cols={4} spacing="xs">
            {puestosPaginados.map((p) => (
              <PuestoDisponible
                key={p.id_puesto}
                puesto={p}
                yaSeleccionado={puestosSeleccionados.some((s) => s.id_puesto === p.id_puesto)}
                onAgregar={agregarPuesto}
              />
            ))}
          </SimpleGrid>
        </ScrollArea>
      </>
    );
  };

  const renderBotonesPuestosTab = () => (
    <Group justify="space-between" mt="xl">
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
          onClick={handleClose}
          className="boton-cancelar"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          className="boton-guardar boton-guardar-extendido"
        >
          {loading ? 'Creando...' : `Crear Afiliado${puestosSeleccionados.length > 0 ? ` (${puestosSeleccionados.length})` : ''}`}
        </Button>
      </Group>
    </Group>
  );

  const renderAlertas = () => (
    <>
      {localError && (
        <Alert
          icon={<IconX size={16} />}
          title="Error"
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setLocalError('')}
        >
          {localError}
        </Alert>
      )}

      {errorPuestosOcupados.length > 0 && (
        <Alert
          icon={<IconX size={16} />}
          title="Puestos no disponibles"
          color="yellow"
          mb="md"
          withCloseButton
          onClose={() => setErrorPuestosOcupados([])}
        >
          <Stack gap="xs">
            <Text size="sm">Los siguientes puestos ya estaban ocupados y no se asignaron:</Text>
            <Group gap="xs">
              {errorPuestosOcupados.map((id, idx) => {
                const p = puestosSeleccionados.find((p) => p.id_puesto === id);
                return p && (
                  <Badge key={idx} color="red" variant="outline">
                    {p.nroPuesto}-{p.fila}-{p.cuadra}
                  </Badge>
                );
              })}
            </Group>
          </Stack>
        </Alert>
      )}
    </>
  );

  // Render principal
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="90%"
      title={renderTitulo()}
      centered
      classNames={{
        header: 'modal-header',
        body: 'modal-body'
      }}
    >
      <Box className="modal-contenedor">
        <Tabs value={activeTab} onChange={handleTabChange} className="modal-tabs">
          <Tabs.List className="modal-tabs-list">
            <Tabs.Tab value="datos" leftSection={<IconUser size={16} />}>
              Datos Personales
            </Tabs.Tab>
            <Tabs.Tab value="puestos" leftSection={<IconMapPinFilled size={16} />}>
              Puestos {puestosSeleccionados.length > 0 ? `(${puestosSeleccionados.length})` : ''}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <ScrollArea className="modal-scrollarea" scrollbarSize={8}>
          {renderAlertas()}

          {activeTab === 'datos' && (
            <Stack gap="xl">
              <Paper p="lg" withBorder radius="md" className="modal-paper-datos">
                <Group align="flex-start" gap="xl" wrap="nowrap">
                  {renderFotoPerfil()}
                  {renderCamposPersonales()}
                </Group>
              </Paper>
              {renderBotonesDatosTab()}
            </Stack>
          )}

          {activeTab === 'puestos' && (
            <Stack gap="md">
              {renderPuestosSeleccionados()}

              <Paper p="md" withBorder radius="md" className="modal-paper-puestos">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={700} size="md">Agregar Puestos</Text>
                    <Badge color="green" variant="light" className="modal-disponibles-badge">
                      {puestosFiltrados.length} disponibles
                    </Badge>
                  </Group>

                  {renderFiltrosPuestos()}
                  {renderPuestosDisponibles()}
                </Stack>
              </Paper>

              {renderBotonesPuestosTab()}
            </Stack>
          )}
        </ScrollArea>
      </Box>
    </Modal>
  );
};

export default ModalAfiliado;