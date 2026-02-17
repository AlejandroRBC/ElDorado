import { Paper, Container, Title, Text, Button, Group, Stack, Box, Badge, LoadingOverlay, Alert } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconFileReport, IconEdit, IconPlus, IconTransfer, IconAlertCircle, IconUserOff, IconUserCheck  } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { useAfiliado } from '../hooks/useAfiliado';
import { useState, useCallback } from 'react';

import {getPerfilUrl} from '../../../utils/imageHelper';
import TablaPuestos from './TablaPuestos';
import ModalAsignarPuesto from './ModalAsignarPuesto';
import ModalDesafiliarAfiliado from './ModalDesafiliarAfiliado';


const DetallesAfiliado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Usar hook para obtener datos reales del afiliado
  const { afiliado, cargando, error, cargarAfiliado } = useAfiliado(id);
  const [modalPuestoAbierto, setModalPuestoAbierto] = useState(false);

  // para refrescar los puestos
  const [refreshPuestos, setRefreshPuestos] = useState(0);
  const handlePuestoAsignado = useCallback(() => {
    cargarAfiliado();
    setRefreshPuestos(prev => prev + 1);
    setModalPuestoAbierto(false);
  }, [cargarAfiliado]);

  const [modalDesafiliarAbierto, setModalDesafiliarAbierto] = useState(false);
  const [cargandoDesafiliar, setCargandoDesafiliar] = useState(false);


  const handleDesafiliar = async () => {
    try {
      setCargandoDesafiliar(true);
      
      const response = await fetch(`http://localhost:3000/api/afiliados/${id}/deshabilitar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ es_habilitado: 0 }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Error al desafiliar');
      }
  
      notifications.show({
        title: '✅ Afiliado Desafiliado',
        message: 'El afiliado ha sido deshabilitado y sus puestos han sido despojados',
        color: 'green',
        autoClose: 5000
      });
  
      setModalDesafiliarAbierto(false);
      cargarAfiliado(); // Recargar datos para reflejar el cambio
      
    } catch (err) {
      notifications.show({
        title: '❌ Error',
        message: err.message,
        color: 'red'
      });
    } finally {
      setCargandoDesafiliar(false);
    }
  };
  

  // Si no hay afiliado y no está cargando, mostrar mensaje
  if (!cargando && !afiliado && !error) {
    return (
      <Container fluid p="md">
        <Group justify="space-between" mb="xl">
          <Title order={1} style={{ color: '#0f0f0f' }}>
            Afiliado no encontrado
          </Title>
          <Button
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate('/afiliados')}
            style={{
              backgroundColor: '#0f0f0f',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            Volver a la lista
          </Button>
        </Group>
        <Paper p="xl" radius="lg" style={{ backgroundColor: 'white', textAlign: 'center', padding: '50px' }}>
          <Text size="lg" style={{ color: '#666' }}>
            El afiliado con ID {id} no existe o ha sido eliminado.
          </Text>
          <Button 
            onClick={() => navigate('/afiliados')}
            style={{ marginTop: '20px' }}
          >
            Ver todos los afiliados
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container fluid p="md">
      {/* Header con botón de volver */}
      <Group justify="space-between" mb="xl">
        <Title order={1} style={{ color: '#0f0f0f' }}>
          Detalle Afiliado
        </Title>
        <Button
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate('/afiliados')}
          style={{
            backgroundColor: '#0f0f0f',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 500,
          }}
        >
          Volver a la lista
        </Button>
      </Group>

      <Paper 
        p="xl" 
        radius="lg" 
        style={{ 
          backgroundColor: 'white',
          minHeight: '70vh',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        {/* Loading overlay */}
        <LoadingOverlay 
          visible={cargando} 
          zIndex={1000}
          overlayProps={{ blur: 2 }}
        />
        
        {/* Mostrar error si existe */}
        {error && !cargando && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error" 
            color="red" 
            mb="md"
          >
            {error}
            <Button 
              variant="subtle" 
              size="xs" 
              onClick={() => cargarAfiliado()}
              style={{ marginLeft: '10px' }}
            >
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Botones de acción superiores */}
        <Group justify="flex-start" mb="xl">
          <Group gap="md">
            <Button
              leftSection={<IconFileReport size={18} />}
              style={{
                backgroundColor: '#0f0f0f',
                color: 'white',
                borderRadius: '100px',
                fontWeight: 500,
                padding: '10px 20px',
              }}
              onClick={() => alert('Funcionalidad en desarrollo')}
            >
              Generar Reporte Total del Afiliado
            </Button>
            
            <Button
              leftSection={<IconEdit size={18} />}
              component="a"
                href={`/afiliados/editar/${id}`}
              style={{
                backgroundColor: '#0f0f0f',
                color: 'white',
                borderRadius: '100px',
                fontWeight: 500,
                padding: '10px 20px',
              }}
              
            >
              Editar Perfil de Afiliado
            </Button>
            {/* Botón de desafiliar - solo mostrar si está habilitado */}
            {afiliado?.es_habilitado === 1 && (
              <Button
                leftSection={<IconUserOff size={18} />}
                onClick={() => setModalDesafiliarAbierto(true)}
                style={{
                  backgroundColor: '#F44336',
                  color: 'white',
                  borderRadius: '100px',
                  fontWeight: 500,
                  padding: '10px 20px',
                  border: '2px solid #F44336'
                }}
              >
                Desafiliar Afiliado
              </Button>
            )}

            {/* Si está deshabilitado, mostrar botón para rehabilitar (opcional) */}
            {afiliado?.es_habilitado === 0 && (
              <Button
                leftSection={<IconUserCheck size={18} />}
                onClick={() => {/* implementar rehabilitación */}}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: '100px',
                  fontWeight: 500,
                  padding: '10px 20px',
                }}
              >
                Rehabilitar Afiliado
              </Button>
            )}
          </Group>
        </Group>

        {/* Información del afiliado (estilo card sin botones) - Solo mostrar si hay datos */}
        {afiliado && (
          <>
            <Paper
              p="lg"
              mb="xl"
            >
              <Group align="flex-start" gap="lg">
                {/* Foto de perfil */}
                <Box
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    
                    
                    flexShrink: 0,
                  }}
                >
                  <img src={getPerfilUrl(afiliado)} alt="Perfil" 

                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
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
                    }}
                  />
                </Box>

                {/* Información del afiliado */}
                <Stack gap={8} style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text fw={700} size="xl" style={{ color: '#0f0f0f' }}>
                        {afiliado.nombreCompleto || afiliado.nombre}
                      </Text>
                      
                      <Text>
                        CI: {afiliado.ci}
                      </Text>
                    </Box>                    
                  </Group>

                  {/* Puestos y rubro */}
                  <Group gap="xl" mt="md">
                    <Box>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginBottom: '6px' }}>
                        Puestos Actuales:
                      </Text>
                      <Group gap={6} wrap="wrap">
                        {afiliado.patentes && afiliado.patentes.length > 0 ? (
                          afiliado.patentes.map((puesto, index) => (
                            <Badge
                              key={index}
                              size="sm"
                              style={{
                                backgroundColor: '#EDBE3C',
                                color: '#0f0f0f',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '4px',
                              }}
                            >
                              {puesto}
                            </Badge>
                          ))
                        ) : (
                          <Text size="sm" style={{ color: '#999', fontStyle: 'italic' }}>
                            Sin puestos asignados
                          </Text>
                        )}
                      </Group>
                    </Box>
                    
                    <Box>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginBottom: '2px' }}>
                        Ocupación:
                      </Text>
                      <Text size="sm" style={{ color: '#666' }}>
                        {afiliado.ocupacion || afiliado.rubro || 'No especificado'}
                      </Text>
                    </Box>
                  </Group>
                  
                  {/* Información adicional */}
                  <Group gap="xl" mt="md">
                    <Stack gap={4}>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>
                        Contacto:
                      </Text>
                      <Text size="sm" style={{ color: '#666' }}>
                        {afiliado.telefono || 'No especificado'}
                      </Text>
                      
                    </Stack>
                    
                    <Stack gap={4}>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>
                        Dirección:
                      </Text>
                      <Text size="sm" style={{ color: '#666' }}>
                        {afiliado.direccion || 'No especificado'}
                      </Text>
                    </Stack>
                    
                    <Stack gap={4}>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>
                        Fecha Afiliacion:
                      </Text>
                      <Text size="sm" style={{ color: '#666' }}>
                        {afiliado.fecha_afiliacion ? 
                          new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES') : 
                          'No especificado'}
                      </Text>
                    </Stack>
                    
                    {/* Información adicional si está disponible */}
                    {afiliado.edad && (
                      <Stack gap={4}>
                        <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>
                          Edad:
                        </Text>
                        <Text size="sm" style={{ color: '#666' }}>
                          {afiliado.edad} años
                        </Text>
                      </Stack>
                    )}
                    
                    {afiliado.sexo && (
                      <Stack gap={4}>
                        <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>
                          Sexo:
                        </Text>
                        <Text size="sm" style={{ color: '#666' }}>
                          {afiliado.sexo}
                        </Text>
                      </Stack>
                    )}
                  </Group>
                </Stack>
              </Group>
            </Paper>

            {/* Sección de Puestos del Afiliado */}
            <Box>
              <Group justify="space-between" align="center" mb="md">
                <Title order={2} style={{ color: '#0f0f0f', fontSize: '1.5rem' }}>
                  Detalles de Puestos de Afiliado
                </Title>
                
                {/* Botones para puestos */}
                <Group gap="md">
                <Button
                  leftSection={<IconPlus size={18} />}
                  style={{
                    backgroundColor: '#0f0f0f',
                    color: 'white',
                    borderRadius: '100px',
                    fontWeight: 500,
                    border: '2px solid #0f0f0f',
                    padding: '8px 16px',
                  }}
                  onClick={() => setModalPuestoAbierto(true)}  
                >
                  Añadir Puesto
                </Button>
                <ModalAsignarPuesto
                  opened={modalPuestoAbierto}
                  onClose={() => setModalPuestoAbierto(false)}
                  idAfiliado={id}
                  onPuestoAsignado={() => {
                    cargarAfiliado(); // Recargar datos del afiliado
                    setModalPuestoAbierto(false);
                  }, handlePuestoAsignado}
                />
                  <Button
                    leftSection={<IconTransfer size={18} />}
                    style={{
                      backgroundColor: '#0f0f0f',
                      color: 'white',
                      borderRadius: '100px',
                      fontWeight: 500,
                      border: '2px solid #0f0f0f',
                      padding: '8px 16px',
                    }}
                    onClick={() => alert('Funcionalidad en desarrollo')}
                  >
                    Realizar Traspaso
                  </Button>
                </Group>
              </Group>

              {/* Tabla de puestos */}
              <TablaPuestos afiliadoId={afiliado.id} key={refreshPuestos}  />
              </Box>

              
              <ModalDesafiliarAfiliado
                opened={modalDesafiliarAbierto}
                onClose={() => setModalDesafiliarAbierto(false)}
                afiliado={afiliado}
                onConfirmar={handleDesafiliar}
                loading={cargandoDesafiliar}
              />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DetallesAfiliado;