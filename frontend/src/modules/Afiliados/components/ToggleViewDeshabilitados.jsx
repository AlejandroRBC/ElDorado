import { Group, Switch, Text, Badge, Tooltip } from '@mantine/core';
import { IconTrash, IconTrashOff } from '@tabler/icons-react';

import '../styles/Estilos.css'; // Archivo acumulador de estilos

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

const getSwitchStyles = (mostrarDeshabilitados) => ({
  track: {
    backgroundColor: mostrarDeshabilitados ? '#0F0F0F' : '#e0e0e0',
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
});

const getIconColor = (mostrarDeshabilitados) => {
  return mostrarDeshabilitados ? '#F44336' : '#999';
};

const getTooltipText = (total) => {
  if (total === 0) return '';
  return `${total} afiliado${total !== 1 ? 's' : ''} deshabilitado${total !== 1 ? 's' : ''}`;
};

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

const ToggleViewDeshabilitados = ({ 
  mostrarDeshabilitados, 
  onChange, 
  totalDeshabilitados = 0 
}) => {
  // ==============================================
  // VARIABLES DERIVADAS
  // ==============================================
  const switchStyles = getSwitchStyles(mostrarDeshabilitados);
  const iconColor = getIconColor(mostrarDeshabilitados);
  const tooltipText = getTooltipText(totalDeshabilitados);

  // ==============================================
  // HANDLERS
  // ==============================================
  const handleChange = (event) => {
    onChange(event.currentTarget.checked);
  };

  // ==============================================
  // RENDERIZADO
  // ==============================================
  return (
    <Group gap="md" align="center" className="toggle-container">
      <Group gap="xs" align="center" className="toggle-switch-group">
        <Switch
          checked={mostrarDeshabilitados}
          onChange={handleChange}
          size="lg"
          styles={switchStyles}
          className="toggle-switch"
        />
        
        <Group gap={4} align="center" className="toggle-icon-group">
          <IconTrash 
            size={18} 
            style={{ color: iconColor }}
            className="toggle-icon"
          />
        </Group>
      </Group>
    </Group>
  );
};

export default ToggleViewDeshabilitados;