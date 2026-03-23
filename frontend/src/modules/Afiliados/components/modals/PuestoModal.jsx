import { memo, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal, Stack, Group, Text, Button, Paper, Box, Badge,
  Alert, ScrollArea, Loader, Center, TextInput, Checkbox, Select,
} from '@mantine/core';
import {
  IconAlertTriangle, IconSearch, IconX,
} from '@tabler/icons-react';

import { useAfiliadoActions } from '../../hooks/useAfiliadoActions';
import { afiliadosApi }       from '../../services/afiliados.api';
import '../../styles/Estilos.css';

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const ITEMS_PAGINA = 30;

const FILAS   = [{ value: '', label: 'Todas las filas' }, { value: 'A', label: 'Fila A' }, { value: 'B', label: 'Fila B' }];
const CUADRAS = [
  { value: '', label: 'Todas las cuadras' },
  { value: 'Cuadra 1', label: 'Cuadra 1' }, { value: 'Cuadra 2', label: 'Cuadra 2' },
  { value: 'Cuadra 3', label: 'Cuadra 3' }, { value: 'Cuadra 4', label: 'Cuadra 4' },
  { value: 'Callejón', label: 'Callejón'  },
];

// ─────────────────────────────────────────────────────────────
// MODO ASIGNAR
// ─────────────────────────────────────────────────────────────

const ContenidoAsignar = memo(({ idAfiliado, onPuestoAsignado, onCerrar }) => {
  const { asignarPuesto, loading } = useAfiliadoActions();

  const [puestosDisponibles, setPuestosDisponibles] = useState([]);
  const [cargandoPuestos,    setCargandoPuestos]    = useState(false);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [filtroFila,         setFiltroFila]         = useState('');
  const [filtroCuadra,       setFiltroCuadra]       = useState('');
  const [filtroNumero,       setFiltroNumero]       = useState('');
  const [rubro,              setRubro]              = useState('');
  const [tienePatente,       setTienePatente]       = useState(false);
  const [pagina,             setPagina]             = useState(1);

  useEffect(() => {
    setCargandoPuestos(true);
    afiliadosApi.obtenerPuestosDisponibles()
      .then(setPuestosDisponibles)
      .catch(() => {})
      .finally(() => setCargandoPuestos(false));
  }, []);

  const puestosFiltrados = useMemo(() => {
    return (puestosDisponibles || []).filter((p) => {
      if (filtroFila   && p.fila   !== filtroFila)                        return false;
      if (filtroCuadra && p.cuadra !== filtroCuadra)                      return false;
      if (filtroNumero && !p.nroPuesto.toString().includes(filtroNumero)) return false;
      return true;
    });
  }, [puestosDisponibles, filtroFila, filtroCuadra, filtroNumero]);

  const totalPaginas = Math.ceil(puestosFiltrados.length / ITEMS_PAGINA);
  const puestosPaginados = useMemo(() => {
    const start = (pagina - 1) * ITEMS_PAGINA;
    return puestosFiltrados.slice(start, start + ITEMS_PAGINA);
  }, [puestosFiltrados, pagina]);

  const handleAsignar = async () => {
    if (!puestoSeleccionado) return;
    const resultado = await asignarPuesto(idAfiliado, {
      fila:          puestoSeleccionado.fila,
      cuadra:        puestoSeleccionado.cuadra,
      nroPuesto:     parseInt(puestoSeleccionado.nroPuesto),
      rubro,
      tiene_patente: tienePatente,
    });
    if (resultado.exito) {
      onPuestoAsignado?.();
      onCerrar();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: 480 }}>
      {/* Panel izquierdo — tabla de disponibles */}
      <div style={{ flex: 1, borderRight: '1px solid #eee', padding: 20, overflowY: 'auto' }}>
        <Text fw={700} size="lg" mb="md" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          Puestos disponibles
        </Text>

        {/* Filtros */}
        <Group gap="xs" mb="md">
          <Select size="xs" placeholder="Fila" data={FILAS} value={filtroFila}
            onChange={(v) => { setFiltroFila(v || ''); setPagina(1); }} style={{ width: 110 }} />
          <Select size="xs" placeholder="Cuadra" data={CUADRAS} value={filtroCuadra}
            onChange={(v) => { setFiltroCuadra(v || ''); setPagina(1); }} style={{ width: 130 }} />
          <TextInput size="xs" placeholder="Nro." value={filtroNumero}
            onChange={(e) => { setFiltroNumero(e.target.value); setPagina(1); }} style={{ width: 80 }} />
        </Group>

        {cargandoPuestos
          ? <Center py="xl"><Loader size="sm" /></Center>
          : (
            <ScrollArea style={{ height: 320 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: 12 }}>Nro.</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: 12 }}>Fila</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: 12 }}>Cuadra</th>
                  </tr>
                </thead>
                <tbody>
                  {puestosPaginados.map((p) => {
                    const sel = puestoSeleccionado?.id_puesto === p.id_puesto;
                    return (
                      <tr key={p.id_puesto}
                        onClick={() => setPuestoSeleccionado(p)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: sel ? 'rgba(237,190,60,0.15)' : 'transparent',
                          borderBottom: '1px solid #f0f0f0',
                        }}>
                        <td style={{ padding: '8px', fontSize: 13 }}>{p.nroPuesto}</td>
                        <td style={{ padding: '8px', fontSize: 13 }}>{p.fila}</td>
                        <td style={{ padding: '8px', fontSize: 13 }}>{p.cuadra}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          )
        }

        {totalPaginas > 1 && (
          <Group justify="center" mt="xs">
            <Button size="xs" variant="subtle" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>‹</Button>
            <Text size="xs">{pagina} / {totalPaginas}</Text>
            <Button size="xs" variant="subtle" disabled={pagina === totalPaginas} onClick={() => setPagina((p) => p + 1)}>›</Button>
          </Group>
        )}
      </div>

      {/* Panel derecho — formulario */}
      <div style={{ width: 260, padding: 20, backgroundColor: '#fafafa' }}>
        {puestoSeleccionado ? (
          <Stack gap="md">
            <Text fw={700} style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18 }}>Asignar puesto</Text>
            <Paper p="sm" withBorder>
              <Text size="xs" c="dimmed">Puesto seleccionado</Text>
              <Text fw={700} size="lg" style={{ letterSpacing: 1 }}>
                {puestoSeleccionado.nroPuesto} — Fila {puestoSeleccionado.fila}
              </Text>
              <Text size="xs">{puestoSeleccionado.cuadra}</Text>
            </Paper>
            <TextInput label="Rubro" value={rubro} onChange={(e) => setRubro(e.target.value)}
              placeholder="Ej: Ropa, Comida..." />
            <Checkbox label="Tiene Patente" checked={tienePatente}
              onChange={(e) => setTienePatente(e.currentTarget.checked)} />
            <Button loading={loading} onClick={handleAsignar}
              style={{ backgroundColor: '#EDBE3C', color: '#0f0f0f', borderRadius: 100, fontWeight: 600 }}>
              Asignar Puesto
            </Button>
            <Button variant="outline" size="xs" onClick={onCerrar}>Cancelar</Button>
          </Stack>
        ) : (
          <Stack align="center" justify="center" style={{ height: '100%', color: '#C4C4C4' }}>
            <IconSearch size={36} />
            <Text size="sm" ta="center">Selecciona un puesto de la lista</Text>
          </Stack>
        )}
      </div>
    </div>
  );
});
ContenidoAsignar.displayName = 'ContenidoAsignar';

// ─────────────────────────────────────────────────────────────
// MODO ACCIÓN (desasignar/liberar)
// ─────────────────────────────────────────────────────────────

const ContenidoAccion = memo(({ puesto, idAfiliado, tipoAccion = 'despojar', onConfirmar, onCerrar, loading }) => {
  const esDespojo    = tipoAccion === 'despojar';
  const colorBadge   = esDespojo ? 'red' : 'green';
  const textoAccion  = esDespojo ? 'DESPOJAR PUESTO' : 'LIBERAR PUESTO';

  return (
    <Stack gap="xl" p="md">
      <Paper p="md" withBorder className="modal-confirmar-puesto-paper">
        <Group justify="space-between">
          <Box>
            <Text size="sm" className="modal-confirmar-puesto-label">Puesto</Text>
            <Text fw={700} size="xl" className="modal-confirmar-puesto-codigo">
              {puesto?.nroPuesto} — Fila {puesto?.fila}
            </Text>
            <Text size="sm">{puesto?.cuadra}</Text>
          </Box>
          <Badge size="lg" color={colorBadge} variant="filled" className="modal-confirmar-badge">
            {textoAccion}
          </Badge>
        </Group>
      </Paper>

      <Alert
        color={esDespojo ? 'red' : 'green'}
        icon={<IconAlertTriangle size={20} />}
        title={esDespojo ? 'Despojo de puesto' : 'Liberar puesto'}
        className={`modal-confirmar-alerta ${esDespojo ? 'alerta-despojo' : 'alerta-liberacion'}`}
      >
        <Text size="sm" className="modal-alerta-descripcion">
          {esDespojo
            ? 'Se quitará este puesto al afiliado. El puesto quedará disponible.'
            : 'Se liberará este puesto. Quedará disponible para ser asignado.'
          }
        </Text>
      </Alert>

      <Group justify="space-between" mt="xl" className="modal-confirmar-botones">
        <Button variant="outline" onClick={onCerrar} disabled={loading}
          leftSection={<IconX size={16} />} className="modal-confirmar-boton-cancelar">
          Cancelar
        </Button>
        <Button onClick={onConfirmar} loading={loading}
          color={esDespojo ? 'red' : 'green'} className="modal-confirmar-boton-confirmar">
          {loading ? 'Procesando...' : `Confirmar ${esDespojo ? 'despojo' : 'liberación'}`}
        </Button>
      </Group>
    </Stack>
  );
});
ContenidoAccion.displayName = 'ContenidoAccion';

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL — PuestoModal
// ─────────────────────────────────────────────────────────────

/**
 * Modal unificado para acciones sobre puestos.
 *
 * mode='asignar' → seleccionar puesto disponible y asignarlo al afiliado
 * mode='accion'  → confirmar desasignar/liberar un puesto
 *
 * data para 'asignar': { idAfiliado }
 * data para 'accion':  { puesto, idAfiliado, tipoAccion, onConfirmar, loading }
 */
const PuestoModal = memo(({
  opened,
  onClose,
  mode,
  data = {},
}) => {
  const titulos = {
    asignar: 'Asignar Puesto',
    accion:  'Confirmar Acción',
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={titulos[mode] || ''}
      size={mode === 'asignar' ? 900 : 'lg'}
      centered
      classNames={mode === 'accion' ? { header: 'modal-confirmar-header', body: 'modal-confirmar-body' } : {}}
      styles={mode === 'asignar' ? { body: { padding: 0 } } : {}}
    >
      {mode === 'asignar' && (
        <ContenidoAsignar
          idAfiliado={data.idAfiliado}
          onPuestoAsignado={data.onPuestoAsignado}
          onCerrar={onClose}
        />
      )}

      {mode === 'accion' && (
        <ContenidoAccion
          puesto={data.puesto}
          idAfiliado={data.idAfiliado}
          tipoAccion={data.tipoAccion || 'despojar'}
          onConfirmar={data.onConfirmar}
          onCerrar={onClose}
          loading={data.loading || false}
        />
      )}
    </Modal>
  );
});

PuestoModal.displayName = 'PuestoModal';
export default PuestoModal;