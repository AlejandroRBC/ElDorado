import { 
  TextInput, 
  Select, 
  Button, 
  Paper, 
  Title, 
  Group, 
  Loader,
  Checkbox,
  Box,
  Text
} from '@mantine/core';
import { useState, useEffect } from 'react';
import useUsuarioForm from '../Hooks/useUsuarioForm';
import '../Styles/usuario.css';

// ============================================
// COMPONENTE DE FORMULARIO DE USUARIO
// ============================================

/**
 * Formulario para crear/editar usuarios
 */
const UsuarioForm = ({ onSuccess, usuarioId = null, onCancel }) => {
  const {
    formData,
    handleChange,
    handleSubmit,
    loading,
    loadingAfiliados,
    afiliados,
    esEdicion,
    cambiarPassword,
    setCambiarPassword,
    searchTerm,
    setSearchTerm,
    buscarAfiliados
  } = useUsuarioForm({ onSuccess, usuarioId });

  const [showResults, setShowResults] = useState(false);

  const afiliadosList = Array.isArray(afiliados) ? afiliados : [];

  // Filtrar resultados de búsqueda
  const resultadosBusqueda = afiliadosList.filter(afiliado => {
    if (!searchTerm || searchTerm.length < 2) return false;
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      afiliado.label?.toLowerCase().includes(searchLower) ||
      afiliado.searchText?.toLowerCase().includes(searchLower)
    );
  });

  /**
   * Seleccionar afiliado del buscador
   */
  const seleccionarAfiliado = (afiliado) => {
    handleChange('id_afiliado', String(afiliado.value));
    setSearchTerm(afiliado.label);
    setShowResults(false);
  };

  /**
   * Limpiar selección
   */
  const limpiarSeleccion = () => {
    handleChange('id_afiliado', '');
    setSearchTerm('');
    setShowResults(false);
  };

  // Cargar nombre del afiliado en edición
  useEffect(() => {
    if (esEdicion && formData.id_afiliado_data?.label) {
      setSearchTerm(formData.id_afiliado_data.label);
    }
  }, [esEdicion, formData.id_afiliado_data]);

  // Mostrar loader mientras carga
  if (loadingAfiliados && !esEdicion && afiliadosList.length === 0) {
    return (
      <Paper shadow="xs" p="lg" className="usuario-form">
        <Loader size="lg" style={{ display: 'block', margin: '20px auto' }} />
        <Title order={4} ta="center" c="dimmed" mt="md">
          Cargando afiliados...
        </Title>
      </Paper>
    );
  }

  return (
    <Paper shadow="xs" p="lg" className="usuario-form">
      <Title order={3} mb="md">
        {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
      </Title>

      <form onSubmit={handleSubmit}>
        {/* Campo Afiliado */}
        {esEdicion ? (
          <TextInput
            label="Afiliado"
            value={searchTerm || 'Cargando...'} 
            disabled
            mb="md"
            styles={{
              input: { 
                backgroundColor: '#f5f5f5', 
                cursor: 'not-allowed',
                color: '#333',
                fontWeight: 500
              }
            }}
          />
        ) : (
          <Box mb="md" style={{ position: 'relative' }}>
            <TextInput
              label="Buscar Afiliado"
              placeholder="Escribe nombre o CI para buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
                if (formData.id_afiliado) {
                  handleChange('id_afiliado', '');
                }
                if (e.target.value.length > 1) {
                  buscarAfiliados(e.target.value);
                }
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => {
                setTimeout(() => setShowResults(false), 200);
              }}
              required
              disabled={loading}
              rightSection={searchTerm ? 
                <Button 
                  variant="subtle" 
                  size="xs" 
                  onClick={limpiarSeleccion}
                  style={{ padding: 0, minWidth: 'auto' }}
                >
                  ✕
                </Button> : null
              }
            />
            
            {/* Resultados de búsqueda */}
            {showResults && searchTerm?.length > 1 && !formData.id_afiliado && (
              <Paper
                shadow="md"
                p="xs"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: 300,
                  overflowY: 'auto',
                  border: '1px solid #e9ecef',
                  marginTop: 4,
                  backgroundColor: 'white'
                }}
              >
                {resultadosBusqueda.length > 0 ? (
                  resultadosBusqueda.map((afiliado) => (
                    <Button
                      key={afiliado.value}
                      variant="subtle"
                      fullWidth
                      style={{
                        justifyContent: 'flex-start',
                        padding: '10px 12px',
                        height: 'auto',
                        marginBottom: 2,
                        textAlign: 'left',
                        fontWeight: 'normal'
                      }}
                      onClick={() => seleccionarAfiliado(afiliado)}
                    >
                      <div>
                        <Text size="sm" fw={500}>{afiliado.label}</Text>
                        <Text size="xs" c="dimmed">
                          CI: {afiliado.ci} {afiliado.extension}
                        </Text>
                      </div>
                    </Button>
                  ))
                ) : (
                  <Text size="sm" c="dimmed" ta="center" py="xs">
                    No se encontraron afiliados
                  </Text>
                )}
              </Paper>
            )}
          </Box>
        )}

        {/* Campo Rol */}
        <Select
          label="Rol"
          placeholder="Seleccione un rol"
          data={[
            { value: 'usuario', label: '👤 Usuario' },
            { value: 'admin', label: '🛡️ Administrador' },
            { value: 'superadmin', label: '⚡ Super Admin' }
          ]}
          value={formData.rol}
          onChange={(val) => handleChange('rol', val)}
          required
          mb="md"
          disabled={loading}
        />

        {/* Campo Nombre de Usuario */}
        <TextInput
          label="Nombre de usuario"
          placeholder="ej: juan.perez"
          value={formData.nom_usuario}
          onChange={(e) => handleChange('nom_usuario', e.target.value)}
          required
          mb="md"
          disabled={loading}
        />

        {/* Checkbox Cambiar Contraseña (solo edición) */}
        {esEdicion && (
          <Checkbox
            label="Cambiar contraseña"
            checked={cambiarPassword}
            onChange={(e) => setCambiarPassword(e.currentTarget.checked)}
            mb="md"
            disabled={loading}
            color="blue"
          />
        )}

        {/* Campo Contraseña */}
        {(!esEdicion || cambiarPassword) && (
          <TextInput
            label={esEdicion ? "Nueva contraseña" : "Contraseña"}
            type="password"
            placeholder="mínimo 6 caracteres"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required={!esEdicion}
            mb="md"
            disabled={loading}
          />
        )}

        {/* Botones */}
        <Group justify="flex-end" mt="xl">
          {onCancel && (
            <Button variant="light" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            loading={loading}
            color={esEdicion ? 'blue' : 'green'}
          >
            {esEdicion ? 'Actualizar' : 'Guardar'}
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default UsuarioForm;