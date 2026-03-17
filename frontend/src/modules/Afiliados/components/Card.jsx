import { memo, useCallback } from 'react';
import { Text, Group, Badge, Stack, ActionIcon, Box, Button } from '@mantine/core';
import { IconEdit, IconChevronRight, IconUserCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../../context/LoginContext';

import { getPerfilUrl } from '../../../utils/imageHelper';
import '../styles/Estilos.css';

// ==============================================
// FUNCIONES AUXILIARES DE RENDERIZADO
// ==============================================

/**
 * Renderiza el fallback cuando la imagen no carga
 * @param {HTMLElement} parentElement - Elemento padre donde insertar el fallback
 */
const renderImageFallback = (parentElement) => {
  const fallbackHTML = `
    <div class="foto-perfil-fallback">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  `;
  parentElement.innerHTML = fallbackHTML;
};

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

/**
 * Card de afiliado para mostrar información resumida.
 * Componente puramente presentacional.
 * El icono de edición rápida y el botón Rehabilitar
 * solo se muestran a usuarios con rol superadmin.
 */
const Card = memo(({ afiliado, esDeshabilitado = false, onRehabilitar }) => {
  const navigate = useNavigate();

  // ── Control de rol ──────────────────────────────────────────
  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  // ==============================================
  // HANDLERS DEL COMPONENTE
  // ==============================================

  const verDetalles = useCallback(() => {
    navigate(`/afiliados/${afiliado.id}`);
  }, [navigate, afiliado.id]);

  const handleRehabilitar = useCallback((e) => {
    e.stopPropagation();
    if (onRehabilitar) onRehabilitar(afiliado.id);
  }, [onRehabilitar, afiliado.id]);

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
    renderImageFallback(e.target.parentElement);
  }, []);

  // ==============================================
  // RENDERIZADO DE SECCIONES
  // ==============================================

  const renderBotonEdicion = () => {
    // Icono azul de edición rápida — solo superAdmin
    if (esDeshabilitado || !esSuperAdmin) return null;

    return (
      <ActionIcon
        variant="subtle"
        size="lg"
        component="a"
        href={`/afiliados/editar/${afiliado.id}`}
        aria-label="Editar afiliado"
        className="boton-edicion-rapida"
      >
        <IconEdit size={20} />
      </ActionIcon>
    );
  };

  const renderBadgeDeshabilitado = () => {
    if (!esDeshabilitado) return null;

    return (
      <Badge
        size="sm"
        color="red"
        variant="filled"
        className="badge-deshabilitado"
      >
        Deshabilitado
      </Badge>
    );
  };

  const renderFotoPerfil = () => (
    <Box className="foto-perfil-contenedor">
      <img
        src={getPerfilUrl(afiliado)}
        alt={`Foto de perfil de ${afiliado.nombre} ${afiliado.paterno}`}
        loading="lazy"
        className="foto-perfil-imagen"
        onError={handleImageError}
      />
    </Box>
  );

  const renderPuestos = () => {
    if (afiliado.puestos?.length > 0) {
      const puestos = (afiliado.puestosDetalle ?? afiliado.puestos?.map(p => ({ label: p, tienePatente: false })) ?? []);

      return puestos.map((puesto, i) => (
        <Badge
          key={i}
          size="sm"
          className={`badge-puesto ${puesto.tienePatente ? 'badge-puesto-patente' : 'badge-puesto-sin-patente'}`}
        >
          {puesto.label}
        </Badge>
      ));
    }

    return (
      <Text size="sm" className="card-sin-puestos">
        Sin puestos
      </Text>
    );
  };

  const renderOcupacion = () => (
    <Box className="card-ocupacion-contenedor">
      <Text fw={600} size="sm" className="card-ocupacion-titulo">
        Ocupación:
      </Text>
      <Text size="sm" className="card-ocupacion-valor">
        {afiliado.ocupacion || 'No especificado'}
      </Text>
    </Box>
  );

  const renderBotonRehabilitar = () => {
    // Rehabilitar — solo superAdmin
    if (!esDeshabilitado || !onRehabilitar || !esSuperAdmin) return null;

    return (
      <Button
        fullWidth
        size="xs"
        leftSection={<IconUserCheck size={14} />}
        onClick={handleRehabilitar}
        aria-label="Rehabilitar afiliado"
        className="boton-rehabilitar"
      >
        Rehabilitar Afiliado
      </Button>
    );
  };

  const renderPieCard = () => {
    if (esDeshabilitado) return null;

    return (
      <Box className="card-pie">
        <div className="card-pie-linea" />
        <div className="card-pie-boton-contenedor">
          <Button
            variant="subtle"
            rightSection={<IconChevronRight size={14} />}
            size="xs"
            onClick={verDetalles}
            className="card-pie-boton"
          >
            Ver más detalles
          </Button>
        </div>
      </Box>
    );
  };

  // Clases condicionales para el contenedor principal
  const cardClasses = `card-container ${esDeshabilitado ? 'card-container-deshabilitado' : ''}`;
  const infoClasses = `card-info-contenedor ${!esDeshabilitado ? 'card-info-contenedor-con-edicion' : ''}`;

  // Render principal
  return (
    <Box p="md" className={cardClasses}>
      {renderBotonEdicion()}
      {renderBadgeDeshabilitado()}

      <Group align="flex-start" gap="md" style={{ flex: 1 }}>
        {renderFotoPerfil()}

        <Stack gap={8} className={infoClasses}>
          <Text fw={700} size="sm" className="card-nombre">
            {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
          </Text>

          <Text size="sm" className="card-ci">
            CI: {afiliado.ci}
          </Text>

          <Text fw={600} size="sm" className="card-puestos-titulo">
            Puestos:
          </Text>

          <Group gap={3}>
            {renderPuestos()}
          </Group>

          {renderOcupacion()}
        </Stack>
      </Group>

      {renderBotonRehabilitar()}
      {renderPieCard()}
    </Box>
  );
});

Card.displayName = 'Card';

export default Card;