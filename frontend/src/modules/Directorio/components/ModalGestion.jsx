import { useState, useEffect, useCallback } from 'react';
import {
  Modal, ScrollArea, Button, Group, NumberInput,
  Text, Loader, Center, Badge, Alert,
} from '@mantine/core';
import { IconCalendar, IconUserPlus, IconAlertCircle } from '@tabler/icons-react';
import { notifications }          from '@mantine/notifications';
import BuscadorAfiliado           from './BuscadorAfiliado';
import { useGuardarGestion }      from '../hooks/useGuardarGestion';
import { SECRETARIAS_BASE }       from '../constantes/secretarias';
import {
  calcularAnioFin,
  inicializarFilasModal,
  inicializarFilasVacias,
  actualizarAfiliadoEnFila,
  validarAnioInicio,
} from '../handlers/directorioHandlers';
import { directorioService } from '../services/directorioService';
import '../styles/directorio.css';

// ============================================================
// MODAL GESTIÓN  (versión corregida)
//
// Modo 'nueva':
//   1. El usuario elige anio_inicio (anio_fin se autocompleta)
//   2. Al guardar:  POST /gestiones → obtiene id_gestion
//                   luego asigna cada cargo con ese id
//
// Modo 'editar':
//   - Filas pre-pobladas, gestión ya existe → misma lógica
//     de useGuardarGestion que antes
//
// Fix secretarías:
//   - Siempre usa SECRETARIAS_BASE como esqueleto de 12 filas
//     y solo enriquece con los ids reales del catálogo.
//     Así el modal nunca queda en blanco aunque la BD esté
//     vacía o el prop secretarias llegue tarde.
// ============================================================

// ── Merge: combina SECRETARIAS_BASE (12 fijas) con los ids
//    que devuelve el backend para hacer el match correcto ────
const construirFilasBase = (secretariasBD) => {
  return SECRETARIAS_BASE.map((base) => {
    // Buscar por nombre exacto en el catálogo de la BD
    const encontrada = secretariasBD.find(
      (s) => s.nombre.trim().toUpperCase() === base.nombre.trim().toUpperCase()
    );
    return {
      id_secretaria: encontrada?.id_secretaria ?? null,
      nombre:        base.nombre,
      orden:         base.orden,
    };
  });
};

const ModalGestion = ({
  opened,
  onClose,
  modo,              // 'nueva' | 'editar'
  idGestion,         // null en modo 'nueva', number en modo 'editar'
  gestionLabel,      // "2023 — 2025"
  filasDirectorio,   // estado actual del cuadro (de useDirectorio)
  secretarias,       // catálogo [{id_secretaria, nombre, orden}]
  onGuardado,
}) => {
  const { guardar, guardando } = useGuardarGestion();

  const [filasModal,  setFilasModal]  = useState([]);
  const [anioInicio,  setAnioInicio]  = useState(new Date().getFullYear() - 1);
  const [errorAnio,   setErrorAnio]   = useState('');
  const [errorGeneral,setErrorGeneral]= useState('');
  const [creandoGest, setCreandoGest] = useState(false);

  const anioFin = calcularAnioFin(anioInicio);

  // ── Inicializar filas al abrir ─────────────────────────
  useEffect(() => {
    if (!opened) return;
    setErrorGeneral('');
    setErrorAnio('');

    // Base de 12 filas siempre desde SECRETARIAS_BASE + ids del catálogo
    const base12 = construirFilasBase(secretarias || []);

    if (modo === 'editar' && filasDirectorio?.length > 0) {
      // Enriquecer cada fila del cuadro con la info del directorio actual
      const filasEnriquecidas = base12.map((base) => {
        const enCuadro = filasDirectorio.find(
          (f) =>
            (base.id_secretaria && f.id_secretaria === base.id_secretaria) ||
            f.nom_secretaria?.trim().toUpperCase() === base.nombre.trim().toUpperCase()
        );
        return {
          id_secretaria:     base.id_secretaria,
          nom_secretaria:    base.nombre,
          orden:             base.orden,
          id_directorio:     enCuadro?.id_directorio     ?? null,
          id_afiliado_prev:  enCuadro?.id_afiliado       ?? null,
          id_afiliado_nuevo: enCuadro?.id_afiliado       ?? null,
          nom_afiliado_nuevo:enCuadro?.nom_afiliado      ?? '',
          ci_nuevo:          enCuadro?.ci                ?? '',
        };
      });
      setFilasModal(filasEnriquecidas);
    } else {
      // Modo 'nueva' o cuadro vacío → todas las filas vacías
      setFilasModal(
        base12.map((s) => ({
          id_secretaria:     s.id_secretaria,
          nom_secretaria:    s.nombre,
          orden:             s.orden,
          id_directorio:     null,
          id_afiliado_prev:  null,
          id_afiliado_nuevo: null,
          nom_afiliado_nuevo:'',
          ci_nuevo:          '',
        }))
      );
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

  // ── Guardar ────────────────────────────────────────────
  const handleGuardar = async () => {
    setErrorGeneral('');

    if (modo === 'nueva') {
      // 1. Validar año
      const errAnio = validarAnioInicio(anioInicio);
      if (errAnio) { setErrorAnio(errAnio); return; }

      // 2. Crear la gestión en la BD
      setCreandoGest(true);
      let idGestionNueva;
      try {
        const res = await directorioService.crearGestion(
          parseInt(anioInicio),
          parseInt(anioFin)
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

      // 3. Asignar cargos con el id recién creado
      await guardar({
        idGestion: idGestionNueva,
        filasModal,
        onSuccess: () => { if (onGuardado) onGuardado(); onClose(); },
      });

    } else {
      // Modo editar: gestión ya existe
      if (!idGestion) {
        setErrorGeneral('No hay gestión seleccionada');
        return;
      }
      await guardar({
        idGestion,
        filasModal,
        onSuccess: () => { if (onGuardado) onGuardado(); onClose(); },
      });
    }
  };

  const conAfiliado = filasModal.filter((f) => f.id_afiliado_nuevo).length;
  const ocupado     = guardando || creandoGest;

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
        body:   { paddingTop: '8px' },
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
          color="red"
          mb="md"
          onClose={() => setErrorGeneral('')}
          withCloseButton
        >
          {errorGeneral}
        </Alert>
      )}

      {/* ── Selector de año (solo modo 'nueva') ── */}
      {modo === 'nueva' && (
        <div style={{
          display:       'flex',
          alignItems:    'flex-end',
          gap:           '16px',
          padding:       '14px 0 20px',
          borderBottom:  '1px solid #F6F9FF',
          marginBottom:  '16px',
          flexWrap:      'wrap',
        }}>
          {/* Año inicio */}
          <div>
            <Text size="xs" fw={600} mb={4}
              style={{ color: '#374567', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Año inicio
            </Text>
            <NumberInput
              value={anioInicio}
              onChange={handleCambioAnio}
              min={1990}
              max={new Date().getFullYear() + 10}
              step={1}
              error={errorAnio}
              leftSection={<IconCalendar size={14} />}
              styles={{
                input: {
                  width: '130px',
                  fontFamily:      'Poppins, sans-serif',
                  fontSize:        '14px',
                  backgroundColor: '#F6F9FF',
                  border:          '1px solid #E2ECFF',
                  borderRadius:    '8px',
                },
              }}
            />
          </div>

          <div style={{ paddingBottom: '8px', color: '#C4C4C4', fontSize: '20px', fontWeight: 300 }}>
            →
          </div>

          {/* Año fin (bloqueado, autocalculado) */}
          <div>
            <Text size="xs" fw={600} mb={4}
              style={{ color: '#374567', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Año fin (auto)
            </Text>
            <div style={{
              width: '130px', height: '36px',
              display: 'flex', alignItems: 'center', padding: '0 12px',
              backgroundColor: '#E2ECFF', borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif', fontWeight: 600,
              fontSize: '14px', color: '#374567',
            }}>
              {anioFin || '—'}
            </div>
          </div>

          {/* Badge resumen */}
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

      {/* ── Badge gestión en modo editar ── */}
      {modo === 'editar' && gestionLabel && (
        <div style={{ marginBottom: '14px' }}>
          <Badge size="lg" style={{
            backgroundColor: '#0E1528', color: '#EDBE3C',
            fontFamily: 'Poppins, sans-serif', fontWeight: 600,
          }}>
            Gestión {gestionLabel}
          </Badge>
        </div>
      )}

      {/* ── Tabla de las 12 secretarías ── */}
      {filasModal.length === 0 ? (
        <Center py="xl">
          <Loader size="sm" color="dark" />
          <Text ml="sm" size="sm" style={{ color: '#C4C4C4' }}>
            Cargando secretarías...
          </Text>
        </Center>
      ) : (
        <ScrollArea style={{ maxHeight: '55vh' }} offsetScrollbars>
          <div className="dir-modal-tabla">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th style={{ width: '260px' }}>Cargo</th>
                  <th>Afiliado</th>
                </tr>
              </thead>
              <tbody>
                {filasModal.map((fila) => (
                  <tr key={fila.id_secretaria ?? fila.nom_secretaria}>
                    <td>
                      <span className="dir-cargo-orden">{fila.orden}</span>
                    </td>
                    <td>
                      <span className="dir-cargo-nombre">{fila.nom_secretaria}</span>
                    </td>
                    <td>
                      <BuscadorAfiliado
                        value={fila.nom_afiliado_nuevo}
                        onSeleccionar={(af) =>
                          handleSeleccionarAfiliado(fila.id_secretaria, af)
                        }
                        onChange={(texto) => {
                          if (!texto) {
                            setFilasModal((prev) =>
                              actualizarAfiliadoEnFila(prev, fila.id_secretaria, null)
                            );
                          }
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
        justify="space-between" align="center" mt="xl" pt="md"
        style={{ borderTop: '1px solid #F6F9FF' }}
      >
        <Text size="sm" style={{ color: '#C4C4C4', fontFamily: 'Poppins, sans-serif' }}>
          {conAfiliado} de {filasModal.length} cargos asignados
        </Text>

        <Group gap="md">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={ocupado}
            style={{
              borderColor: '#0F0F0F', color: '#0F0F0F',
              borderRadius: '100px', padding: '0 28px', height: '42px',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            loading={ocupado}
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