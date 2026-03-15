// modules/Directorio/components/ModalGestion.jsx

// ============================================================
// COMPONENTE MODAL GESTIÓN
// ============================================================

import { useState, useEffect, useCallback }             from 'react';
import { Modal, ScrollArea, Group, NumberInput,
         Text, Loader, Center, Badge, Alert }           from '@mantine/core';
import { IconCalendar, IconAlertCircle }                from '@tabler/icons-react';
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

// ── Alturas fijas para calcular el scroll ──
const ALTO = { modalOverhead: 72, selectorAnio: 90, badge: 44, alerta: 56, theadRow: 40, footer: 74, gaps: 48 };

const calcularAltoScroll = (modo, hayError) => {
  const superior = modo === 'nueva' ? ALTO.selectorAnio : ALTO.badge;
  const alerta   = hayError ? ALTO.alerta : 0;
  return `calc(88vh - ${ALTO.modalOverhead + superior + alerta + ALTO.theadRow + ALTO.footer + ALTO.gaps}px)`;
};

/**
 * Construye las 12 filas para el modal en modo editar.
 */
const construirFilasEditar = (filasDirectorio, secretariasBD) => {
  const mapaCuadro   = new Map((filasDirectorio || []).map((f) => [(f.nom_secretaria || '').trim().toUpperCase(), f]));
  const mapaCatalogo = new Map((secretariasBD || []).map((s) => [s.nombre.trim().toUpperCase(), s]));
  return SECRETARIAS_BASE.map((base) => {
    const clave = base.nombre.trim().toUpperCase();
    const enCuadro   = mapaCuadro.get(clave)   || null;
    const enCatalogo = mapaCatalogo.get(clave)  || null;
    return {
      id_secretaria:     enCatalogo?.id_secretaria ?? enCuadro?.id_secretaria ?? null,
      nom_secretaria:    base.nombre,
      orden:             base.orden,
      id_directorio:     enCuadro?.id_directorio     ?? null,
      id_afiliado_prev:  enCuadro?.id_afiliado        ?? null,
      id_afiliado_nuevo: enCuadro?.id_afiliado        ?? null,
      nom_afiliado_nuevo:enCuadro?.nom_afiliado       ?? '',
      ci_nuevo:          enCuadro?.ci                 ?? '',
    };
  });
};

/**
 * Construye las 12 filas vacías para el modal en modo nueva.
 */
const construirFilasNuevas = (secretariasBD) => {
  const mapaCatalogo = new Map((secretariasBD || []).map((s) => [s.nombre.trim().toUpperCase(), s]));
  return SECRETARIAS_BASE.map((base) => {
    const enCatalogo = mapaCatalogo.get(base.nombre.trim().toUpperCase()) || null;
    return {
      id_secretaria: enCatalogo?.id_secretaria ?? null,
      nom_secretaria: base.nombre, orden: base.orden,
      id_directorio: null, id_afiliado_prev: null,
      id_afiliado_nuevo: null, nom_afiliado_nuevo: '', ci_nuevo: '',
    };
  });
};

/**
 * Modal unificado para crear o editar una gestión del directorio.
 * Botones nativos con clases CSS: cancelar negro→amarillo, guardar amarillo→negro.
 *
 * opened         - Si el modal está visible
 * onClose        - Callback para cerrar
 * modo           - 'nueva' | 'editar'
 * idGestion      - ID gestión a editar
 * gestionLabel   - Label legible de la gestión
 * filasDirectorio - Filas actuales del cuadro
 * secretarias    - Catálogo de secretarías
 * onGuardado     - Callback al guardar con éxito
 */
const ModalGestion = ({ opened, onClose, modo, idGestion, gestionLabel, filasDirectorio, secretarias, onGuardado }) => {
  const { guardar, guardando } = useGuardarGestion();

  const [filasModal,   setFilasModal]   = useState([]);
  const [anioInicio,   setAnioInicio]   = useState(new Date().getFullYear() - 1);
  const [errorAnio,    setErrorAnio]    = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [creandoGest,  setCreandoGest]  = useState(false);

  const anioFin = calcularAnioFin(anioInicio);

  useEffect(() => {
    if (!opened) return;
    setErrorGeneral(''); setErrorAnio('');
    if (modo === 'editar') setFilasModal(construirFilasEditar(filasDirectorio, secretarias));
    else { setFilasModal(construirFilasNuevas(secretarias)); setAnioInicio(new Date().getFullYear() - 1); }
  }, [opened, modo, filasDirectorio, secretarias]);

  const handleCambioAnio = (valor) => { setAnioInicio(valor ?? ''); setErrorAnio(validarAnioInicio(valor) || ''); };

  /**
   * Actualiza la fila al seleccionar afiliado.
   */
  const handleSeleccionarAfiliado = useCallback((idSecretaria, afiliado) => {
    setFilasModal((prev) => actualizarAfiliadoEnFila(prev, idSecretaria, afiliado));
  }, []);

  /**
   * Crea la gestión (si es nueva) y guarda los cargos.
   */
  const handleGuardar = async () => {
    setErrorGeneral('');
    if (modo === 'nueva') {
      const errAnio = validarAnioInicio(anioInicio);
      if (errAnio) { setErrorAnio(errAnio); return; }
      setCreandoGest(true);
      let idGestionNueva;
      try {
        const res = await directorioService.crearGestion(parseInt(anioInicio), parseInt(anioFin));
        idGestionNueva = res.data?.id_gestion;
        if (!idGestionNueva) throw new Error('No se recibió id_gestion del servidor');
      } catch (err) { setErrorGeneral(err.message || 'No se pudo crear la gestión'); setCreandoGest(false); return; }
      finally { setCreandoGest(false); }
      await guardar({ idGestion: idGestionNueva, filasModal, onSuccess: () => { if (onGuardado) onGuardado(); onClose(); } });
    } else {
      if (!idGestion) { setErrorGeneral('No hay gestión seleccionada'); return; }
      await guardar({ idGestion, filasModal, onSuccess: () => { if (onGuardado) onGuardado(); onClose(); } });
    }
  };

  const ocupado     = guardando || creandoGest;
  const conAfiliado = filasModal.filter((f) => f.id_afiliado_nuevo).length;
  const altoScroll  = calcularAltoScroll(modo, !!errorGeneral);

  return (
    <Modal
      opened={opened} onClose={onClose} size="75%" centered withCloseButton
      closeOnClickOutside={!ocupado}
      overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
      classNames={{ header: 'dir-modal-mantine-header', body: 'dir-modal-mantine-body', close: 'dir-modal-close' }}
      title={
        <div className="dir-modal-header-row">
          <h2 className="dir-modal-titulo">{modo === 'nueva' ? 'NUEVA GESTIÓN' : 'EDITAR GESTIÓN'}</h2>
          <hr className="dir-modal-linea" aria-hidden="true" />
        </div>
      }
    >
      {errorGeneral && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="sm" withCloseButton onClose={() => setErrorGeneral('')}>
          {errorGeneral}
        </Alert>
      )}

      {/* ── Selector año (nueva) ── */}
      {modo === 'nueva' && (
        <div className="dir-modal-selector-anio">
          <div>
            <Text className="dir-modal-label-anio">Año inicio</Text>
            <NumberInput value={anioInicio} onChange={handleCambioAnio} min={1990} max={new Date().getFullYear() + 10} step={1} error={errorAnio} leftSection={<IconCalendar size={14} />} classNames={{ input: 'dir-modal-input-anio' }} />
          </div>
          <div className="dir-modal-flecha">→</div>
          <div>
            <Text className="dir-modal-label-anio">Año fin (auto)</Text>
            <div className="dir-modal-anio-fin">{anioFin || '—'}</div>
          </div>
          <Badge className="dir-modal-badge-gestion">Gestión {anioInicio} — {anioFin || '?'}</Badge>
        </div>
      )}

      {/* ── Badge gestión (editar) ── */}
      {modo === 'editar' && gestionLabel && (
        <div style={{ marginBottom: '12px' }}>
          <Badge className="dir-modal-badge-gestion">Gestión {gestionLabel}</Badge>
        </div>
      )}

      {/* ── Header fijo tabla ── */}
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

      {/* ── Cuerpo scrolleable ── */}
      {filasModal.length === 0 ? (
        <Center style={{ height: altoScroll }}>
          <Loader size="sm" color="dark" />
          <Text ml="sm" size="sm" className="dir-texto-dimmed">Cargando secretarías...</Text>
        </Center>
      ) : (
        <ScrollArea h={altoScroll} offsetScrollbars scrollbarSize={6} type="always">
          <div className="dir-modal-tabla">
            <table style={{ width: '100%' }}>
              <tbody>
                {filasModal.map((fila) => (
                  <tr key={fila.id_secretaria ?? fila.nom_secretaria}>
                    <td style={{ width: '40px' }}><span className="dir-cargo-orden">{fila.orden}</span></td>
                    <td style={{ width: '260px' }}><span className="dir-cargo-nombre">{fila.nom_secretaria}</span></td>
                    <td>
                      <BuscadorAfiliado
                        value={fila.nom_afiliado_nuevo}
                        onSeleccionar={(af) => handleSeleccionarAfiliado(fila.id_secretaria, af)}
                        onChange={(texto) => { if (!texto) setFilasModal((prev) => actualizarAfiliadoEnFila(prev, fila.id_secretaria, null)); }}
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

      {/* ── Footer con botones nativos ── */}
      <div className="dir-modal-footer">
        <Group justify="space-between" align="center">
          <Text size="sm" className="dir-texto-dimmed">{conAfiliado} de {filasModal.length} cargos asignados</Text>
          <Group gap="md">
            <button onClick={onClose} disabled={ocupado} className="dir-modal-btn-cancelar">Cancelar</button>
            <button onClick={handleGuardar} disabled={ocupado} className="dir-modal-btn-guardar">
              {creandoGest ? 'Creando gestión...' : guardando ? 'Guardando...' : 'Guardar Directorio'}
            </button>
          </Group>
        </Group>
      </div>
    </Modal>
  );
};

export default ModalGestion;