import {
  Modal, TextInput, Select, Group,
  Stack, Button, Title, Paper
} from '@mantine/core';

import { IconDeviceFloppy } from '@tabler/icons-react';
import { useState } from 'react';
import { puestosService } from '../service/puestosService'

export function ModalCrearPuesto({ opened, close, onSave }) {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fila: '',
    cuadra: '',
    nroPuesto: '',
    largo: '',
    ancho: '',
    rubros: '',
    patente: 'no'
  });

  const inputStyles = {
    input: { backgroundColor: '#f8f9fa', borderRadius: 10 }
  };

  // =========================
  // Guardar
  // =========================
  const handleSave = async () => {

    const data = {
      nroPuesto: Number(form.nroPuesto),   // backend espera nroPuesto
      fila: form.fila,
      cuadra: form.cuadra,
      ancho: Number(form.ancho),
      largo: Number(form.largo),
      tiene_patente: form.patente === 'si',
      rubro: form.rubros
    };

    console.log("Datos mapeados:", data);

    await onSave(data);
    close();
  };


  // =========================
  // UI
  // =========================
  return (
    <Modal opened={opened} onClose={close}
      title = "Registrar Nuevo Puesto"
      centered size="lg" radius="lg">

      <Stack gap="lg">

        {/* IDENTIFICACIÓN */}
        <Paper p="md" withBorder>
          <Stack>
            <Title order={6}>Identificación</Title>

            <Group grow>

              <Select
                label="Fila"
                data={['A', 'B', 'C', 'D', 'E']}
                value={form.fila}
                styles={inputStyles}
                onChange={(v) => setForm({ ...form, fila: v || '' })}
                required
              />

              <TextInput
                label="Número Puesto"
                placeholder="Ej: 101"
                value={form.nroPuesto}
                styles={inputStyles}
                onChange={(e) =>
                  setForm({ ...form, nroPuesto: e.target.value })
                }
                required
              />

            </Group>

            <TextInput
              label="Cuadra"
              placeholder="Ej: 1ra cuadra"
              value={form.cuadra}
              styles={inputStyles}
              onChange={(e) =>
                setForm({ ...form, cuadra: e.target.value })
              }
              required
            />

          </Stack>
        </Paper>

        {/* DIMENSIONES */}
        <Paper p="md" withBorder>
          <Stack>
            <Title order={6}>Dimensiones</Title>

            <Group grow>
              <TextInput
                label="Largo (m)"
                value={form.largo}
                styles={inputStyles}
                onChange={(e) =>
                  setForm({ ...form, largo: e.target.value })
                }
              />

              <TextInput
                label="Ancho (m)"
                value={form.ancho}
                styles={inputStyles}
                onChange={(e) =>
                  setForm({ ...form, ancho: e.target.value })
                }
              />
            </Group>
          </Stack>
        </Paper>

        {/* COMERCIAL */}
        <Paper p="md" withBorder>
          <Stack>
            <Title order={6}>Datos Comerciales</Title>

            <TextInput
              label="Rubro"
              value={form.rubros}
              styles={inputStyles}
              onChange={(e) =>
                setForm({ ...form, rubros: e.target.value })
              }
            />

            <Select
              label="Patente"
              data={[
                { value: 'si', label: 'Tiene patente' },
                { value: 'no', label: 'No tiene patente' }
              ]}
              value={form.patente}
              styles={inputStyles}
              onChange={(v) =>
                setForm({ ...form, patente: v || 'no' })
              }
            />
          </Stack>
        </Paper>

        {/* BOTONES */}
        <Group justify="flex-end">
          <Button variant="subtle" onClick={close}>
            Cancelar
          </Button>

          <Button
            loading={loading}
            leftSection={<IconDeviceFloppy size={18} />}
            onClick={handleSave}
          >
            Guardar Puesto
          </Button>
        </Group>

      </Stack>
    </Modal>
  );
}
