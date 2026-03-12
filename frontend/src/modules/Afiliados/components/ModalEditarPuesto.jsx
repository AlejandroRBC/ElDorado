import { Modal, Box, Group, Stack, Text, Button, TextInput, Checkbox, NumberInput, LoadingOverlay, Alert, Paper } from '@mantine/core';
import { IconEdit, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { API_BASE_URL } from '../../../api/config';

const ModalEditarPuesto = ({ opened, onClose, puesto, onPuestoActualizado }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [formData, setFormData] = useState({
    nroPuesto:     '',
    fila:          '',
    cuadra:        '',
    rubro:         '',
    tiene_patente: false,
    ancho:         '',
    largo:         '',
  });

  useEffect(() => {
    if (puesto) {
      setFormData({
        nroPuesto:     puesto.nroPuesto     || '',
        fila:          puesto.fila          || '',
        cuadra:        puesto.cuadra        || '',
        rubro:         puesto.rubro         || '',
        tiene_patente: puesto.tiene_patente === 1 || puesto.tiene_patente === true,
        ancho:         puesto.ancho         || '',
        largo:         puesto.largo         || '',
      });
    }
  }, [puesto]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const datosActualizar = {
        nroPuesto:     formData.nroPuesto,
        fila:          formData.fila,
        cuadra:        formData.cuadra,
        rubro:         formData.rubro,
        tiene_patente: formData.tiene_patente,
        ancho:         formData.ancho ? parseFloat(formData.ancho) : null,
        largo:         formData.largo ? parseFloat(formData.largo) : null,
      };

      const response = await fetch(`${API_BASE_URL}/puestos/${puesto.id_puesto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizar),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al actualizar el puesto');

      notifications.show({ title: '✅ Éxito', message: 'Puesto actualizado correctamente', color: 'green' });
      if (onPuestoActualizado) onPuestoActualizado();
      onClose();
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      notifications.show({ title: '❌ Error', message: err.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const estiloInput = {
    label: { fontWeight: 600, marginBottom: '4px' },
    input: { backgroundColor: '#f6f8fe', border: '1px solid #f6f8fe', borderRadius: '8px', height: '45px' },
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group align="center" gap="xs">
          <IconEdit size={24} color="#edbe3c" />
          <Text fw={700} size="xl">Editar Puesto</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Box style={{ position: 'relative', minHeight: '300px' }}>
        <LoadingOverlay visible={loading} />

        <Stack gap="md" p="md">
          <Paper p="sm" withBorder bg="blue.0">
            <Text size="sm" c="dimmed">Puesto</Text>
            <Text fw={700} size="xl">{puesto?.nroPuesto}-{puesto?.fila}-{puesto?.cuadra}</Text>
          </Paper>

          {error && <Alert color="red" icon={<IconX size={16} />}>{error}</Alert>}

          <TextInput
            label="Rubro"
            placeholder="Ej: Verduras, Ropa, Electrónicos..."
            value={formData.rubro}
            onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
            size="md"
            styles={estiloInput}
          />

          <Group grow>
            <NumberInput
              label="Ancho (metros)"
              placeholder="Ej: 3.5"
              value={formData.ancho}
              onChange={(val) => setFormData({ ...formData, ancho: val })}
              min={0} step={0.5} size="md"
              styles={estiloInput}
            />
            <NumberInput
              label="Largo (metros)"
              placeholder="Ej: 4"
              value={formData.largo}
              onChange={(val) => setFormData({ ...formData, largo: val })}
              min={0} step={0.5} size="md"
              styles={estiloInput}
            />
          </Group>

          <Checkbox
            label="¿El puesto cuenta con patente?"
            description="Marque esta opción si el puesto tiene patente municipal"
            checked={formData.tiene_patente}
            onChange={(e) => setFormData({ ...formData, tiene_patente: e.target.checked })}
            size="md"
            styles={{ label: { fontWeight: 600 } }}
          />

          <Text size="xs" c="dimmed" mt="xs">
            Nota: La ubicación del puesto (fila, cuadra, número) no se puede modificar.
          </Text>

          <Group justify="flex-end" gap="md" mt="xl">
            <Button
              variant="outline" onClick={onClose} disabled={loading}
              style={{ borderColor: '#0f0f0f', color: '#0f0f0f', borderRadius: '100px', padding: '0 30px', height: '45px' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit} loading={loading}
              style={{ backgroundColor: '#edbe3c', color: '#0f0f0f', borderRadius: '100px', padding: '0 30px', height: '45px', fontWeight: 600 }}
            >
              Guardar Cambios
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ModalEditarPuesto;