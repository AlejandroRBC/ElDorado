import { Group, Switch, Text, Badge, Tooltip } from '@mantine/core';
import { IconUserOff, IconUsers } from '@tabler/icons-react';

const ToggleViewDeshabilitados = ({ 
  mostrarDeshabilitados, 
  onChange, 
  totalDeshabilitados = 0 
}) => {
  return (
    <Group gap="md" align="center">
      <Group gap="xs" align="center">
        <IconUsers 
          size={18} 
          style={{ color: !mostrarDeshabilitados ? '#0f0f0f' : '#999' }} 
        />
        <Switch
          checked={mostrarDeshabilitados}
          onChange={(event) => onChange(event.currentTarget.checked)}
          size="lg"
          styles={{
            track: {
              backgroundColor: mostrarDeshabilitados ? '#F44336' : '#e0e0e0',
              borderColor: mostrarDeshabilitados ? '#F44336' : '#e0e0e0',
              width: '50px',
              height: '26px',
            },
            thumb: {
              backgroundColor: 'white',
              borderColor: mostrarDeshabilitados ? '#F44336' : '#0f0f0f',
              width: '22px',
              height: '22px',
            }
          }}
        />
        <Group gap={4} align="center">
          <IconUserOff 
            size={18} 
            style={{ color: mostrarDeshabilitados ? '#F44336' : '#999' }} 
          />
          {totalDeshabilitados > 0 && (
            <Tooltip label={`${totalDeshabilitados} afiliado${totalDeshabilitados !== 1 ? 's' : ''} deshabilitado${totalDeshabilitados !== 1 ? 's' : ''}`}>
              <Badge 
                size="sm" 
                color="red" 
                variant="filled"
                style={{ cursor: 'pointer' }}
                onClick={() => onChange(true)}
              >
                {totalDeshabilitados}
              </Badge>
            </Tooltip>
          )}
        </Group>
      </Group>
      
      <Group gap="xs">
        <Text 
          size="sm" 
          style={{ 
            color: !mostrarDeshabilitados ? '#0f0f0f' : '#999', 
            fontWeight: !mostrarDeshabilitados ? 600 : 400 
          }}
        >
          Activos
        </Text>
        <Text size="sm" style={{ color: '#999' }}>/</Text>
        <Text 
          size="sm" 
          style={{ 
            color: mostrarDeshabilitados ? '#F44336' : '#999', 
            fontWeight: mostrarDeshabilitados ? 600 : 400 
          }}
        >
          Deshabilitados
        </Text>
      </Group>
    </Group>
  );
};

export default ToggleViewDeshabilitados;