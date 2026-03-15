// frontend/src/modules/GestionPatentesPuestos/components/ModalEditarPuesto.jsx

// ============================================
// COMPONENTE MODAL EDITAR PUESTO
// ============================================

import { Modal, Text, Stack, Group } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import '../Styles/gestionpatentespuestos.css';

/**
 * Custom select con mismo diseño que el de los filtros.
 */
const CustomSelect = ({ value, onChange, opciones, label }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const labelActual = opciones.find(o => o.value === value)?.label || '';

  return (
    <div>
      {label && <label className="gp-form-label">{label}</label>}
      <div className="gp-custom-select" ref={ref}>
        <div className="gp-custom-select-selected" onClick={() => setAbierto(!abierto)}>
          <span>{labelActual}</span>
          <span className={`gp-custom-select-icon ${abierto ? 'open' : ''}`}>▾</span>
        </div>
        {abierto && (
          <div className="gp-custom-select-dropdown">
            {opciones.map(({ value: v, label: l }) => (
              <div key={v} className="gp-custom-select-option" onClick={() => { onChange(v); setAbierto(false); }}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal para editar los datos de un puesto existente.
 * Usa custom select igual al de los filtros y inputs nativos con fondo F6F9FF.
 * Si se ingresa nro_patente, tiene_patente se activa automáticamente.
 */
export function ModalEditarPuesto({ opened, close, puesto, onGuardar }) {
  const [form, setForm] = useState({});

  useEffect(() => { if (puesto) setForm(puesto); }, [puesto]);

  if (!puesto) return null;

  /**
   * Actualiza un campo del formulario con lógica reactiva.
   */
  const handle = (k, v) => {
    setForm((f) => {
      let newState = { ...f, [k]: v };
      if (k === 'nro_patente')                 newState.tiene_patente = v.trim() !== '';
      if (k === 'tiene_patente' && v === false) newState.nro_patente = '';
      return newState;
    });
  };

  // toque esta parte dejalo porfis
  return (
    <Modal
      opened={opened}
      onClose={close}
      size="md"
      centered
      withCloseButton={false}
      radius="lg"
      title={<Text className="gp-editar-titulo">EDITAR PUESTO</Text>}
    >
      <Stack>
        <Group grow>
          <div>
            <label className="gp-form-label">Nro Patente</label>
            <input type="text" value={form.nro_patente || ''} onChange={(e) => handle('nro_patente', e.target.value)} className="gp-form-input" />
          </div>
          <div>
            <label className="gp-form-label">Rubro</label>
            <input type="text" value={form.rubro || ''} onChange={(e) => handle('rubro', e.target.value)} className="gp-form-input" />
          </div>
        </Group>

        <Group grow>
          <div>
            <label className="gp-form-label">Ancho</label>
            <input type="text" value={form.ancho || ''} onChange={(e) => handle('ancho', e.target.value)} className="gp-form-input" />
          </div>
          <div>
            <label className="gp-form-label">Largo</label>
            <input type="text" value={form.largo || ''} onChange={(e) => handle('largo', e.target.value)} className="gp-form-input" />
          </div>
        </Group>

        <CustomSelect
          label="Estado Patente"
          value={form.tiene_patente ? '1' : '0'}
          onChange={(v) => handle('tiene_patente', v === '1')}
          opciones={[
            { value: '1', label: 'Con Patente' },
            { value: '0', label: 'Sin Patente' },
          ]}
        />

        {/* ── Guardar primero, cancelar después ── */}
        <Group justify="flex-end" mt={50} gap="md">
          <button onClick={close} className="gp-btn-cancelar" style={{ padding: '0 24px', height: '40px' }}>
            Cancelar
          </button>
          <button onClick={() => onGuardar(form)} className="gp-btn-guardar" style={{ padding: '0 24px', height: '40px' }}>
            Guardar Cambios
          </button>
          
        </Group>
      </Stack>
    </Modal>
  );
}