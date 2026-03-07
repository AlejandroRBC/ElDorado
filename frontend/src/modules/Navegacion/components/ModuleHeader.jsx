import { Group, Title } from '@mantine/core';
import { useMediaQuery } from 'react-responsive';
import '../styles/navegacion.css';

// ============================================
// COMPONENTE MODULE HEADER
// ============================================

/**
 * Encabezado reutilizable para cada módulo del sistema.
 * Muestra el título con fuente Bebas Neue y espaciado uniforme.
 * El tamaño de fuente se ajusta según el dispositivo.
 *
 * @param {string} title - Título del módulo a mostrar
 */
const ModuleHeader = ({ title }) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });

  return (
    <Group justify="space-between" mb="xl" style={{ width: '100%' }}>
      <Title
        order={1}
        className="module-header-title"
        style={{ fontSize: isMobile ? '1.6rem' : '2.2rem' }}
      >
        {title}
      </Title>
    </Group>
  );
};

export default ModuleHeader;