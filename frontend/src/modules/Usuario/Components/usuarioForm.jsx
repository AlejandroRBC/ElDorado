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
    setSearchTerm
  } = useUsuarioForm({ onSuccess, usuarioId });

  const [showResults, setShowResults] = useState(false);

  const afiliadosList = Array.isArray(afiliados) ? afiliados : [];

  const resultadosBusqueda = afiliadosList.filter(afiliado => {
    if (!searchTerm || searchTerm.length < 2) return false;
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      afiliado.label?.toLowerCase().includes(searchLower) ||
      afiliado.searchText?.toLowerCase().includes(searchLower)
    );
  });

  const seleccionarAfiliado = (afiliado) => {
    handleChange('id_afiliado', String(afiliado.value));
    setSearchTerm(afiliado.label);
    setShowResults(false);
  };

  const limpiarSeleccion = () => {
    handleChange('id_afiliado', '');
    setSearchTerm('');
    setShowResults(false);
  };

  useEffect(() => {
    if (esEdicion && formData.id_afiliado_data?.label) {
      setSearchTerm(formData.id_afiliado_data.label);
    }
  }, [esEdicion, formData.id_afiliado_data]);

  if (loadingAfiliados && !esEdicion && afiliadosList.length === 0) {
    return (
      <Paper shadow="xs" p="lg" className="usuario-form">
        <Loader size="lg" className="usuario-form-loader" />
        <Title order={4} c="dimmed" className="usuario-form-loader-title">
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
        {esEdicion ? (
          <TextInput
            label="Afiliado"
            value={searchTerm || 'Cargando...'} 
            disabled
            mb="md"
            classNames={{ input: 'usuario-form-afiliado-disabled' }}
          />
        ) : (
          <Box className="usuario-form-search-container">
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
                  className="usuario-form-clear-button"
                >
                  ✕
                </Button> : null
              }
            />
            
            {showResults && searchTerm?.length > 1 && !formData.id_afiliado && (
              <Paper shadow="md" p="xs" className="usuario-form-results-dropdown">
                {resultadosBusqueda.length > 0 ? (
                  resultadosBusqueda.map((afiliado) => (
                    <Button
                      key={afiliado.value}
                      variant="subtle"
                      fullWidth
                      className="usuario-form-result-item"
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
                  <Text size="sm" c="dimmed" className="usuario-form-no-results">
                    No se encontraron afiliados
                  </Text>
                )}
              </Paper>
            )}
          </Box>
        )}

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

        <TextInput
          label="Nombre de usuario"
          placeholder="ej: juan.perez"
          value={formData.nom_usuario}
          onChange={(e) => handleChange('nom_usuario', e.target.value)}
          required
          mb="md"
          disabled={loading}
        />

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