import { TextInput, Select, Stack, Group, Box, Text, Button, Divider, Paper, Checkbox, SimpleGrid } from '@mantine/core';
import { IconUpload, IconPhoto, IconX, IconUser, IconId, IconPhone, IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';
import { notifications } from '@mantine/notifications';

const FormularioEditarAfiliado = ({ 
  afiliado, 
  onSubmit, 
  onCancel, 
  loading = false,
  modo = 'editar'
}) => {
  const [formData, setFormData] = useState({
    ci: '',
    extension: 'LP',
    nombre: '',
    paterno: '',
    materno: '',
    sexo: 'M',
    fecNac: '',
    telefono: '',
    ocupacion: '',
    direccion: '',
    es_habilitado: true,
    foto: null,
    fotoPreview: null,
    fotoActual: null 
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const departamentos = [
    { value: 'LP', label: 'La Paz' },
    { value: 'CB', label: 'Cochabamba' },
    { value: 'SC', label: 'Santa Cruz' },
    { value: 'OR', label: 'Oruro' },
    { value: 'PT', label: 'Potosí' },
    { value: 'TJ', label: 'Tarija' },
    { value: 'CH', label: 'Chuquisaca' },
    { value: 'BE', label: 'Beni' },
    { value: 'PD', label: 'Pando' }
  ];

  const sexos = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' }
  ];

  // Cargar datos del afiliado cuando cambia
  useEffect(() => {
    if (afiliado) {
      // Extraer CI y extensión
      let ciNumero = afiliado.ci || '';
      let extension = 'LP';
      
      if (ciNumero.includes('-')) {
        const partes = ciNumero.split('-');
        ciNumero = partes[0];
        extension = partes[1] || 'LP';
      }

      // ✅ CORREGIDO: Manejar URL de imagen correctamente
      let fotoPreview = null;
      if (afiliado.url_perfil && !afiliado.url_perfil.includes('sinPerfil.png')) {
        // Si es URL completa del backend o ruta relativa
        fotoPreview = afiliado.url_perfil.startsWith('http') 
          ? afiliado.url_perfil 
          : `http://localhost:3000${afiliado.url_perfil}`;
      }

      setFormData({
        ci: afiliado.ci_numero || ciNumero,
        extension: afiliado.extension || extension,
        nombre: afiliado.nombre || '',
        paterno: afiliado.paterno || '',
        materno: afiliado.materno || '',
        sexo: afiliado.sexo === 'Masculino' ? 'M' : (afiliado.sexo === 'Femenino' ? 'F' : (afiliado.sexo || 'M')),
        fecNac: afiliado.fecNac ? afiliado.fecNac.split('T')[0] : '',
        telefono: afiliado.telefono || '',
        ocupacion: afiliado.ocupacion || '',
        direccion: afiliado.direccion || '',
        es_habilitado: afiliado.es_habilitado === 1 || afiliado.es_habilitado === true,
        foto: null,
        fotoPreview: fotoPreview, // 👈 URL válida para <img>
        fotoActual: fotoPreview    // 👈 Guardar para comparar
      });
    }
  }, [afiliado]);

  // ✅ CORREGIDO: Manejar selección de archivo
  const handleFileSelect = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: 'Error',
        message: 'La imagen es demasiado grande (máximo 5MB)',
        color: 'red'
      });
      return;
    }
    
    // Crear URL solo para el objeto File (NO para URLs HTTP)
    const previewUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      foto: file,
      fotoPreview: previewUrl // ✅ Ahora es un objeto URL.createObjectURL válido
    }));
  };

  // ✅ CORREGIDO: Limpiar URLs objeto al desmontar
  useEffect(() => {
    return () => {
      // Limpiar URLs creadas con createObjectURL
      if (formData.fotoPreview && formData.fotoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.fotoPreview);
      }
    };
  }, [formData.fotoPreview]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ✅ CORREGIDO: Eliminar foto
  const removePhoto = () => {
    // Limpiar URL objeto si existe
    if (formData.fotoPreview && formData.fotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.fotoPreview);
    }
    
    setFormData(prev => ({
      ...prev,
      foto: null,
      fotoPreview: prev.fotoActual || null // Volver a la foto original
    }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // ✅ Determinar qué mostrar en el preview
  const previewImage = formData.fotoPreview;
  const isBlobUrl = previewImage?.startsWith('blob:');
  const isHttpUrl = previewImage?.startsWith('http');

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">
        {/* SECCIÓN: FOTO DE PERFIL */}
        <Paper p="lg" withBorder radius="md">
          <Group align="flex-start" gap="xl">
            {/* Área de foto con drag & drop */}
            <Box style={{ width: '180px' }}>
              <Text fw={600} size="sm" mb="xs">Foto de Perfil</Text>
              <Box
                ref={dropZoneRef}
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: isDragging ? '2px solid #4CAF50' : previewImage ? '2px solid #ddd' : '2px dashed #ddd',
                  backgroundColor: isDragging ? '#f0fff0' : '#f9f9f9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Vista previa"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // Si la imagen HTTP falla, mostrar placeholder
                        if (isHttpUrl) {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="
                              width: 100%;
                              height: 100%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              background: #f5f5f5;
                            ">
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#999">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                    {/* Botón para eliminar foto */}
                    <Button
                      variant="subtle"
                      size="xs"
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 6px',
                        minWidth: 'auto',
                        borderRadius: '4px',
                        zIndex: 10
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto();
                      }}
                    >
                      <IconX size={14} />
                    </Button>
                    
                    {/* Indicador de foto nueva */}
                    {isBlobUrl && (
                      <Box
                        style={{
                          position: 'absolute',
                          bottom: '5px',
                          left: '5px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                      >
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
              <Text size="xs" c="dimmed" mt={5} ta="center">
                JPG, PNG, GIF • Máx 5MB
              </Text>
              {formData.fotoActual && !formData.foto && (
                <Text size="xs" c="dimmed" mt={5} ta="center">
                  Foto actual guardada
                </Text>
              )}
            </Box>

            {/* Resto del formulario... */}
            <Box style={{ flex: 1 }}>
              <Text fw={700} size="lg" mb="md">
                {modo === 'editar' ? 'Editar Información Personal' : 'Nuevo Afiliado'}
              </Text>
              
              <SimpleGrid cols={2} spacing="md">
                {/* CI y Extensión */}
                <TextInput
                  label="CI *"
                  placeholder="1234567"
                  value={formData.ci}
                  onChange={(e) => handleChange('ci', e.target.value)}
                  leftSection={<IconId size={16} />}
                  required
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />
                
                <Select
                  label="Expedido *"
                  data={departamentos}
                  value={formData.extension}
                  onChange={(value) => handleChange('extension', value)}
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />

                {/* Nombre y Apellidos */}
                <TextInput
                  label="Nombre *"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  leftSection={<IconUser size={16} />}
                  required
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />
                
                <TextInput
                  label="Paterno *"
                  placeholder="Pérez"
                  value={formData.paterno}
                  onChange={(e) => handleChange('paterno', e.target.value)}
                  required
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />

                <TextInput
                  label="Materno"
                  placeholder="García"
                  value={formData.materno}
                  onChange={(e) => handleChange('materno', e.target.value)}
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />

                <Select
                  label="Sexo"
                  data={sexos}
                  value={formData.sexo}
                  onChange={(value) => handleChange('sexo', value)}
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />

                {/* Fecha de Nacimiento */}
                <TextInput
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.fecNac}
                  onChange={(e) => handleChange('fecNac', e.target.value)}
                  leftSection={<IconCalendar size={16} />}
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />

                {/* Teléfono */}
                <TextInput
                  label="Teléfono"
                  placeholder="76543210"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  leftSection={<IconPhone size={16} />}
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />

                {/* Ocupación */}
                <TextInput
                  label="Ocupación"
                  placeholder="Comerciante"
                  value={formData.ocupacion}
                  onChange={(e) => handleChange('ocupacion', e.target.value)}
                  disabled={loading}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />

                {/* Dirección (ocupa 2 columnas) */}
                <TextInput
                  label="Dirección"
                  placeholder="Av. Principal #123"
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  leftSection={<IconMapPin size={16} />}
                  disabled={loading}
                  style={{ gridColumn: 'span 2' }}
                  styles={{
                    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe' }
                  }}
                />
              </SimpleGrid>

              {/* Estado del afiliado */}
              {modo === 'editar' && (
                <Box mt="md">
                  <Divider my="md" />
                  <Checkbox
                    label="Afiliado habilitado"
                    description="Desmarca esta opción para deshabilitar el afiliado"
                    checked={formData.es_habilitado}
                    onChange={(e) => handleChange('es_habilitado', e.target.checked)}
                    disabled={loading}
                  />
                </Box>
              )}
            </Box>
          </Group>
        </Paper>

        {/* BOTONES DE ACCIÓN */}
        <Group justify="flex-end" gap="md">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            size="md"
            style={{
              borderColor: '#0f0f0f',
              color: '#0f0f0f',
              borderRadius: '100px',
              padding: '0 30px',
              height: '45px'
            }}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            size="md"
            style={{
              backgroundColor: '#edbe3c',
              color: '#0f0f0f',
              borderRadius: '100px',
              padding: '0 30px',
              height: '45px',
              fontWeight: 600
            }}
          >
            {loading ? 'Guardando...' : modo === 'editar' ? 'Guardar Cambios' : 'Crear Afiliado'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default FormularioEditarAfiliado;