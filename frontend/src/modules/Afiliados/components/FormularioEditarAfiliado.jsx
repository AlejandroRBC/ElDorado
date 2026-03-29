import { TextInput, Select, Stack, Group, Box, Text, Button, Paper, SimpleGrid } from '@mantine/core';
import { IconPhoto, IconX, IconUser, IconId, IconPhone, IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

import { useVistaPreviewImagen } from '../hooks/useVistaPreviewImagen';
import { getImageUrl } from '../../../utils/imageHelper';
import '../styles/Estilos.css'; // Archivo acumulador de estilos
import '../styles/Estilos.css'; // Archivo acumulador de estilos

// ==============================================
// CONSTANTES Y OPCIONES ESTÁTICAS
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

/** Extrae la URL de foto de un afiliado, o null si no tiene. */
const resolverUrlFoto = (afiliado) => {
  if (!afiliado?.url_perfil) return null;
  if (afiliado.url_perfil.includes('sinPerfil.png')) return null;
  return getImageUrl(afiliado.url_perfil);
};

/**
 * Convierte el objeto `afiliado` recibido como prop en los valores
 * iniciales del formulario. Se llama una sola vez desde useState().
 */
const computarFormData = (afiliado) => {
  if (!afiliado) {
    return {
      ci: '', extension: 'LP', nombre: '', paterno: '', materno: '',
      sexo: 'M', fecNac: '', telefono: '', ocupacion: '', direccion: '',
      es_habilitado: true,
    };
  }

  let ciNumero = afiliado.ci || '';
  let extension = 'LP';

  return {
    ci: afiliado.ci_numero || ciNumero,
    extension: afiliado.extension || extension,
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

// ==============================================
// HANDLERS UTILITARIOS
// ==============================================

/**
 * Manejador para cambio de campos del formulario
 */
const handleFieldChange = (setFormData, field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

/**
 * Manejador para error de carga de imagen
 */
const handleImageError = (e, esUrlExterna) => {
  if (esUrlExterna) {
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = `
      <div class="foto-perfil-fallback">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>`;
  }
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
  // Estado inicializado directamente desde props — sin useEffect.
  const [formData, setFormData] = useState(() => computarFormData(afiliado));

  // URL de la foto actual derivada antes de llamar al hook,
  // para que useVistaPreviewImagen la reciba como urlInicial.
  const urlFotoInicial = resolverUrlFoto(afiliado);

  // ==============================================
  // HOOK DE PREVIEW
  // ==============================================
  const {
    preview,
    esBlobNuevo,
    esUrlExterna,
    archivoSeleccionado,
    isDragging,
    fileInputRef,
    alEliminarFoto,
    alCambiarInputArchivo,
    propsDragDrop,
  } = useVistaPreviewImagen({
    urlInicial: urlFotoInicial,
    alReportarError: (msg) =>
      notifications.show({ title: 'Error', message: msg, color: 'red' }),
  });

  // ==============================================
  // HANDLERS DEL COMPONENTE
  // ==============================================

  const handleChange = (field, value) => {
    handleFieldChange(setFormData, field, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, foto: archivoSeleccionado });
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    alEliminarFoto();
  };

  const handleImageErrorWrapper = (e) => {
    handleImageError(e, esUrlExterna);
  };

  // ==============================================
  // RENDERIZADO DE SECCIONES
  // ==============================================

  const renderFotoPerfil = () => (
    <Box className="formulario-foto-contenedor">
      <Text fw={600} size="sm" mb="xs">Foto de Perfil</Text>

      <Box
        {...propsDragDrop}
        className={`formulario-foto-zona ${isDragging ? 'formulario-foto-dragging' : ''} ${preview ? 'formulario-foto-con-imagen' : ''}`}
      >
        {/* Input oculto */}
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
              className="formulario-foto-imagen"
              onError={handleImageErrorWrapper}
            />

            {/* Botón eliminar */}
            <Button
              variant="subtle" size="xs"
              aria-label="Eliminar foto"
              className="formulario-foto-boton-eliminar"
              onClick={handleRemoveClick}
            >
              <IconX size={14} />
            </Button>

            {/* Indicador de foto nueva */}
            {esBlobNuevo && (
              <Box className="formulario-foto-badge-nueva">
                NUEVA
              </Box>
            )}
          </>
        ) : (
          <Stack align="center" gap="xs" className="formulario-foto-placeholder">
            <IconPhoto size={40} className={isDragging ? 'icono-dragging' : 'icono-normal'} />
            <Text size="xs" className={isDragging ? 'texto-dragging' : 'texto-normal'}>
              {isDragging ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen'}
            </Text>
          </Stack>
        )}
      </Box>

      <Text size="xs" className="formulario-foto-ayuda">JPG, PNG, GIF • Máx 5MB</Text>
      
      {/* Indica que hay foto guardada y el usuario aún no eligió nueva */}
      {preview && !archivoSeleccionado && (
        <Text size="xs" className="formulario-foto-guardada">
          Foto actual guardada
        </Text>
      )}
    </Box>
  );

  const renderCamposFormulario = () => (
    <Box className="formulario-campos-contenedor">
      <Text fw={700} size="lg" mb="md" className="formulario-titulo">
        {modo === 'editar' ? 'Editar Información Personal' : 'Nuevo Afiliado'}
      </Text>

      <SimpleGrid cols={2} spacing="md">
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
        <TextInput
          label="Dirección" placeholder="Av. Principal #123"
          value={formData.direccion}
          onChange={(e) => handleChange('direccion', e.target.value)}
          leftSection={<IconMapPin size={16} />}
          disabled={loading}
          className="input-base input-span-2"
        />
      </SimpleGrid>
    </Box>
  );

  const renderBotonesAccion = () => (
    <Group justify="flex-end" gap="md">
      <Button
        onClick={onCancel} disabled={loading}
        className="gp-btn-cerrar"
      >
        Cancelar
      </Button>
      <Button
        type="submit" loading={loading}
        className="gp-btn-reporte"
      >
        {loading ? 'Guardando...' : modo === 'editar' ? 'Guardar Cambios' : 'Crear Afiliado'}
      </Button>
    </Group>
  );

  // Render principal
  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">
        <Paper p="lg" withBorder radius="md" className="formulario-paper">
          <Group align="flex-start" gap="xl">
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