import { Modal, TextInput, Select, Button, Stack, Group } from "@mantine/core";
import { useEffect, useState } from "react";

export function ModalEditarPuesto({ opened, close, puesto, onGuardar }) {

  const [form, setForm] = useState({});

  useEffect(() => {
    if (puesto) setForm(puesto);
  }, [puesto]);

  if (!puesto) return null;

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal opened={opened} onClose={close} title="Editar Puesto" size="md">

      <Stack>

        <TextInput
          label="Nro Puesto"
          value={form.nroPuesto || ""}
          onChange={e => handle("nroPuesto", e.target.value)}
        />

        <TextInput
          label="Rubros"
          value={form.rubro || ""}
          onChange={e => handle("rubro", e.target.value)}
        />

        <Group grow>
          <Select
            label="Fila"
            data={['A','B','C']}
            value={form.fila}
            onChange={v => handle("fila", v)}
          />

          <Select
            label="Cuadra"
            data={['1','2','3']}
            value={form.cuadra}
            onChange={v => handle("cuadra", v)}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Ancho"
            value={form.ancho || ""}
            onChange={e => handle("ancho", e.target.value)}
          />

          <TextInput
            label="Largo"
            value={form.largo || ""}
            onChange={e => handle("largo", e.target.value)}
          />
        </Group>

        <Select
          label="Estado Patente"
          data={[
            { value: '1', label: 'Con Patente' },
            { value: '0', label: 'Sin Patente' }
          ]}
          value={form.tiene_patente ? '1' : '0'}
          onChange={v => handle("tiene_patente", v === '1')}
        />

        <Button onClick={() => onGuardar(form)}>
          Guardar Cambios
        </Button>

      </Stack>
    </Modal>
  );
}
