// frontend/src/modules/Afiliados/components/FormularioEditarAfiliado.jsx
//
// PATCH RESPONSIVE
// Cambios:
//   1. useMediaQuery({ maxWidth: 640 }) para isMobile
//   2. Layout principal: en móvil foto va arriba centrada, campos abajo
//   3. SimpleGrid cols: 1 en móvil, 2 en desktop
//   4. Botones de acción fullWidth en móvil

import { TextInput, Select, Stack, Group, Box, Text, Button, Paper, SimpleGrid } from '@mantine/core';
import { IconPhoto, IconX, IconUser, IconId, IconPhone, IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from 'react-responsive';

import { useVistaPreviewImagen } from '../hooks/useVistaPreviewImagen';
import { getImageUrl } from '../../../utils/imageHelper';
import '../styles/Estilos.css';

// ==============================================
// CONSTANTES
// ==============================================
const DEPARTAMENTOS = [
  { value: 'LP', label: 'La Paz' }, { value: 'CB', label: 'Cochabamba' },
  { value: 'SC', label: 'Santa Cruz' }, { value: 'OR', label: 'Oruro' },
  { value: 'PT', label: 'Potosí' }, { value: 'TJ', label: 'Tarija' },
  { value: 'CH', label: 'Chuquisaca' }, { value: 'BE', label: 'Beni' },
  { value: 'PD', label: 'Pando' },
];

const SEXOS = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
];

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================
const resolverUrlFoto = (afiliado) => {
  if (!afiliado?.url_perfil) return null;
  if (afiliado.url_perfil.includes('sinPerfil.png')) return null;
  return getImageUrl(afiliado.url_perfil);
};

const computarFormData = (afiliado) => {
  if (!afiliado) {
    return {
      ci: '', extension: 'LP', nombre: '', paterno: '', materno: '',
      sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '',
      es_habilitado: true,
    };
  }
  return {
    ci: afiliado.ci_numero || afiliado.ci || '',
    extension: afiliado.extension || 'LP',
    nombre: afiliado.nombre || '',
    paterno: afiliado.paterno || '',
    materno: afiliado.materno || '',
    sexo: afiliado.sexo === 'Masculino' ? 'M'
      : afiliado.sexo === 'Femenino' ? 'F'
      : afiliado.sexo || 'M',
    fecNac: afiliado.fecNac ? afiliado.fecNac.split('T')[0] : '',
    telefono: afiliado.telefono || '',
    ocupacion: afiliado.ocupacion || '',
    direccion: afiliado.direccion || '',
    es_habilitado: afiliado.es_habilitado === 1 || afiliado.es_habilitado === true,
  };
};

const handleFieldChange = (setFormData, field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

const FormularioEditarAfiliado = ({
  afiliado,
  onSubmit,
  onCancel,
  loading = false,
  modo = 'editar',
}) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });

  const [formData, setFormData] = useState(() => computarFormData(afiliado));

  const urlInicial = resolverUrlFoto(afiliado);
  const { preview, archivoSeleccionado, isDragging, fileInputRef,
          alEliminarFoto, alCambiarInputArchivo, propsDragDrop } = useVistaPreviewImagen({
    urlInicial,
  });

  const handleChange = (field, value) => handleFieldChange(setFormData, field, value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ci || !formData.nombre) {
      notifications.show({ title: 'Campos requeridos', message: 'CI y Nombre son obligatorios', color: 'orange' });
      return;
    }
    await onSubmit?.({ ...formData, foto: archivoSeleccionado });
  };

  // ── Foto de perfil ──────────────────────────────────────────
  const renderFotoPerfil = () => (
    <Box
      className="formulario-foto-contenedor"
      style={{
        width: isMobile ? '100%' : 180,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Text size="sm" fw={600} mb={4} style={{ textAlign: 'center' }}>Foto de perfil</Text>

      <div
        {...propsDragDrop}
        style={{
          width:           isMobile ? 130 : 160,
          height:          isMobile ? 130 : 160,
          margin:          '0 auto',
          borderRadius:    '50%',
          border:          isDragging ? '2px dashed #0f0f0f' : '2px dashed #C4C4C4',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          cursor:          'pointer',
          overflow:        'hidden',
          backgroundColor: '#F6F9FF',
          transition:      'border-color 0.2s',
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Stack align="center" gap={6} style={{ padding: 16, textAlign: 'center' }}>
            <IconPhoto size={32} color="#C4C4C4" />
            <Text size="xs" c="dimmed">Arrastra o haz clic</Text>
          </Stack>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={alCambiarInputArchivo}
      />

      {preview && (
        <Button
          size="xs"
          variant="subtle"
          color="red"
          leftSection={<IconX size={12} />}
          onClick={alEliminarFoto}
          disabled={loading}
        >
          Quitar foto
        </Button>
      )}

      {preview && !archivoSeleccionado && (
        <Text size="xs" className="formulario-foto-guardada">Foto actual guardada</Text>
      )}
    </Box>
  );

  // ── Campos del formulario ────────────────────────────────────
  const renderCamposFormulario = () => (
    <Box className="formulario-campos-contenedor" style={{ flex: 1, minWidth: 0 }}>
      <Text fw={700} size={isMobile ? 'md' : 'lg'} mb="md" className="formulario-titulo">
        {modo === 'editar' ? 'Editar Información Personal' : 'Nuevo Afiliado'}
      </Text>

      {/* En móvil: 1 columna; en desktop: 2 columnas */}
      <SimpleGrid cols={isMobile ? 1 : 2} spacing="md">
        <TextInput
          label="CI *" placeholder="1234567"
          value={formData.ci}
          onChange={(e) => handleChange('ci', e.target.value)}
          leftSection={<IconId size={16} />}
          required disabled={loading}
          className="input-base"
        />
        <Select
          label="Expedido *" data={DEPARTAMENTOS}
          value={formData.extension}
          onChange={(v) => handleChange('extension', v)}
          disabled={loading}
          className="input-base"
        />
        <TextInput
          label="Nombre *" placeholder="Juan"
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          leftSection={<IconUser size={16} />}
          required disabled={loading}
          className="input-base"
        />
        <TextInput
          label="Paterno" placeholder="Pérez"
          value={formData.paterno}
          onChange={(e) => handleChange('paterno', e.target.value)}
          disabled={loading}
          className="input-base"
        />
        <TextInput
          label="Materno" placeholder="García"
          value={formData.materno}
          onChange={(e) => handleChange('materno', e.target.value)}
          disabled={loading}
          className="input-base"
        />
        <Select
          label="Sexo" data={SEXOS}
          value={formData.sexo}
          onChange={(v) => handleChange('sexo', v)}
          disabled={loading}
          className="input-base"
        />
        <TextInput
          label="Fecha de Nacimiento" type="date"
          value={formData.fecNac}
          onChange={(e) => handleChange('fecNac', e.target.value)}
          leftSection={<IconCalendar size={16} />}
          disabled={loading}
          className="input-base"
        />
        <TextInput
          label="Teléfono" placeholder="76543210"
          value={formData.telefono}
          onChange={(e) => handleChange('telefono', e.target.value)}
          leftSection={<IconPhone size={16} />}
          disabled={loading}
          className="input-base"
        />
        <TextInput
          label="Ocupación" placeholder="Comerciante"
          value={formData.ocupacion}
          onChange={(e) => handleChange('ocupacion', e.target.value)}
          disabled={loading}
          className="input-base"
        />
        {/* Dirección ocupa 2 cols en desktop, 1 en móvil (ya que grid es 1 col) */}
        <TextInput
          label="Dirección" placeholder="Av. Principal #123"
          value={formData.direccion}
          onChange={(e) => handleChange('direccion', e.target.value)}
          leftSection={<IconMapPin size={16} />}
          disabled={loading}
          className={`input-base ${isMobile ? '' : 'input-span-2'}`}
          style={isMobile ? {} : { gridColumn: 'span 2' }}
        />
      </SimpleGrid>
    </Box>
  );

  // ── Botones de acción ────────────────────────────────────────
  const renderBotonesAccion = () => (
    <Group
      justify={isMobile ? 'stretch' : 'flex-end'}
      gap="md"
      style={{ flexDirection: isMobile ? 'column' : 'row' }}
    >
      <Button
        onClick={onCancel}
        disabled={loading}
        className="gp-btn-cerrar"
        fullWidth={isMobile}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        loading={loading}
        className="gp-btn-reporte"
        fullWidth={isMobile}
      >
        {loading ? 'Guardando...' : modo === 'editar' ? 'Guardar Cambios' : 'Crear Afiliado'}
      </Button>
    </Group>
  );

  // ── Render principal ─────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">
        <Paper p={isMobile ? 'sm' : 'lg'} withBorder radius="md" className="formulario-paper">
          {/* En móvil: columna (foto arriba, campos abajo); en desktop: fila */}
          <Group
            align="flex-start"
            gap="xl"
            style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}
          >
            {renderFotoPerfil()}
            {renderCamposFormulario()}
          </Group>
        </Paper>

        {renderBotonesAccion()}
      </Stack>
    </form>
  );
};

export default FormularioEditarAfiliado;