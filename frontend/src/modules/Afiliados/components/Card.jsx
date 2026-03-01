// frontend/src/modules/Afiliados/components/Card.jsx

import { Text, Group, Badge, Stack, ActionIcon, Box, Button } from '@mantine/core';
import { IconEdit, IconChevronRight, IconUserCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getPerfilUrl } from '../../../utils/imageHelper';

const Card = ({ afiliado, esDeshabilitado = false, onRehabilitar }) => {
  const navigate = useNavigate();

  const verDetalles = () => {
    navigate(`/afiliados/${afiliado.id}`);
  };

  const handleRehabilitar = (e) => {
    e.stopPropagation();
    if (onRehabilitar) {
      onRehabilitar(afiliado.id);
    }
  };

  return (
    <Box
      p="md"
      style={{
        backgroundColor: esDeshabilitado ? 'rgba(244, 67, 54, 0.03)' : 'rgba(108, 154, 255, 0.06)',
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        border: esDeshabilitado ? '1px solid rgba(244, 67, 54, 0.2)' : 'none',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: esDeshabilitado 
            ? '0 8px 25px rgba(244, 67, 54, 0.15)' 
            : '0 8px 25px rgba(108, 154, 255, 0.15)',
        },
      }}
    >
      {/* Botón de edición rápida - solo si NO está deshabilitado */}
      {!esDeshabilitado && (
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
            borderRadius: 0,
            padding: '6px',
            backgroundColor: '#374567',
            color: 'white',
            zIndex: 10,
            '&:hover': {
              backgroundColor: '#2a3652',
            },
          }}
        >
          <IconEdit size={20} />
        </ActionIcon>
      )}

      {/* Badge de DESHABILITADO */}
      {esDeshabilitado && (
        <Badge
          size="sm"
          color="red"
          variant="filled"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10
          }}
        >
          Deshabilitado
        </Badge>
      )}

      {/* Resto del contenido igual... */}
      <Group 
        align="flex-start" 
        gap="md" 
        style={{ flex: 1 }}
      >
        {/* Foto de perfil */}
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

        
        <Stack gap={8} style={{ 
          flex: 1,
          paddingRight: !esDeshabilitado ? '30px' : '0px',
          position: 'relative',
          zIndex: 1
        }}>
          <Text fw={700} size="sm" style={{ color: '#0f0f0f' }}>
            {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
          </Text>
          
          <Text size="sm" style={{ color: '#666' }}>
            CI: {afiliado.ci}
          </Text>
          
          <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginTop: '8px' }}>
            Puestos:
          </Text>
          
          <Group gap={3} >
            {afiliado.patentes && afiliado.patentes.length > 0 ? (
              afiliado.patentes.map((puesto, index) => (
                <Badge
                  key={index}
                  style={{
                    backgroundColor: esDeshabilitado ? '#F44336' : '#EDBE3C',
                    color: esDeshabilitado ? 'white' : '#0f0f0f',
                    padding: '4px 10px',
                    borderRadius: '4px',
                  }}
                >
                  {puesto}
                </Badge>
              ))
            ) : (
              <Text size="sm" style={{ color: '#999', fontStyle: 'italic' }}>
                Sin puestos
              </Text>
            )}
          </Group>
          
          <Box style={{ marginTop: 'auto' }}>
            <Text fw={600} size="sm" style={{ color: '#0f0f0f', marginBottom: '2px' }}>
              Ocupación:
            </Text>
            <Text size="sm" style={{ color: '#666' }}>
              {afiliado.ocupacion || 'No especificado'}
            </Text>
          </Box>
        </Stack>
      </Group>

      {/* Botón de rehabilitar para deshabilitados */}
      {esDeshabilitado && onRehabilitar && (
        <Button
          fullWidth
          size="xs"
          leftSection={<IconUserCheck size={14} />}
          onClick={handleRehabilitar}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '4px',
            marginTop: '10px',
            height: '32px',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          Rehabilitar Afiliado
        </Button>
      )}

      {!esDeshabilitado && (
        <Box style={{ 
          position: 'relative',
          paddingTop: '12px',
        }}>
          <div style={{
            position: 'absolute',
            top: '18px',
            left: 0,
            right: '160px',
            height: '3px',
            backgroundColor: 'black',
            zIndex: 1,
          }} />
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            position: 'relative',
            zIndex: 2
          }}>
            <Button
              variant="subtle"
              rightSection={<IconChevronRight size={14} />}
              size="xs"
              onClick={verDetalles}
              style={{
                color: '#0f0f0f',
                
                height: 'auto',
                fontWeight: 500,
                fontSize: '13px',
                backgroundColor: 'transparent',
                position: 'relative',
                zIndex: 3,
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
      )}
    </Box>
  );
};

export default Card;