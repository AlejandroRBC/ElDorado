import {
  TextInput,
  Select,
  Paper,
  Group,
  Loader,
  Checkbox,
  Box,
  Text
} from '@mantine/core';
import { IconSearch, IconX, IconUser } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import useUsuarioForm from '../Hooks/useUsuarioForm';
import '../Styles/usuario.css';

// ============================================
// COMPONENTE DE FORMULARIO DE USUARIO
// ============================================

/**
 * Formulario para crear o editar un usuario del sistema.
 * En modo creación muestra buscador de afiliados estilo mapa.
 * En modo edición muestra el afiliado como campo deshabilitado.
 *
 * @param {Function} onSuccess   - Callback al guardar con éxito
 * @param {number|null} usuarioId - ID del usuario a editar (null = nuevo)
 * @param {Function} onCancel    - Callback al cancelar
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
    setSearchTerm
  } = useUsuarioForm({ onSuccess, usuarioId });

  const [showResults, setShowResults] = useState(false);

  // Lista segura de afiliados
  const afiliadosList = Array.isArray(afiliados) ? afiliados : [];

  /**
   * Filtrar afiliados según el término de búsqueda
   */
  const resultadosBusqueda = afiliadosList.filter(afiliado => {
    if (!searchTerm || searchTerm.length < 2) return false;
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      afiliado.label?.toLowerCase().includes(searchLower) ||
      afiliado.searchText?.toLowerCase().includes(searchLower)
    );
  });

  /**
   * Seleccionar afiliado del dropdown
   */
  const seleccionarAfiliado = (afiliado) => {
    handleChange('id_afiliado', String(afiliado.value));
    setSearchTerm(afiliado.label);
    setShowResults(false);
  };

  /**
   * Limpiar selección de afiliado
   */
  const limpiarSeleccion = () => {
    handleChange('id_afiliado', '');
    setSearchTerm('');
    setShowResults(false);
  };

  // En edición, cargar el label del afiliado en el input
  useEffect(() => {
    if (esEdicion && formData.id_afiliado_data?.label) {
      setSearchTerm(formData.id_afiliado_data.label);
    }
  }, [esEdicion, formData.id_afiliado_data]);

  // Estado de carga inicial de afiliados
  if (loadingAfiliados && !esEdicion && afiliadosList.length === 0) {
    return (
      <Paper shadow="xs" p="lg" className="usuario-form">
        <Loader size="lg" className="usuario-form-loader" color="yellow" />
        <Text className="usuario-form-loader-title" c="dimmed" size="sm">
          Cargando afiliados...
        </Text>
      </Paper>
    );
  }

  return (
    <Paper shadow="xs" p="lg" className="usuario-form">
      {/* Título del formulario */}
      <Text className="usuario-form-title">
        {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
      </Text>

      <form onSubmit={handleSubmit}>

        {/* ── Campo de afiliado ── */}
        {esEdicion ? (
          /* Modo edición: solo lectura */
          <TextInput
            label="Afiliado"
            value={searchTerm || 'Cargando...'}
            disabled
            mb="md"
            classNames={{ input: 'usuario-form-afiliado-disabled' }}
          />
        ) : (
          /* Modo creación: buscador estilo BuscadorMapa */
          <Box className="usuario-form-search-container">
            <Text size="sm" className="usuario-list-filtro-label">Buscar Afiliado</Text>

            {/* Input personalizado con ícono */}
            <div className="usuario-form-search-input-wrapper">
              <IconSearch size={15} color="#999" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Escribe Nombre/CI para buscar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                  if (formData.id_afiliado) {
                    handleChange('id_afiliado', '');
                  }
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                disabled={loading}
                required
              />
              {/* Botón limpiar */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={limpiarSeleccion}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#999'
                  }}
                >
                  <IconX size={13} />
                </button>
              )}
            </div>

            {/* Dropdown de resultados estilo BuscadorMapa */}
            {showResults && searchTerm?.length > 1 && !formData.id_afiliado && (
              <Paper shadow="md" className="usuario-form-results-dropdown">
                {resultadosBusqueda.length > 0 ? (
                  resultadosBusqueda.map((afiliado) => (
                    <button
                      key={afiliado.value}
                      type="button"
                      className="usuario-form-result-item"
                      onClick={() => seleccionarAfiliado(afiliado)}
                    >
                      <div className="usuario-form-result-icon">
                        <IconUser size={14} color="#0f0f0f" />
                      </div>
                      <div style={{ marginLeft: '10px', textAlign: 'left' }}>
                        <Text size="sm" fw={700} style={{ color: '#0f0f0f', fontSize: '12px' }}>
                          {afiliado.label}
                        </Text>
                        <Text size="xs" c="dimmed" style={{ fontSize: '11px' }}>
                          CI: {afiliado.ci} {afiliado.extension}
                        </Text>
                      </div>
                    </button>
                  ))
                ) : (
                  <Text size="sm" className="usuario-form-no-results" c="dimmed">
                    Sin resultados para "{searchTerm}"
                  </Text>
                )}
              </Paper>
            )}
          </Box>
        )}

        {/* ── Selector de rol ── */}
        <Select
          label="Rol"
          placeholder="Seleccione un rol"
          data={[
            { value: 'admin',      label: '🛡️ Administrador' },
            { value: 'superadmin', label: '⚡ Super Admin' }
          ]}
          value={formData.rol}
          onChange={(val) => handleChange('rol', val)}
          required
          mb="md"
          disabled={loading}
          classNames={{ input: 'usuario-form-select-input' }}
        />

        {/* ── Nombre de usuario ── */}
        <TextInput
          label="Nombre de usuario"
          placeholder="ej: juan.perez"
          value={formData.nom_usuario}
          onChange={(e) => handleChange('nom_usuario', e.target.value)}
          required
          mb="md"
          disabled={loading}
        />

        {/* ── Checkbox cambiar contraseña (solo edición) ── */}
        {esEdicion && (
          <Checkbox
            label="Cambiar contraseña"
            checked={cambiarPassword}
            onChange={(e) => setCambiarPassword(e.currentTarget.checked)}
            mb="md"
            disabled={loading}
            color="yellow"
          />
        )}

        {/* ── Campo de contraseña ── */}
        {(!esEdicion || cambiarPassword) && (
          <TextInput
            label={esEdicion ? 'Nueva contraseña' : 'Contraseña'}
            type="password"
            placeholder="mínimo 6 caracteres"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required={!esEdicion}
            mb="md"
            disabled={loading}
          />
        )}

        {/* ── Botones de acción ── */}
        <Group justify="flex-end" mt="xl" gap="sm">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="usuario-btn-cancel"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="usuario-btn-save"
          >
            {loading ? '...' : (esEdicion ? 'Actualizar' : 'Guardar')}
          </button>
        </Group>
      </form>
    </Paper>
  );
};

export default UsuarioForm;