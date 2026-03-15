import { Paper, Container, Title, Text, Button, Group, Stack, Box, Badge, LoadingOverlay, Alert, Loader } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { IconHistory,IconFilePencil, IconArrowLeft, IconEdit, IconPlus, IconTransfer, IconAlertCircle, IconUserOff, IconUserCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAfiliado } from '../hooks/useAfiliado';
import { useState, useCallback, lazy, Suspense } from 'react';
import { useDesafiliarAfiliado } from '../hooks/useDesafiliarAfiliado';
import { getPerfilUrl } from '../../../utils/imageHelper';
import TablaPuestos from './TablaPuestos';
import ModalDesafiliarAfiliado from './ModalDesafiliarAfiliado';
import { ModalTraspaso } from '../../GestionPatentesPuestos/components/ModalTraspaso';
import { useTraspasoDesdeAfiliado } from '../hooks/useTraspasoDesdeAfiliado';
import { usePDFExport } from '../hooks/usePDFExport';

import ModalHistorialAfiliado from './ModalHistorialAfiliado';
import { useHistorialAfiliado }from '../hooks/useHistorialAfiliado';
import {handleAbrirHistorial,handleCerrarHistorial,} from '../handlers/historialHandlers';
 
//Con lazy(), el chunk no se
// descarga hasta que el usuario pulsa "Añadir Puesto".
const ModalAsignarPuesto = lazy(() => import('./ModalAsignarPuesto'));
const CargandoModal = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Loader size="sm" />
  </div>
);

const DetallesAfiliado = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { afiliado, cargando, error, cargarAfiliado } = useAfiliado(id);
  const [modalPuestoAbierto, setModalPuestoAbierto] = useState(false);
  const [modalDesafiliarAbierto, setModalDesafiliarAbierto] = useState(false);
  const { desafiliar, cargando: cargandoDesafiliar } = useDesafiliarAfiliado();
  const [refreshPuestos, setRefreshPuestos] = useState(0);
  const { exportando, exportarDetalleAfiliado } = usePDFExport();

  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const { historial, cargando: cargandoHistorial, error: errorHistorial, cargarHistorial, limpiarHistorial } = useHistorialAfiliado();
 



  const handleGenerarPDF = () => exportarDetalleAfiliado(id);

  const handlePuestoAsignado = useCallback(() => {
    cargarAfiliado();
    setRefreshPuestos((prev) => prev + 1);
    setModalPuestoAbierto(false);
  }, [cargarAfiliado]);

  const {
    modalTraspasoAbierto,
    puestoParaTraspaso,
    abrirModalTraspaso,
    cerrarModalTraspaso,
    ejecutarTraspaso,
  } = useTraspasoDesdeAfiliado();

  const handleTraspaso = (puesto, onSuccess) => {
    if (!puesto?.id_puesto) {
      notifications.show({ title: '❌ Error', message: 'El puesto seleccionado no es válido', color: 'red' });
      return;
    }
    abrirModalTraspaso({
      id_puesto:     puesto.id_puesto,
      nroPuesto:     puesto.nroPuesto,
      fila:          puesto.fila,
      cuadra:        puesto.cuadra,
      rubro:         puesto.rubro,
      tiene_patente: puesto.tiene_patente,
    }, onSuccess);
  };

  const refrescarDatosAfiliado = () => {
    cargarAfiliado();
    setRefreshPuestos((prev) => prev + 1);
    notifications.show({ title: '🔄 Actualizado', message: 'Los datos se han actualizado', color: 'blue', autoClose: 2000 });
  };

  const handleDesafiliar = async () => {
    const resultado = await desafiliar(id);
    if (resultado.exito) {
      setModalDesafiliarAbierto(false);
      setTimeout(() => navigate('/afiliados'), 100);
    }
  };

  if (!cargando && !afiliado && !error) {
    return (
      <Container fluid p="md">
        <Group justify="space-between" mb="xl">
          <Title order={1} style={{ color: '#0f0f0f' }}>Afiliado no encontrado</Title>
          <Button leftSection={<IconArrowLeft size={18} />} onClick={() => navigate('/afiliados')} style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '8px', fontWeight: 500 }}>
            Volver a la lista
          </Button>
        </Group>
        <Paper p="xl" radius="lg" style={{ backgroundColor: 'white', textAlign: 'center', padding: '50px' }}>
          <Text size="lg" style={{ color: '#666' }}>El afiliado con ID {id} no existe o ha sido eliminado.</Text>
          <Button onClick={() => navigate('/afiliados')} style={{ marginTop: '20px' }}>Ver todos los afiliados</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container fluid p="md">
      <Group justify="space-between" mb="xl">
        <Title order={1} fw={800} style={{ color: '#0f0f0f' }}>Detalle Afiliado</Title>
        <Button leftSection={<IconArrowLeft size={18} />} onClick={() => navigate('/afiliados')} style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '8px', fontWeight: 500 }}>
          Volver a la lista
        </Button>
      </Group>

      <Paper p="xl" radius="lg" style={{ backgroundColor: 'white', minHeight: '70vh', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
        <LoadingOverlay visible={cargando} zIndex={1000} overlayProps={{ blur: 2 }} />

        {error && !cargando && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {error}
            <Button variant="subtle" size="xs" onClick={() => cargarAfiliado()} style={{ marginLeft: '10px' }}>Reintentar</Button>
          </Alert>
        )}

        {/* Botones de acción superiores */}
        <Group justify="flex-start" mb="xl">
          <Group gap="md">
            <Button
              leftSection={<IconFilePencil size={18} />}
              loading={exportando}
              onClick={handleGenerarPDF}
              style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '100px', fontWeight: 500, padding: '10px 20px' }}
            >
              {exportando ? 'Generando PDF...' : 'Generar Reporte PDF'}
            </Button>

            <Button
              leftSection={<IconEdit size={18} />}
              component="a"
              href={`/afiliados/editar/${id}`}
              style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '100px', fontWeight: 500, padding: '10px 20px' }}
            >
              Editar Perfil de Afiliado
            </Button>
            <Button
              leftSection={<IconHistory size={18} />}
              onClick={() => handleAbrirHistorial(setModalHistorialAbierto, cargarHistorial, id)}
              style={{
                backgroundColor: '#0f0f0f',
                color:           'white',
                borderRadius:    '100px',
                fontWeight:      500,
                padding:         '10px 20px',
              }}
            >
              Historial del Afiliado
            </Button>

            {afiliado?.es_habilitado === 1 && (
              <Button
                leftSection={<IconUserOff size={18} />}
                onClick={() => setModalDesafiliarAbierto(true)}
                style={{ backgroundColor: '#F44336', color: 'white', borderRadius: '100px', fontWeight: 500, padding: '10px 20px', border: '2px solid #F44336' }}
              >
                Desafiliar Afiliado
              </Button>
            )}
            

            {afiliado?.es_habilitado === 0 && (
              <Button
                leftSection={<IconUserCheck size={18} />}
                onClick={() => {/* implementar rehabilitación */}}
                style={{ backgroundColor: '#4CAF50', color: 'white', borderRadius: '100px', fontWeight: 500, padding: '10px 20px' }}
              >
                Rehabilitar Afiliado
              </Button>
            )}
          </Group>
        </Group>

        {afiliado && (
          <>
            {/* Información del afiliado */}
            <Paper p="lg" mb="xl">
              <Group align="flex-start" gap="lg">
                <Box style={{ width: '200px', height: '200px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={getPerfilUrl(afiliado)}
                    alt={`Foto de perfil de ${afiliado.nombre} ${afiliado.paterno}`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#999">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                </Box>

                <Stack gap={8} style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text fw={700} size="xl" style={{ color: '#0f0f0f' }}>
                        {afiliado.nombreCompleto || afiliado.nombre}
                      </Text>
                      <Text>CI: {afiliado.ci}</Text>
                    </Box>
                  </Group>

                  <Group gap="xl" mt="md">
                    <Box>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginBottom: '6px' }}>Puestos Actuales:</Text>
                      <Group gap={6} wrap="wrap">
                        {afiliado.patentes?.length > 0 ? (
                          afiliado.patentes.map((puesto, index) => (
                            <Badge
                          key={index}
                          size="sm"
                          style={{
                            backgroundColor: puesto.tienePatente ? '#EDBE3C' : '#C4C4C4',
                            color:            puesto.tienePatente ? '#0f0f0f' : '#5a5a5a',
                            fontWeight:       700,
                            padding:          '4px 10px',
                            borderRadius:     '4px',
                          }}
                        >
                          {puesto.label}
                        </Badge>
                          ))
                        ) : (
                          <Text size="sm" style={{ color: '#999', fontStyle: 'italic' }}>Sin puestos asignados</Text>
                        )}
                      </Group>
                    </Box>

                    <Box>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginBottom: '2px' }}>Ocupación:</Text>
                      <Text size="sm" style={{ color: '#666' }}>{afiliado.ocupacion || afiliado.rubro || 'No especificado'}</Text>
                    </Box>
                  </Group>

                  <Group gap="xl" mt="md">
                    <Stack gap={4}>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>Contacto:</Text>
                      <Text size="sm" style={{ color: '#666' }}>{afiliado.telefono || 'No especificado'}</Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>Dirección:</Text>
                      <Text size="sm" style={{ color: '#666' }}>{afiliado.direccion || 'No especificado'}</Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>Fecha Afiliación:</Text>
                      <Text size="sm" style={{ color: '#666' }}>
                        {afiliado.fecha_afiliacion ? new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES') : 'No especificado'}
                      </Text>
                    </Stack>
                    {afiliado.edad && (
                      <Stack gap={4}>
                        <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>Edad:</Text>
                        <Text size="sm" style={{ color: '#666' }}>{afiliado.edad} años</Text>
                      </Stack>
                    )}
                    {afiliado.sexo && (
                      <Stack gap={4}>
                        <Text fw={600} size="sm" style={{ color: '#0f0f0f' }}>Sexo:</Text>
                        <Text size="sm" style={{ color: '#666' }}>{afiliado.sexo}</Text>
                      </Stack>
                    )}
                  </Group>
                </Stack>
              </Group>
            </Paper>

            {/* Sección de Puestos */}
            <Box>
              <Group justify="space-between" align="center" mb="md">
                <Title order={2} style={{ color: '#0f0f0f', fontSize: '1.5rem' }}>
                  Detalles de Puestos de Afiliado
                </Title>

                <Group gap="md">
                  <Button
                    leftSection={<IconPlus size={18} />}
                    onClick={() => setModalPuestoAbierto(true)}
                    style={{ backgroundColor: '#0f0f0f', color: 'white', borderRadius: '100px', fontWeight: 500, border: '2px solid #0f0f0f', padding: '8px 16px' }}
                  >
                    Añadir Puesto
                  </Button>
                  {modalPuestoAbierto && (
                    <Suspense fallback={<CargandoModal />}>
                      <ModalAsignarPuesto
                        opened={modalPuestoAbierto}
                        onClose={() => setModalPuestoAbierto(false)}
                        idAfiliado={id}
                        onPuestoAsignado={handlePuestoAsignado}
                      />
                    </Suspense>
                  )}
                </Group>
              </Group>

              <TablaPuestos
                afiliadoId={afiliado.id}
                key={refreshPuestos}
                onTraspaso={handleTraspaso}
                onRefresh={refrescarDatosAfiliado}
              />
            </Box>

            <ModalDesafiliarAfiliado
              opened={modalDesafiliarAbierto}
              onClose={() => setModalDesafiliarAbierto(false)}
              afiliado={afiliado}
              onConfirmar={handleDesafiliar}
              loading={cargandoDesafiliar}
            />

            <ModalTraspaso
              opened={modalTraspasoAbierto}
              close={cerrarModalTraspaso}
              puestoSeleccionado={puestoParaTraspaso}
              onTraspaso={ejecutarTraspaso}
            />
             <ModalHistorialAfiliado
              opened={modalHistorialAbierto}
              onClose={() => handleCerrarHistorial(setModalHistorialAbierto, limpiarHistorial)}
              historial={historial}
              cargando={cargandoHistorial}
              error={errorHistorial}
              nombreAfiliado={afiliado?.nombreCompleto || afiliado?.nombre || ''}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DetallesAfiliado;