// modules/Directorio/components/ModalGestion.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Modal, ScrollArea, Button, Group, NumberInput,
  Text, Loader, Center, Badge, Alert,
} from '@mantine/core';
import { IconCalendar, IconUserPlus, IconAlertCircle } from '@tabler/icons-react';
import BuscadorAfiliado      from './BuscadorAfiliado';
import { useGuardarGestion } from '../hooks/useGuardarGestion';
import { SECRETARIAS_BASE }  from '../constantes/secretarias';
import {
  calcularAnioFin,
  actualizarAfiliadoEnFila,
  validarAnioInicio,
} from '../handlers/directorioHandlers';
import { directorioService } from '../services/directorioService';
import '../styles/directorio.css';

// ============================================================
// MERGE CORREGIDO
// Estrategia: SECRETARIAS_BASE define el orden de las 12 filas.
// Para cada posición buscamos datos en filasDirectorio usando
// el mapa por nombre (clave más confiable que id_secretaria
// cuando los ids pueden variar entre contextos).
// Así, los cargos que SÍ tienen datos conservan id_directorio.
// ============================================================

/**
 * Construye las 12 filas para el modal en modo 'editar'.
 * @param {Array} filasDirectorio  - viene de useDirectorio (tiene id_directorio real)
 * @param {Array} secretariasBD    - catálogo del backend (para id_secretaria)
 */
const construirFilasEditar = (filasDirectorio, secretariasBD) => {
  // Mapa nombre → fila del cuadro actual (fuente de verdad de ids)
  const mapaCuadro = new Map(
    (filasDirectorio || []).map((f) => [
      (f.nom_secretaria || '').trim().toUpperCase(),
      f,
    ])
  );

  // Mapa nombre → secretaria del catálogo BD (para id_secretaria fiable)
  const mapaCatalogo = new Map(
    (secretariasBD || []).map((s) => [
      s.nombre.trim().toUpperCase(),
      s,
    ])
  );

  return SECRETARIAS_BASE.map((base) => {
    const clave   = base.nombre.trim().toUpperCase();
    const enCuadro   = mapaCuadro.get(clave)   || null;
    const enCatalogo = mapaCatalogo.get(clave) || null;

    // id_secretaria: del catálogo BD si existe, si no null
    const id_secretaria = enCatalogo?.id_secretaria ?? enCuadro?.id_secretaria ?? null;

    return {
      id_secretaria,
      nom_secretaria:    base.nombre,
      orden:             base.orden,
      // id_directorio viene del cuadro real (no del catálogo)
      id_directorio:     enCuadro?.id_directorio     ?? null,
      id_afiliado_prev:  enCuadro?.id_afiliado        ?? null,
      id_afiliado_nuevo: enCuadro?.id_afiliado        ?? null,
      nom_afiliado_nuevo:enCuadro?.nom_afiliado       ?? '',
      ci_nuevo:          enCuadro?.ci                 ?? '',
    };
  });
};

/**
 * Construye las 12 filas vacías para el modal en modo 'nueva'.
 * @param {Array} secretariasBD - catálogo del backend
 */
const construirFilasNuevas = (secretariasBD) => {
  const mapaCatalogo = new Map(
    (secretariasBD || []).map((s) => [s.nombre.trim().toUpperCase(), s])
  );

  return SECRETARIAS_BASE.map((base) => {
    const enCatalogo = mapaCatalogo.get(base.nombre.trim().toUpperCase()) || null;
    return {
      id_secretaria:     enCatalogo?.id_secretaria ?? null,
      nom_secretaria:    base.nombre,
      orden:             base.orden,
      id_directorio:     null,
      id_afiliado_prev:  null,
      id_afiliado_nuevo: null,
      nom_afiliado_nuevo:'',
      ci_nuevo:          '',
    };
  });
};

// ── Alturas fijas de los bloques estáticos (px) ──────────────
const ALTO = {
  modalOverhead: 72,
  selectorAnio:  90,
  badge:         44,
  alerta:        56,
  theadRow:      40,
  footer:        74,
  gaps:          48,
};

const calcularAltoScroll = (modo, hayError) => {
  const superior = modo === 'nueva' ? ALTO.selectorAnio : ALTO.badge;
  const alerta   = hayError ? ALTO.alerta : 0;
  const ocupado  = ALTO.modalOverhead + superior + alerta + ALTO.theadRow + ALTO.footer + ALTO.gaps;
  return `calc(88vh - ${ocupado}px)`;
};

const ModalGestion = ({
  opened,
  onClose,
  modo,
  idGestion,
  gestionLabel,
  filasDirectorio,
  secretarias,
  onGuardado,
}) => {
  const { guardar, guardando } = useGuardarGestion();

  const [filasModal,    setFilasModal]    = useState([]);
  const [anioInicio,    setAnioInicio]    = useState(new Date().getFullYear() - 1);
  const [errorAnio,     setErrorAnio]     = useState('');
  const [errorGeneral,  setErrorGeneral]  = useState('');
  const [creandoGest,   setCreandoGest]   = useState(false);

  const anioFin = calcularAnioFin(anioInicio);

  // ── Inicializar filas al abrir ───────────────────────────
  useEffect(() => {
    if (!opened) return;
    setErrorGeneral('');
    setErrorAnio('');

    if (modo === 'editar') {
      setFilasModal(construirFilasEditar(filasDirectorio, secretarias));
    } else {
      setFilasModal(construirFilasNuevas(secretarias));
      setAnioInicio(new Date().getFullYear() - 1);
    }
  }, [opened, modo, filasDirectorio, secretarias]);

  const handleCambioAnio = (valor) => {
    setAnioInicio(valor ?? '');
    setErrorAnio(validarAnioInicio(valor) || '');
  };

  const handleSeleccionarAfiliado = useCallback((idSecretaria, afiliado) => {
    setFilasModal((prev) => actualizarAfiliadoEnFila(prev, idSecretaria, afiliado));
  }, []);

  const handleGuardar = async () => {
    setErrorGeneral('');

    if (modo === 'nueva') {
      const errAnio = validarAnioInicio(anioInicio);
      if (errAnio) { setErrorAnio(errAnio); return; }

      setCreandoGest(true);
      let idGestionNueva;
      try {
        const res = await directorioService.crearGestion(
          parseInt(anioInicio), parseInt(anioFin)
        );
        idGestionNueva = res.data?.id_gestion;
        if (!idGestionNueva) throw new Error('No se recibió id_gestion del servidor');
      } catch (err) {
        setErrorGeneral(err.message || 'No se pudo crear la gestión');
        setCreandoGest(false);
        return;
      } finally {
        setCreandoGest(false);
      }

      await guardar({
        idGestion: idGestionNueva,
        filasModal,
        onSuccess: () => { if (onGuardado) onGuardado(); onClose(); },
      });
    } else {
      if (!idGestion) { setErrorGeneral('No hay gestión seleccionada'); return; }
      await guardar({
        idGestion,
        filasModal,
        onSuccess: () => { if (onGuardado) onGuardado(); onClose(); },
      });
    }
  };

  const ocupado     = guardando || creandoGest;
  const conAfiliado = filasModal.filter((f) => f.id_afiliado_nuevo).length;
  const altoScroll  = calcularAltoScroll(modo, !!errorGeneral);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="75%"
      centered
      withCloseButton
      closeOnClickOutside={!ocupado}
      overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
      styles={{
        header: { paddingBottom: 0, borderBottom: 'none' },
        body:   { padding: '8px 24px 16px' },
        close:  { color: '#0F0F0F' },
      }}
      title={
        <div className="dir-modal-header-row">
          <h2 className="dir-modal-titulo">
            {modo === 'nueva' ? 'NUEVA GESTIÓN' : 'EDITAR GESTIÓN'}
          </h2>
          <hr className="dir-modal-linea" aria-hidden="true" />
        </div>
      }
    >
      {/* ── Error general ── */}
      {errorGeneral && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red" mb="sm"
          withCloseButton
          onClose={() => setErrorGeneral('')}
        >
          {errorGeneral}
        </Alert>
      )}

      {/* ── Selector año (modo 'nueva') ── */}
      {modo === 'nueva' && (
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '16px',
          paddingBottom: '14px', borderBottom: '1px solid #F6F9FF',
          marginBottom: '12px', flexWrap: 'wrap',
        }}>
          <div>
            <Text size="xs" fw={600} mb={4}
              style={{ color: '#374567', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Año inicio
            </Text>
            <NumberInput
              value={anioInicio}
              onChange={handleCambioAnio}
              min={1990} max={new Date().getFullYear() + 10} step={1}
              error={errorAnio}
              leftSection={<IconCalendar size={14} />}
              styles={{
                input: {
                  width: '130px', fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px', backgroundColor: '#F6F9FF',
                  border: '1px solid #E2ECFF', borderRadius: '8px',
                },
              }}
            />
          </div>

          <div style={{ paddingBottom: '8px', color: '#C4C4C4', fontSize: '20px' }}>→</div>

          <div>
            <Text size="xs" fw={600} mb={4}
              style={{ color: '#374567', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Año fin (auto)
            </Text>
            <div style={{
              width: '130px', height: '36px', display: 'flex',
              alignItems: 'center', padding: '0 12px',
              backgroundColor: '#E2ECFF', borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif', fontWeight: 600,
              fontSize: '14px', color: '#374567',
            }}>
              {anioFin || '—'}
            </div>
          </div>

          <div style={{ paddingBottom: '4px' }}>
            <Badge size="lg" style={{
              backgroundColor: '#0E1528', color: '#EDBE3C',
              fontFamily: 'Poppins, sans-serif', fontWeight: 600,
            }}>
              Gestión {anioInicio} — {anioFin || '?'}
            </Badge>
          </div>
        </div>
      )}

      {/* ── Badge gestión (modo 'editar') ── */}
      {modo === 'editar' && gestionLabel && (
        <div style={{ marginBottom: '12px' }}>
          <Badge size="lg" style={{
            backgroundColor: '#0E1528', color: '#EDBE3C',
            fontFamily: 'Poppins, sans-serif', fontWeight: 600,
          }}>
            Gestión {gestionLabel}
          </Badge>
        </div>
      )}

      {/* ── Encabezado fijo (fuera del scroll) ── */}
      <div className="dir-modal-tabla">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th style={{ width: '260px' }}>Cargo</th>
              <th>Afiliado</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* ── Cuerpo con scroll ── */}
      {filasModal.length === 0 ? (
        <Center style={{ height: altoScroll }}>
          <Loader size="sm" color="dark" />
          <Text ml="sm" size="sm" style={{ color: '#C4C4C4' }}>
            Cargando secretarías...
          </Text>
        </Center>
      ) : (
        <ScrollArea
          h={altoScroll}
          offsetScrollbars
          scrollbarSize={6}
          type="always"
        >
          <div className="dir-modal-tabla">
            <table style={{ width: '100%' }}>
              <tbody>
                {filasModal.map((fila) => (
                  <tr key={fila.id_secretaria ?? fila.nom_secretaria}>
                    <td style={{ width: '40px' }}>
                      <span className="dir-cargo-orden">{fila.orden}</span>
                    </td>
                    <td style={{ width: '260px' }}>
                      <span className="dir-cargo-nombre">{fila.nom_secretaria}</span>
                    </td>
                    <td>
                      <BuscadorAfiliado
                        value={fila.nom_afiliado_nuevo}
                        onSeleccionar={(af) =>
                          handleSeleccionarAfiliado(fila.id_secretaria, af)
                        }
                        onChange={(texto) => {
                          if (!texto)
                            setFilasModal((prev) =>
                              actualizarAfiliadoEnFila(prev, fila.id_secretaria, null)
                            );
                        }}
                        placeholder="Buscar por nombre o CI..."
                        disabled={ocupado}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      )}

      {/* ── Pie ── */}
      <Group
        justify="space-between" align="center"
        pt="md" mt="sm"
        style={{ borderTop: '1px solid #F6F9FF' }}
      >
        <Text size="sm" style={{ color: '#C4C4C4', fontFamily: 'Poppins, sans-serif' }}>
          {conAfiliado} de {filasModal.length} cargos asignados
        </Text>
        <Group gap="md">
          <Button
            variant="outline" onClick={onClose} disabled={ocupado}
            style={{
              borderColor: '#0F0F0F', color: '#0F0F0F',
              borderRadius: '100px', padding: '0 28px', height: '42px',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar} loading={ocupado}
            leftSection={!ocupado && <IconUserPlus size={16} />}
            style={{
              backgroundColor: '#0F0F0F', color: 'white',
              borderRadius: '100px', padding: '0 28px', height: '42px', fontWeight: 500,
            }}
          >
            {creandoGest ? 'Creando gestión...' : guardando ? 'Guardando...' : 'Guardar Directorio'}
          </Button>
        </Group>
      </Group>
    </Modal>
  );
};

export default ModalGestion;