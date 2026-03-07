import { Paper, Title, Text, Button, Group, Container, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconUsers, IconLicense, IconArrowRight } from '@tabler/icons-react';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import ModuleHeader from '../Navegacion/components/ModuleHeader';
import './Styles/inicio.css';

// ============================================
// MÓDULO DE INICIO
// ============================================

/**
 * Página principal del sistema.
 * Muestra una frase inspiradora y accesos directos a los módulos principales.
 */
const InicioModule = () => {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);

  // ── Breakpoints responsive ──
  const isMobile = useMediaQuery({ maxWidth: 640 });

  /**
   * Módulos disponibles con su ruta y ícono
   */
  const modulesData = [
    {
      id: 1,
      title: 'Afiliados',
      description: 'Gestión completa de afiliados',
      icon: IconUsers,
      path: '/afiliados',
    },
    {
      id: 2,
      title: 'Puestos',
      description: 'Control de patentes y puestos',
      icon: IconLicense,
      path: '/gestionPuestos',
    },
  ];

  return (
    <Container fluid p="md" className="inicio-module">

      {/* ── Encabezado ── */}
      <ModuleHeader title="Inicio" />

      {/* ── Contenedor principal ── */}
      <Paper p="xl" className="inicio-paper">

        {/* ── Frase inspiradora ── */}
        <Box className="inicio-quote">
          <Text className="inicio-quote-text">
            "Trabajando juntos por un mejor mañana para todos los{isMobile ? ' ' : <br />}
            miembros de nuestra comunidad"
          </Text>
        </Box>

        {/* ── Botones de módulos ── */}
        <Group gap="md" className="inicio-buttons-group">
          {modulesData.map((module) => {
            const isHovered = hoveredButton === module.id;

            return (
              <Button
                key={module.id}
                leftSection={<module.icon size={22} />}
                rightSection={<IconArrowRight size={20} />}
                size="lg"
                className="inicio-module-btn"
                onClick={() => navigate(module.path)}
                onMouseEnter={() => setHoveredButton(module.id)}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  backgroundColor: isHovered ? '#0f0f0f' : '#edbe3c',
                  color: isHovered ? 'white' : '#0f0f0f',
                  justifyContent: 'space-between',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 4px 15px rgba(15, 15, 15, 0.2)' : 'none',
                }}
              >
                <Text fw={600} size="lg">{module.title}</Text>
              </Button>
            );
          })}
        </Group>
      </Paper>
    </Container>
  );
};

export default InicioModule;