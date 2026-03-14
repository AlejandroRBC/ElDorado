import { useState, useEffect, useCallback } from 'react';
import { Modal, ScrollArea, Button, Group, NumberInput, Text, Loader, Center, Badge } from '@mantine/core';
import { IconCalendar, IconUserPlus } from '@tabler/icons-react';
import BuscadorAfiliado     from './BuscadorAfiliado';
import { useGuardarGestion } from '../hooks/useGuardarGestion';
import {
  calcularAnioFin,
  inicializarFilasModal,
  inicializarFilasVacias,
  actualizarAfiliadoEnFila,
  validarAnioInicio,
} from '../handlers/directorioHandlers';
import '../styles/directorio.css';

// ============================================================
// MODAL GESTIÓN
// Modo 'nueva':  todas las filas vacías + selector de año
// Modo 'editar': filas pre-pobladas con la gestión actual,
//                sin selector de año (la gestión ya está fija)
// ============================================================

const ModalGestion = ({
  opened,
  onClose,
  modo,              // 'nueva' | 'editar'
  idGestion,         // null en modo 'nueva', número en modo 'editar'
  gestionLabel,      // "2023 — 2025"
  filasDirectorio,   // estado actual del cuadro (de useDirectorio)
  secretarias,       // lista del catálogo [{id_secretaria, nombre, orden}]
  onGuardado,        // callback tras guardar con éxito
}) => {
  const { guardar, guardando } = useGuardarGestion();

  // ── Estado del formulario ────────────────────────────────
  const [filasModal,   setFilasModal]   = useState([]);
  const [anioInicio,   setAnioInicio]   = useState(2023);
  const [errorAnio,    setErrorAnio]    = useState('');

  // Año fin calculado automáticamente
  const anioFin = calcularAnioFin(anioInicio);

  // Inicializar filas cuando se abre el modal
  useEffect(() => {
    if (!opened) return;

    if (modo === 'editar' && filasDirectorio?.length > 0) {
      setFilasModal(inicializarFilasModal(filasDirectorio));
    } else {
      // modo 'nueva' o cuadro vacío
      const base = secretarias?.length > 0 ? secretarias : [];
      setFilasModal(inicializarFilasVacias(base));
      setAnioInicio(new Date().getFullYear() - 1); // sugiere año anterior como inicio
    }
  }, [opened, modo, filasDirectorio, secretarias]);

  const handleCambioAnio = (valor) => {
    setAnioInicio(valor);
    setErrorAnio(validarAnioInicio(valor) || '');
  };

  const handleSeleccionarAfiliado = useCallback((idSecretaria, afiliado) => {
    setFilasModal((prev) => actualizarAfiliadoEnFila(prev, idSecretaria, afiliado));
  }, []);

  const handleGuardar = async () => {
    if (modo === 'nueva') {
      const err = validarAnioInicio(anioInicio);
      if (err) { setErrorAnio(err); return; }
    }

    // En modo 'nueva' el idGestion vendrá del backend al crear la gestión.
    // Por ahora el backend solo permite asignar a una gestión ya existente,
    // así que si es 'nueva' y no hay idGestion, mostramos aviso.
    // (La creación de gestión se hace desde el PARCHE_db cuando se inicia
    //  el servidor. Un endpoint futuro podría crearlo aquí.)
    const gestionId = modo === 'editar' ? idGestion : idGestion;
    if (!gestionId) return;

    await guardar({
      idGestion: gestionId,
      filasModal,
      onSuccess: () => {
        if (onGuardado) onGuardado();
        onClose();
      },
    });
  };

  // ── Conteo de filas con afiliado ─────────────────────────
  const conAfiliado = filasModal.filter((f) => f.id_afiliado_nuevo).length;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="75%"
      centered
      withCloseButton
      closeOnClickOutside={!guardando}
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
      {/* ── Selector de año (solo en modo 'nueva') ── */}
      {modo === 'nueva' && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '14px 0 20px',
          borderBottom: '1px solid #F6F9FF',
          marginBottom: '16px',
        }}>
          <div>
            <Text size="xs" fw={600} mb={4} style={{ color: '#374567', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Año inicio
            </Text>
            <NumberInput
              value={anioInicio}
              onChange={handleCambioAnio}
              min={1990}
              max={new Date().getFullYear() + 5}
              step={1}
              hideControls={false}
              error={errorAnio}
              leftSection={<IconCalendar size={14} />}
              styles={{
                input: {
                  width: '130px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  backgroundColor: '#F6F9FF',
                  border: '1px solid #E2ECFF',
                  borderRadius: '8px',
                },
              }}
            />
          </div>

          <div style={{ paddingTop: '24px', color: '#C4C4C4', fontSize: '18px', fontWeight: 300 }}>→</div>

          <div>
            <Text size="xs" fw={600} mb={4} style={{ color: '#374567', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Año fin (auto)
            </Text>
            <div style={{
              width: '130px', height: '36px',
              display: 'flex', alignItems: 'center',
              padding: '0 12px',
              backgroundColor: '#E2ECFF',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: '#374567',
            }}>
              {anioFin || '—'}
            </div>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <Badge
              size="lg"
              style={{ backgroundColor: '#0E1528', color: '#EDBE3C', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
            >
              Gestión {anioInicio} — {anioFin || '?'}
            </Badge>
          </div>
        </div>
      )}

      {/* ── Etiqueta gestión en modo editar ── */}
      {modo === 'editar' && gestionLabel && (
        <div style={{ marginBottom: '14px' }}>
          <Badge
            size="lg"
            style={{ backgroundColor: '#0E1528', color: '#EDBE3C', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
          >
            Gestión {gestionLabel}
          </Badge>
        </div>
      )}

      {/* ── Tabla de secretarías ── */}
      {filasModal.length === 0 ? (
        <Center py="xl">
          <Loader size="sm" color="dark" />
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
                  <tr key={fila.id_secretaria || fila.nom_secretaria}>
                    {/* Orden */}
                    <td>
                      <span className="dir-cargo-orden">{fila.orden}</span>
                    </td>

                    {/* Cargo (no editable) */}
                    <td>
                      <span className="dir-cargo-nombre">{fila.nom_secretaria}</span>
                    </td>

                    {/* Buscador de afiliado */}
                    <td>
                      <BuscadorAfiliado
                        value={fila.nom_afiliado_nuevo}
                        onSeleccionar={(af) => handleSeleccionarAfiliado(fila.id_secretaria, af)}
                        onChange={(texto) => {
                          // Si el usuario borra el texto manualmente, limpiamos
                          if (!texto) {
                            setFilasModal((prev) =>
                              actualizarAfiliadoEnFila(prev, fila.id_secretaria, null)
                            );
                          }
                        }}
                        placeholder="Buscar por nombre o CI..."
                        disabled={guardando}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      )}

      {/* ── Pie del modal ── */}
      <Group justify="space-between" align="center" mt="xl" pt="md" style={{ borderTop: '1px solid #F6F9FF' }}>
        <Text size="sm" style={{ color: '#C4C4C4', fontFamily: 'Poppins, sans-serif' }}>
          {conAfiliado} de {filasModal.length} cargos asignados
        </Text>

        <Group gap="md">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={guardando}
            style={{ borderColor: '#0F0F0F', color: '#0F0F0F', borderRadius: '100px', padding: '0 28px', height: '42px' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            loading={guardando}
            leftSection={!guardando && <IconUserPlus size={16} />}
            style={{ backgroundColor: '#0F0F0F', color: 'white', borderRadius: '100px', padding: '0 28px', height: '42px', fontWeight: 500 }}
          >
            {guardando ? 'Guardando...' : 'Guardar Directorio'}
          </Button>
        </Group>
      </Group>
    </Modal>
  );
};

export default ModalGestion;