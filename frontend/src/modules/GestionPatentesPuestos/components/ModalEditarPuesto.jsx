import { Modal,Text, TextInput, Select, Button, Stack, Group } from "@mantine/core";
import { useEffect, useState } from "react";

export function ModalEditarPuesto({ opened, close, puesto, onGuardar }) {

  const [form, setForm] = useState({});

  useEffect(() => {
    if (puesto) setForm(puesto);
  }, [puesto]);

  if (!puesto) return null;

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));
{/**toque esta parte dejalo porfis **/}
  return (
    <Modal 
      opened={opened} 
      onClose={close}  
      size="md"
      centered withCloseButton={false}
      radius={"lg"}
      title={
        <Text
        fw={900}
        size="xl"
        style={{
          letteSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          EDITAR PUESTO
        </Text>
      }
      >
      

      <Stack>

        <TextInput
          label="Rubros"
          value={form.rubro || ""}
          onChange={e => handle("rubro", e.target.value)}
        />
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

        <Group>
          <Button 
            radius={"xl"}
            onClick={() => onGuardar(form)}>
          Guardar Cambios
        </Button>
        <Button 
          color="black"
          radius={"xl"}
          onClick={() => close()}>
          Cancelar
        </Button>  
        </Group>
      </Stack>
    </Modal>
  );
}
