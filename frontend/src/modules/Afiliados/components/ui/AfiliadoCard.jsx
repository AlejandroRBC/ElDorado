import { memo, useCallback }                          from 'react';
import { Text, Group, Badge, Stack, ActionIcon, Box, Button } from '@mantine/core';
import { IconEdit, IconChevronRight, IconUserCheck }  from '@tabler/icons-react';
import { useNavigate }                                from 'react-router-dom';
import { useLogin }                                   from '../../../../context/LoginContext';
import { getPerfilUrl }                               from '../../../../utils/imageHelper';
import '../../styles/Estilos.css';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const renderImageFallback = (parentElement) => {
  parentElement.innerHTML = `
    <div class="foto-perfil-fallback">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>`;
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────

/**
 * Card de afiliado — solo presenta datos, emite callbacks.
 *
 * afiliado        - Objeto de afiliado
 * esDeshabilitado - Cambia estilos y oculta acciones de escritura
 * onRehabilitar   - Callback (id) — solo si superAdmin
 */
const AfiliadoCard = memo(({ afiliado, esDeshabilitado = false, onRehabilitar }) => {
  const navigate     = useNavigate();
  const { user }     = useLogin();
  const esSuperAdmin = user?.rol === 'superadmin';

  const verDetalles = useCallback(() => {
    navigate(`/afiliados/${afiliado.id}`);
  }, [navigate, afiliado.id]);

  const handleRehabilitar = useCallback((e) => {
    e.stopPropagation();
    onRehabilitar?.(afiliado.id);
  }, [onRehabilitar, afiliado.id]);

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
    renderImageFallback(e.target.parentElement);
  }, []);

  // ── Puestos ────────────────────────────────────────────────
  const renderPuestos = () => {
    const lista = afiliado.puestosDetalle?.length > 0
      ? afiliado.puestosDetalle
      : afiliado.puestos_id?.length > 0
        ? afiliado.puestos_id
        : null;

    if (!lista) {
      return <Text size="sm" className="card-sin-puestos">Sin puestos</Text>;
    }
    return lista.map((p, i) => (
      <Badge key={i} size="sm"
        className={`badge-puesto ${p.tienePatente ? 'badge-puesto-patente' : 'badge-puesto-sin-patente'}`}>
        {p.puestos}
      </Badge>
    ));
  };

  const cardClasses = `card-container ${esDeshabilitado ? 'card-container-deshabilitado' : ''}`;
  const infoClasses = `card-info-contenedor ${!esDeshabilitado ? 'card-info-contenedor-con-edicion' : ''}`;

  return (
    <Box p="md" className={cardClasses}>

      {/* Botón edición rápida — solo superAdmin y activos */}
      {!esDeshabilitado && esSuperAdmin && (
        <ActionIcon variant="subtle" size="lg"
          component="a" href={`/afiliados/editar/${afiliado.id}`}
          aria-label="Editar afiliado" className="boton-edicion-rapida">
          <IconEdit size={20} />
        </ActionIcon>
      )}

      {/* Badge deshabilitado */}
      {esDeshabilitado && (
        <Badge size="sm" color="red" variant="filled" className="badge-deshabilitado">
          Deshabilitado
        </Badge>
      )}

      <Group align="flex-start" gap="md" style={{ flex: 1 }}>

        {/* Foto */}
        <Box className="foto-perfil-contenedor">
          <img
            src={getPerfilUrl(afiliado)}
            alt={`Foto de ${afiliado.nombre} ${afiliado.paterno}`}
            loading="lazy"
            className="foto-perfil-imagen"
            onError={handleImageError}
          />
        </Box>

        <Stack gap={8} className={infoClasses}>
          <Text fw={700} size="sm" className="card-nombre">
            {afiliado.nombre} {afiliado.paterno} {afiliado.materno}
          </Text>
          <Text size="sm" className="card-ci">
            CI: {afiliado.ci ?? `${afiliado.ci_numero} ${afiliado.extension}`}
          </Text>
          <Text fw={600} size="sm" className="card-puestos-titulo">Puestos:</Text>
          <Group gap={3}>{renderPuestos()}</Group>
          <Box className="card-ocupacion-contenedor">
            <Text fw={600} size="sm" className="card-ocupacion-titulo">Ocupación:</Text>
            <Text size="sm" className="card-ocupacion-valor">
              {afiliado.ocupacion || 'No especificado'}
            </Text>
          </Box>
        </Stack>
      </Group>

      {/* Rehabilitar — solo superAdmin y deshabilitados */}
      {esDeshabilitado && onRehabilitar && esSuperAdmin && (
        <Button fullWidth size="xs"
          leftSection={<IconUserCheck size={14} />}
          onClick={handleRehabilitar}
          className="boton-rehabilitar">
          Rehabilitar Afiliado
        </Button>
      )}

      {/* Pie — solo activos */}
      {!esDeshabilitado && (
        <Box className="card-pie">
          <div className="card-pie-linea" />
          <div className="card-pie-boton-contenedor">
            <Button variant="subtle" rightSection={<IconChevronRight size={14} />}
              size="xs" onClick={verDetalles} className="card-pie-boton">
              Ver más detalles
            </Button>
          </div>
        </Box>
      )}
    </Box>
  );
});

AfiliadoCard.displayName = 'AfiliadoCard';
export default AfiliadoCard;