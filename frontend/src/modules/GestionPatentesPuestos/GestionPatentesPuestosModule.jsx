import { useState, useEffect, useMemo } from "react";
import {Affix, Button,Transition,Stack, Title, Group, Box, Text, Loader } from "@mantine/core";
import { IconArrowUp } from '@tabler/icons-react';
import { useDisclosure } from "@mantine/hooks";

import { usePuestos } from "./hooks/usePuestos";
import { usePuestosFiltros } from "./hooks/usePuestosFiltros";


import { FiltrosPuestos } from "./components/FiltrosPuestos";
import { TablaPuestos } from "./components/TablaPuestos";

import { ModalMostrarHistorial } from "./components/ModalMostrarHistorial";
import { ModalTraspaso } from "./components/ModalTraspaso";
import { ModalEditarPuesto } from "./components/ModalEditarPuesto";


function GestionPatentesPuestosModule() {

  // Función para volver al inicio
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const [editarOpened,{open:openEditar,close:closeEditar}] = useDisclosure(false);
  const [traspasoOpened,{open:openTraspaso,close:closeTraspaso}] = useDisclosure(false);
  const [historialOpened,{open:openHistorial,close:closeHistorial}] = useDisclosure(false);

  const {
    puestos,
    loading,
    error,
    puestoParaTraspaso,
    setPuestoParaTraspaso,
    puestoSeleccionado,
    setPuestoSeleccionado,
    handleGuardarEdicion,
    handleEjecutarTraspaso
  } = usePuestos(closeEditar, closeTraspaso);

  const filtros = usePuestosFiltros(puestos);

  const [puestoEditar,setPuestoEditar] = useState(null);
  const [puestoHistorial,setPuestoHistorial] = useState(null);


  if (loading && puestos.length === 0) {
    return (
      <Stack align="center" justify="center" style={{ height:'50vh' }}>
        <Loader size="xl"/>
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
      {/* PANEL DE FILTROS */}
      <Group>
        <Title order={2} fw={800}>GESTIÓN DE PUESTOS</Title>
        <Box style={{ borderBottom:'2px solid black', width:'150px' }}/>
      </Group>

      <FiltrosPuestos
        {...filtros}
        puestos={filtros.puestosFiltrados}
        onTraspaso={() => {
          setPuestoParaTraspaso(null);
          openTraspaso()}}
      />

      <TablaPuestos
        puestos={filtros.puestosFiltrados}
        loading={loading}
        onEditar={(p)=>{ setPuestoEditar(p); openEditar(); }}
        onVerHistorial={(p)=>{ setPuestoHistorial(p); openHistorial(); }}
        onTraspaso={(p)=>{ setPuestoParaTraspaso(p); openTraspaso(); }}
      />
      <Affix position={{ bottom: 30, right: 30 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button
              leftSection={<IconArrowUp size={18} />}
              style={{
                ...transitionStyles,
                backgroundColor: '#0f0f0f',
                color: 'white',
                borderRadius: '50px',
                height: '50px',
                padding: '0 25px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                border: '2px solid #edbe3c',
                fontWeight: 600
              }}
              onClick={scrollToTop}
            >
              Volver arriba
            </Button>
          )}
        </Transition>
      </Affix>

    </Stack>
  );
}

export default GestionPatentesPuestosModule;