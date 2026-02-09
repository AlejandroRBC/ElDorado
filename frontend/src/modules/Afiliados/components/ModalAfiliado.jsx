import { Modal, Group, Text, Button, TextInput, Select, Checkbox, Stack, Box, Divider, rem, Alert } from '@mantine/core';
import { IconUpload, IconPhoto, IconX, IconAlertCircle } from '@tabler/icons-react';
import { useState, useEffect, useRef } from 'react';
import { useCrearAfiliado } from '../hooks/useCrearAfiliado';

const ModalAfiliado = ({ opened, onClose, onAfiliadoCreado }) => {
  const { crearAfiliadoCompleto, loading, error, success, reset } = useCrearAfiliado();
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

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
    fila_puesto: '',
    cuadra_puesto: '',
    nro_puesto: '',
    rubro_puesto: '',
    tiene_patente: false,
    foto: null,
    fotoPreview: null
  });

  // Estados para puestos
  const [cuadrasDisponibles, setCuadrasDisponibles] = useState([]);
  const [filasDisponibles, setFilasDisponibles] = useState([]);
  const [numerosDisponibles, setNumerosDisponibles] = useState([]);
  const [puestosCombinados, setPuestosCombinados] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [loadingPuestos, setLoadingPuestos] = useState(false);
  
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

  // Resetear cuando se abre/cierra
  useEffect(() => {
    if (opened) {
      resetForm();
      cargarEstructuraPuestos();
      reset();
      setLocalError('');
      setLocalSuccess('');
    }
  }, [opened]);

  useEffect(() => {
    if (success && !loading) {
      setLocalSuccess('Afiliado creado exitosamente');
      setTimeout(() => {
        resetForm();
        onClose();
        if (onAfiliadoCreado) {
          onAfiliadoCreado();
        }
      }, 1500);
    }
  }, [success, loading]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const cargarEstructuraPuestos = async () => {
    setLoadingPuestos(true);
    try {
      // TODO: Cambiar por API real
      const estructuraSimulada = {
        '1ra cuadra': { A: [101, 102, 103, 104, 105], B: [106, 107, 108, 109, 110] },
        '2da cuadra': { A: [201, 202, 203, 204, 205], B: [206, 207, 208, 209, 210] },
        '3ra cuadra': { A: [301, 302, 303, 304, 305], B: [306, 307, 308, 309, 310] },
        '4ta cuadra': { A: [401, 402, 403, 404, 405], B: [406, 407, 408, 409, 410] },
        'callejon': { A: [501, 502, 503, 504, 505] }
      };

      const puestosOcupados = ['101-A-1ra cuadra', '102-A-1ra cuadra'];
      
      const puestosDisponiblesFiltrados = {};
      Object.keys(estructuraSimulada).forEach(cuadra => {
        puestosDisponiblesFiltrados[cuadra] = {};
        Object.keys(estructuraSimulada[cuadra]).forEach(fila => {
          puestosDisponiblesFiltrados[cuadra][fila] = 
            estructuraSimulada[cuadra][fila].filter(numero => {
              const codigo = `${numero}-${fila}-${cuadra}`;
              return !puestosOcupados.includes(codigo);
            });
        });
      });

      setPuestosCombinados(puestosDisponiblesFiltrados);
      const cuadras = Object.keys(puestosDisponiblesFiltrados);
      setCuadrasDisponibles(cuadras.map(c => ({ value: c, label: c })));
      
    } catch (error) {
      console.error('Error cargando puestos:', error);
    } finally {
      setLoadingPuestos(false);
    }
  };

  // Lógica de selects dependientes
  useEffect(() => {
    if (formData.cuadra_puesto && puestosCombinados[formData.cuadra_puesto]) {
      const filas = Object.keys(puestosCombinados[formData.cuadra_puesto])
        .map(f => ({ value: f, label: `Fila ${f}` }));
      setFilasDisponibles(filas);
      
      if (!filas.some(f => f.value === formData.fila_puesto)) {
        setFormData(prev => ({ ...prev, fila_puesto: '', nro_puesto: '' }));
        setNumerosDisponibles([]);
      }
    } else {
      setFilasDisponibles([]);
      setNumerosDisponibles([]);
    }
  }, [formData.cuadra_puesto, puestosCombinados]);

  useEffect(() => {
    if (formData.cuadra_puesto && formData.fila_puesto && 
        puestosCombinados[formData.cuadra_puesto]?.[formData.fila_puesto]) {
      const numeros = puestosCombinados[formData.cuadra_puesto][formData.fila_puesto]
        .map(n => ({ value: n.toString(), label: `Puesto ${n}` }));
      setNumerosDisponibles(numeros);
      
      if (!numeros.some(n => n.value === formData.nro_puesto)) {
        setFormData(prev => ({ ...prev, nro_puesto: '' }));
      }
    } else {
      setNumerosDisponibles([]);
    }
  }, [formData.cuadra_puesto, formData.fila_puesto, puestosCombinados]);

  // Funciones para archivos
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

  const handleFileSelect = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('La imagen es demasiado grande (máximo 5MB)');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      foto: file,
      fotoPreview: URL.createObjectURL(file)
    }));
    setLocalError('');
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setLocalError('');
  };

  const handleSubmit = async () => {

    
    // Validaciones locales
    if (!formData.ci || !formData.nombre || !formData.paterno) {
      console.log('Validación falló: campos requeridos');
      setLocalError('Por favor complete los campos requeridos (CI, Nombre y Apellido Paterno)');
      return;
    }
    const resultado = await crearAfiliadoCompleto(formData);
    
    if (resultado.exito) {
      setLocalSuccess('Afiliado creado exitosamente');
    } else {
      console.log('Error:', resultado.error);
    }
  };

  const resetForm = () => {
    setFormData({
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
      fila_puesto: '',
      cuadra_puesto: '',
      nro_puesto: '',
      rubro_puesto: '',
      tiene_patente: false,
      foto: null,
      fotoPreview: null
    });
    setFilasDisponibles([]);
    setNumerosDisponibles([]);
    setIsDragging(false);
    setLocalError('');
    setLocalSuccess('');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      foto: null,
      fotoPreview: null
    }));
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      size="lg"
      title={
        <Group w="100%" gap="sm">
          <Text fw={700} size="lg">AÑADIR AFILIADO</Text>
          <Divider style={{ flex: 1 }} />
        </Group>
      }
      centered
      styles={{
        header: {
          padding: '12px 20px',
          borderBottom: '1px solid #eee'
        },
        body: {
          padding: '0'
        }
      }}
    >
      <Box p="md">
        {/* Mostrar errores */}
        {localError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error" 
            color="red" 
            mb="md"
            withCloseButton
            onClose={() => setLocalError('')}
          >
            {localError}
          </Alert>
        )}

        {/* Mostrar éxito */}
        {localSuccess && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Éxito" 
            color="green" 
            mb="md"
          >
            {localSuccess}
          </Alert>
        )}
        
        <Group align="flex-start" gap="lg">
          {/* Columna izquierda - Foto con drag & drop */}
          <Stack gap="md" style={{ width: '180px' }}>
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
                border: isDragging ? '2px solid #4CAF50' : formData.fotoPreview ? '2px solid #ddd' : '2px dashed #ddd',
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
              
              {formData.fotoPreview ? (
                <>
                  <img
                    src={formData.fotoPreview}
                    alt="Vista previa"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
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
                      minWidth: 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto();
                    }}
                  >
                    <IconX size={14} />
                  </Button>
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
          </Stack>

          {/* Columna derecha - Formulario */}
          <Stack gap="md" style={{ flex: 1 }}>
            {/* CI y Expedido */}
            <Group grow>
              <TextInput
                label="CI *"
                placeholder="1234567"
                value={formData.ci}
                onChange={(e) => handleChange('ci', e.target.value)}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
                disabled={loading}
                required
              />
              
              <Select
                label="Expedido *"
                data={departamentos}
                value={formData.extension}
                onChange={(value) => handleChange('extension', value)}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
                disabled={loading}
              />
            </Group>

            {/* Nombre y Apellidos */}
            <Group grow>
              <TextInput
                label="Nombre *"
                placeholder="Juan"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
                disabled={loading}
                required
              />
              
              <TextInput
                label="Paterno *"
                placeholder="Pérez"
                value={formData.paterno}
                onChange={(e) => handleChange('paterno', e.target.value)}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
                disabled={loading}
                required
              />
            </Group>

            {/* Materno y Sexo */}
            <Group grow>
              <TextInput
                label="Materno"
                placeholder="Velazco"
                value={formData.materno}
                onChange={(e) => handleChange('materno', e.target.value)}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
                disabled={loading}
              />
              
              <Select
                label="Sexo"
                data={sexos}
                value={formData.sexo}
                onChange={(value) => handleChange('sexo', value)}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
                disabled={loading}
              />
            </Group>

            {/* Fecha de Nacimiento */}
            <TextInput
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecNac}
              onChange={(e) => handleChange('fecNac', e.target.value)}
              styles={{
                input: {
                  backgroundColor: '#f6f8fe',
                  border: '1px solid #f6f8fe',
                  height: rem(36),
                }
              }}
              disabled={loading}
            />

            {/* Selects para el puesto - DIVIDIDO EN 3 */}
            <Group grow>
              {/* Cuadra */}
              <Select
                label="Cuadra"
                placeholder="Seleccionar cuadra"
                data={cuadrasDisponibles}
                value={formData.cuadra_puesto}
                onChange={(value) => handleChange('cuadra_puesto', value)}
                clearable
                disabled={loadingPuestos || loading}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
              />
              
              {/* Fila */}
              <Select
                label="Fila"
                placeholder="Seleccionar fila"
                data={filasDisponibles}
                value={formData.fila_puesto}
                onChange={(value) => handleChange('fila_puesto', value)}
                clearable
                disabled={!formData.cuadra_puesto || loadingPuestos || loading}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
              />
              
              {/* Número de puesto */}
              <Select
                label="Número"
                placeholder="Seleccionar número"
                data={numerosDisponibles}
                value={formData.nro_puesto}
                onChange={(value) => handleChange('nro_puesto', value)}
                clearable
                disabled={!formData.fila_puesto || loadingPuestos || loading}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
              />
            </Group>

            {/* Rubro y Checkbox en la misma fila */}
            <Group grow>
              <TextInput
                label="Rubro del Puesto"
                placeholder="Ej: Electrónicos, Ropa, etc."
                value={formData.rubro_puesto}
                onChange={(e) => handleChange('rubro_puesto', e.target.value)}
                styles={{
                  input: {
                    backgroundColor: '#f6f8fe',
                    border: '1px solid #f6f8fe',
                    height: rem(36),
                  }
                }}
                disabled={loading}
              />
              
              <Box style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                height: '100%',
                justifyContent: 'flex-end',
                paddingBottom: rem(4)
              }}>
                <Checkbox
                  label="¿Tiene Patente?"
                  checked={formData.tiene_patente}
                  onChange={(e) => handleChange('tiene_patente', e.target.checked)}
                  disabled={loading}
                  styles={{
                    label: {
                      color: '#0f0f0f',
                      fontWeight: 500,
                      fontSize: rem(14)
                    }
                  }}
                />
              </Box>
            </Group>
          </Stack>
        </Group>

        {/* Mostrar código generado si hay puesto seleccionado */}
        {formData.cuadra_puesto && formData.fila_puesto && formData.nro_puesto && (
          <Box mt="md" p="xs" style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <Text size="sm">
              <strong>Puesto a asignar:</strong> {formData.nro_puesto}-{formData.fila_puesto}-{formData.cuadra_puesto}
            </Text>
          </Box>
        )}

        {/* Botones */}
        <Group justify="flex-end" gap="md" mt="xl">
          <Button
            variant="outline"
            style={{
              backgroundColor: '#0f0f0f',
              color: 'white',
              border: '1px solid #0f0f0f',
              borderRadius: '100px',
              padding: '8px 24px',
              fontWeight: 500,
              height: rem(36),
            }}
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            style={{
              backgroundColor: '#EDBE3C',
              color: '#0f0f0f',
              borderRadius: '100px',
              padding: '8px 24px',
              fontWeight: 600,
              border: '1px solid #EDBE3C',
              height: rem(36),
              '&:hover': loading ? undefined : {
                backgroundColor: '#d4a933',
              }
            }}
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Aceptar'}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default ModalAfiliado;