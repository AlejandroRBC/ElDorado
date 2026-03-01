// frontend/src/modules/GestionPatentesPuestos/GestionPatentesPuestosModule.jsx
import { useState } from "react";
import { Stack, Title, Group, Box, Text, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { usePuestos } from "./hooks/usePuestos";
import { usePuestosFiltros } from "./hooks/usePuestosFiltros";

import { FiltrosPuestos } from "./components/FiltrosPuestos";
import { TablaPuestos } from "./components/TablaPuestos";
import { ModalMostrarHistorial } from "./components/ModalMostrarHistorial";
import { ModalTraspaso } from "./components/ModalTraspaso";
import { ModalEditarPuesto } from "./components/ModalEditarPuesto";
import { ModalAsignarPuesto } from "./components/ModalAsignarPuesto"; // ← Nuevo

function GestionPatentesPuestosModule() {
  const [editarOpened, { open: openEditar, close: closeEditar }] = useDisclosure(false);
  const [traspasoOpened, { open: openTraspaso, close: closeTraspaso }] = useDisclosure(false);
  const [historialOpened, { open: openHistorial, close: closeHistorial }] = useDisclosure(false);
  const [asignarOpened, { open: openAsignar, close: closeAsignar }] = useDisclosure(false); // ← Nuevo

  const {
    puestos,
    loading,
    error,
    puestoParaTraspaso,
    setPuestoParaTraspaso,
    puestoParaAsignar,      // ← Nuevo
    setPuestoParaAsignar,   // ← Nuevo
    puestoSeleccionado,
    setPuestoSeleccionado,
    handleGuardarEdicion,
    handleEjecutarTraspaso,
    handleAsignacionExitosa // ← Nuevo
  } = usePuestos(closeEditar, closeTraspaso, closeAsignar); // ← Pasamos closeAsignar

  const filtros = usePuestosFiltros(puestos);

  const [puestoEditar, setPuestoEditar] = useState(null);
  const [puestoHistorial, setPuestoHistorial] = useState(null);

  if (loading && puestos.length === 0) {
    return (
      <Stack align="center" justify="center" style={{ height: '50vh' }}>
        <Loader size="xl" />
        <Text>Cargando puestos...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" p="xl" style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      <ModalMostrarHistorial
        opened={historialOpened}
        close={closeHistorial}
        puesto={puestoHistorial}
      />

      <ModalTraspaso
        opened={traspasoOpened}
        close={closeTraspaso}
        puestoSeleccionado={puestoParaTraspaso}
        onTraspaso={handleEjecutarTraspaso}
      />

      <ModalEditarPuesto
        opened={editarOpened}
        close={closeEditar}
        puesto={puestoEditar}
        onGuardar={handleGuardarEdicion}
      />

      {/* Nuevo modal para asignar puesto */}
      <ModalAsignarPuesto
        opened={asignarOpened}
        close={closeAsignar}
        puesto={puestoParaAsignar}
        onAsignado={handleAsignacionExitosa}
      />

      {/* PANEL DE FILTROS */}
      <Group>
        <Title order={2} fw={800}>GESTIÓN DE PUESTOS</Title>
        <Box style={{ borderBottom: '2px solid black', width: '150px' }} />
      </Group>

      <FiltrosPuestos
        {...filtros}
        puestos={filtros.puestosFiltrados}
        onTraspaso={() => {
          setPuestoParaTraspaso(null);
          openTraspaso();
        }}
      />

      <TablaPuestos
        puestos={filtros.puestosFiltrados}
        loading={loading}
        onEditar={(p) => { setPuestoEditar(p); openEditar(); }}
        onVerHistorial={(p) => { setPuestoHistorial(p); openHistorial(); }}
        onTraspaso={(p) => { setPuestoParaTraspaso(p); openTraspaso(); }}
        onAsignar={(p) => { setPuestoParaAsignar(p); openAsignar(); }} // ← Nueva prop
      />
    </Stack>
  );
}

export default GestionPatentesPuestosModule;