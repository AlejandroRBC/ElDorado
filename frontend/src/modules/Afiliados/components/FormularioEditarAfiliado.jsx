import { TextInput, Select, Stack, Group, Box, Text, Button, Paper, SimpleGrid } from '@mantine/core';
import { IconPhoto, IconX, IconUser, IconId, IconPhone, IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useVistaPreviewImagen } from '../hooks/useVistaPreviewImagen';
import { getImageUrl } from '../../../utils/imageHelper';

// ── Opciones estáticas — fuera del componente ─────────────────
const DEPARTAMENTOS = [
  { value: 'LP', label: 'La Paz' },    { value: 'CB', label: 'Cochabamba' },
  { value: 'SC', label: 'Santa Cruz' }, { value: 'OR', label: 'Oruro' },
  { value: 'PT', label: 'Potosí' },    { value: 'TJ', label: 'Tarija' },
  { value: 'CH', label: 'Chuquisaca' }, { value: 'BE', label: 'Beni' },
  { value: 'PD', label: 'Pando' },
];

const SEXOS = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
];

const estiloInput = { input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' } };

// ── Helpers fuera del componente ──────────────────────────────

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

  let ciNumero  = afiliado.ci || '';
  let extension = 'LP';
 

  return {
    ci:            afiliado.ci_numero  || ciNumero,
    extension:     afiliado.extension  || extension,
    nombre:        afiliado.nombre     || '',
    paterno:       afiliado.paterno    || '',
    materno:       afiliado.materno    || '',
    sexo:
      afiliado.sexo === 'Masculino' ? 'M'
      : afiliado.sexo === 'Femenino' ? 'F'
      : afiliado.sexo || 'M',
    fecNac:        afiliado.fecNac        ? afiliado.fecNac.split('T')[0] : '',
    telefono:      afiliado.telefono      || '',
    ocupacion:     afiliado.ocupacion     || '',
    direccion:     afiliado.direccion     || '',
    es_habilitado: afiliado.es_habilitado === 1 || afiliado.es_habilitado === true,
  };
};

const FormularioEditarAfiliado = ({
  afiliado,
  onSubmit,
  onCancel,
  loading = false,
  modo    = 'editar',
}) => {
  // Estado inicializado directamente desde props — sin useEffect.
  const [formData, setFormData] = useState(() => computarFormData(afiliado));

  // URL de la foto actual derivada antes de llamar al hook,
  // para que useVistaPreviewImagen la reciba como urlInicial.
  const urlFotoInicial = resolverUrlFoto(afiliado);

  // ── Hook de preview ───────────────────────────────────────
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
    urlInicial:     urlFotoInicial,
    alReportarError: (msg) =>
      notifications.show({ title: 'Error', message: msg, color: 'red' }),
  });

  const handleChange  = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit  = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, foto: archivoSeleccionado });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">

        {/* SECCIÓN: FOTO DE PERFIL + DATOS */}
        <Paper p="lg" withBorder radius="md">
          <Group align="flex-start" gap="xl">

            {/* Zona de foto con drag & drop */}
            <Box style={{ width: '180px' }}>
              <Text fw={600} size="sm" mb="xs">Foto de Perfil</Text>

              <Box
                {...propsDragDrop}
                style={{
                  width: '180px', height: '180px',
                  borderRadius: '10px', overflow: 'hidden',
                  position: 'relative',
                  border:           isDragging ? '2px solid #4CAF50' : preview ? '2px solid #ddd' : '2px dashed #ddd',
                  backgroundColor:  isDragging ? '#f0fff0' : '#f9f9f9',
                  cursor:           'pointer',
                  display:          'flex',
                  alignItems:       'center',
                  justifyContent:   'center',
                  transition:       'all 0.2s',
                }}
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
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        // Solo reemplazar si es una URL externa rota
                        if (esUrlExterna) {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#999">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                            </div>`;
                        }
                      }}
                    />

                    {/* Botón eliminar */}
                    <Button
                      variant="subtle" size="xs"
                      aria-label="Eliminar foto"
                      style={{
                        position: 'absolute', top: '5px', right: '5px',
                        backgroundColor: 'rgba(0,0,0,0.7)', color: 'white',
                        padding: '2px 6px', minWidth: 'auto',
                        borderRadius: '4px', zIndex: 10,
                      }}
                      onClick={(e) => { e.stopPropagation(); alEliminarFoto(); }}
                    >
                      <IconX size={14} />
                    </Button>

                    {/* Indicador de foto nueva */}
                    {esBlobNuevo && (
                      <Box style={{
                        position: 'absolute', bottom: '5px', left: '5px',
                        backgroundColor: '#4CAF50', color: 'white',
                        padding: '2px 8px', borderRadius: '4px',
                        fontSize: '10px', fontWeight: 'bold',
                      }}>
                        NUEVA
                      </Box>
                    )}
                  </>
                ) : (
                  <Stack align="center" gap="xs" style={{ textAlign: 'center' }}>
                    <IconPhoto size={40} style={{ color: isDragging ? '#4CAF50' : '#999' }} />
                    <Text size="xs" style={{ color: isDragging ? '#4CAF50' : '#666', maxWidth: '120px' }}>
                      {isDragging ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen'}
                    </Text>
                  </Stack>
                )}
              </Box>

              <Text size="xs" c="dimmed" mt={5} ta="center">JPG, PNG, GIF • Máx 5MB</Text>
              {/* Indica que hay foto guardada y el usuario aún no eligió nueva */}
              {preview && !archivoSeleccionado && (
                <Text size="xs" c="dimmed" mt={5} ta="center">Foto actual guardada</Text>
              )}
            </Box>

            {/* Campos del formulario ──────────────────────── */}
            <Box style={{ flex: 1 }}>
              <Text fw={700} size="lg" mb="md">
                {modo === 'editar' ? 'Editar Información Personal' : 'Nuevo Afiliado'}
              </Text>

              <SimpleGrid cols={2} spacing="md">
                <TextInput
                  label="CI *" placeholder="1234567"
                  value={formData.ci}
                  onChange={(e) => handleChange('ci', e.target.value)}
                  leftSection={<IconId size={16} />}
                  required disabled={loading} styles={estiloInput}
                />
                <Select
                  label="Expedido *" data={DEPARTAMENTOS}
                  value={formData.extension}
                  onChange={(v) => handleChange('extension', v)}
                  disabled={loading} styles={estiloInput}
                />
                <TextInput
                  label="Nombre *" placeholder="Juan"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  leftSection={<IconUser size={16} />}
                  required disabled={loading} styles={estiloInput}
                />
                <TextInput
                  label="Paterno" placeholder="Pérez"
                  value={formData.paterno}
                  onChange={(e) => handleChange('paterno', e.target.value)}
                  disabled={loading} styles={estiloInput}
                />
                <TextInput
                  label="Materno" placeholder="García"
                  value={formData.materno}
                  onChange={(e) => handleChange('materno', e.target.value)}
                  disabled={loading} styles={estiloInput}
                />
                <Select
                  label="Sexo" data={SEXOS}
                  value={formData.sexo}
                  onChange={(v) => handleChange('sexo', v)}
                  disabled={loading} styles={estiloInput}
                />
                <TextInput
                  label="Fecha de Nacimiento" type="date"
                  value={formData.fecNac}
                  onChange={(e) => handleChange('fecNac', e.target.value)}
                  leftSection={<IconCalendar size={16} />}
                  disabled={loading} styles={estiloInput}
                />
                <TextInput
                  label="Teléfono" placeholder="76543210"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  leftSection={<IconPhone size={16} />}
                  disabled={loading} styles={estiloInput}
                />
                <TextInput
                  label="Ocupación" placeholder="Comerciante"
                  value={formData.ocupacion}
                  onChange={(e) => handleChange('ocupacion', e.target.value)}
                  disabled={loading} styles={estiloInput}
                />
                <TextInput
                  label="Dirección" placeholder="Av. Principal #123"
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  leftSection={<IconMapPin size={16} />}
                  disabled={loading} style={{ gridColumn: 'span 2' }}
                  styles={estiloInput}
                />
              </SimpleGrid>
            </Box>
          </Group>
        </Paper>

        {/* BOTONES DE ACCIÓN ──────────────────────────────── */}
        <Group justify="flex-end" gap="md">
          <Button
            variant="outline" onClick={onCancel} disabled={loading} size="md"
            style={{ borderColor: '#0f0f0f', color: '#0f0f0f', borderRadius: '100px', padding: '0 30px', height: '45px' }}
          >
            Cancelar
          </Button>
          <Button
            type="submit" loading={loading} size="md"
            style={{ backgroundColor: '#edbe3c', color: '#0f0f0f', borderRadius: '100px', padding: '0 30px', height: '45px', fontWeight: 600 }}
          >
            {loading ? 'Guardando...' : modo === 'editar' ? 'Guardar Cambios' : 'Crear Afiliado'}
          </Button>
        </Group>

      </Stack>
    </form>
  );
};

export default FormularioEditarAfiliado;