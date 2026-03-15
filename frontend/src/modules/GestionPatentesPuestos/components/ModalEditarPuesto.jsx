import { Modal,Text, TextInput, Select, Button, Stack, Group } from "@mantine/core";
import { useEffect, useState } from "react";

export function ModalEditarPuesto({ opened, close, puesto, onGuardar }) {

  const [form, setForm] = useState({});

  useEffect(() => {
    if (puesto) setForm(puesto);
  }, [puesto]);

  if (!puesto) return null;

  const handle = (k, v) => {
    setForm(f => {
      let newState = { ...f, [k]: v };

      // Si se está editando el nro_patente
      if (k === "nro_patente") {
        // Si hay texto, marcamos tiene_patente como true (1), si no, false (0)
        newState.tiene_patente = v.trim() !== "";
      }

      // Si el usuario cambia manualmente el Select a "Sin Patente", borramos el número
      if (k === "tiene_patente" && v === false) {
        newState.nro_patente = "";
      }

      return newState;
    });
  };
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
        <Group grow>
          <TextInput
            label="Nro Patente"
            value={form.nro_patente || ""}
            onChange={e => handle("nro_patente", e.target.value)}
          />
          <TextInput
            label="Rubros"
            value={form.rubro || ""}
            onChange={e => handle("rubro", e.target.value)}
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
