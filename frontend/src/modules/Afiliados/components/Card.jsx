import { Text, Group, Badge, Stack, ActionIcon, Box, Button } from '@mantine/core';
import { IconEdit, IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getPerfilUrl } from '../../../utils/imageHelper';


const Card = ({ afiliado }) => {
  const navigate = useNavigate();

  const verDetalles = () => {
    navigate(`/afiliados/${afiliado.id}`);
  };

  return (
    <Box
      p="md"
      style={{
        backgroundColor: 'rgba(108, 154, 255, 0.06)',
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(108, 154, 255, 0.15)',
        },
      }}
    >
      {/* Botón de edición rápida */}
      <ActionIcon
        variant="subtle"
        size="lg"
        component="a"
      href={`/afiliados/editar/${afiliado.id}`}
        style={{
          position: 'absolute',
          top: '0px',
          right: '0px',
          margin: 0,
            borderRadius:0,
          padding: '6px',
          backgroundColor: '#374567',
          color: 'white',
          '&:hover':   {
            backgroundColor: '#2a3652',
          },
        }}
      >
        <IconEdit size={20} />
      </ActionIcon>

      {/* Contenido principal */}
      <Group 
        align="flex-start" 
        gap="md" 
        style={{ 
          flex: 1,
        }}
      >
        {/* Foto de perfil grande */}
        <Box
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: 'white',
            flexShrink: 0,
          }}
        >
          <img
  src={getPerfilUrl(afiliado)}
  alt={`Perfil de ${afiliado.nombre}`}
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
          <Text fw={700} size="sm" style={{ color: '#0f0f0f' }}>
            {afiliado.nombre}
          </Text>
          
          <Text size="sm" style={{ color: '#666' }}>
            CI: {afiliado.ci}
          </Text>
          
          <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginTop: '8px' }}>
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
          
          <Box style={{ marginTop: 'auto' }}>
            <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginBottom: '2px' }}>
              Ocupacion:
            </Text>
            <Text size="sm" style={{ color: '#666' }}>
            {afiliado.ocupacion || 'No especificado'}
            </Text>
          </Box>
        </Stack>
      </Group>


      <Box style={{ 
        position: 'relative',
        paddingTop: '12px',
      }}>
        {/* Línea continua */}
        <div style={{
          position: 'absolute',
          top: '18px', // Centrado verticalmente con el texto
          left: 0,
          right: '40%', // Deja espacio para el botón
          height: '3px',
          backgroundColor: 'black',
        }} />
        
        {/* Botón alineado a la derecha */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={14} />}
            size="xs"
            onClick={verDetalles}
            style={{
              color: '#0f0f0f',
              padding: '0',
              height: 'auto',
              fontWeight: 500,
              fontSize: '13px',
              backgroundColor: 'transparent',
              '&:hover': {
                color: '#374567',
                backgroundColor: 'transparent',
              },
            }}
          >
            Ver más detalles
          </Button>
        </div>
      </Box>
    </Box>
  );
};

export default Card;