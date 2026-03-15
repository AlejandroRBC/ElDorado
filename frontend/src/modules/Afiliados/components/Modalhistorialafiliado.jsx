// components/ModalHistorialAfiliado.jsx
import { Box,Modal, ScrollArea, Text, Loader, Center } from '@mantine/core';
import {
  IconUserPlus,
  IconEdit,
  IconUserOff,
  IconUserCheck,
  IconAward,
  IconAwardOff,
  IconClockHour4,
} from '@tabler/icons-react';
import '../styles/Estilos.css';
import {
  formatearFecha,
  etiquetaTipo,
  metadatosTipo,
} from '../handlers/historialHandlers';

// ── Mapa tipo → icono ────────────────────────────────────────
const ICONOS = {
  AFILIACION:    <IconUserPlus   size={14} />,
  MODIFICACION:  <IconEdit       size={14} />,
  DESAFILIACION: <IconUserOff    size={14} />,
  REAFILIACION:  <IconUserCheck  size={14} />,
  INGRESO:       <IconAward      size={14} />,
  EGRESO:        <IconAwardOff   size={14} />,
};

// ── Clase CSS del badge según tipo/origen ────────────────────
const claseBadge = (tipo, origen) => {
  if (origen === 'directorio') {
    return tipo === 'INGRESO'
      ? 'historial-badge tipo-directorio-ingreso'
      : 'historial-badge tipo-directorio-egreso';
  }
  if (tipo === 'MODIFICACION')  return 'historial-badge tipo-modificacion';
  if (tipo === 'DESAFILIACION') return 'historial-badge tipo-desafiliacion';
  return 'historial-badge';
};

// ── Sub-componente: encabezado con título y línea ────────────
const HeaderHistorial = ({ nombreAfiliado }) => (
  <div className="historial-header-row">
    <h2 className="historial-titulo">HISTORIAL DEL AFILIADO</h2>
    <hr className="historial-title-underline" aria-hidden="true" />
    {/* <Box className="historial-title-underline" />   despues lo cambio jaja*/}
  </div>
);

// ── Sub-componente: una fila de la tabla ─────────────────────
const FilaHistorial = ({ registro }) => {
  const { color } = metadatosTipo(registro.tipo, registro.origen);

  return (
    <tr>
      {/* Tipo — píldora con icono */}
      <td>
        <span className={claseBadge(registro.tipo, registro.origen)} style={{ color }}>
          {ICONOS[registro.tipo] || null}
          {etiquetaTipo(registro.tipo)}
        </span>
      </td>

      {/* Descripción */}
      <td>
        <Text size="sm" fw={500} style={{ color: '#0F0F0F' }}>
          {registro.descripcion || '—'}
        </Text>
      </td>

      {/* Fecha y hora */}
      <td>
        <Text size="sm" style={{ color: '#0F0F0F' }}>
          {formatearFecha(registro.fecha)}
        </Text>
        {registro.hora && (
          <div className="historial-detalle">{registro.hora.slice(0, 5)}</div>
        )}
      </td>

      {/* Responsable */}
      <td>
        <span className="historial-responsable">{registro.responsable}</span>
      </td>
    </tr>
  );
};

// ── Componente principal ─────────────────────────────────────
const ModalHistorialAfiliado = ({
  opened,
  onClose,
  historial   = [],
  cargando    = false,
  error       = null,
  nombreAfiliado = '',
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="80%"
      centered
      withCloseButton
      closeOnClickOutside
      overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
      styles={{
        header: {
          paddingBottom: 0,
          borderBottom: 'none',
        },
        body: {
          paddingTop: '8px',
        },
        close: {
          color:           '#0F0F0F',
          backgroundColor: 'transparent',
          '&:hover': { backgroundColor: '#F6F9FF' },
        },
      }}
      title={<HeaderHistorial nombreAfiliado={nombreAfiliado} />}
    >
      {/* ── Estado: cargando ── */}
      {cargando && (
        <Center py="xl">
          <Loader size="sm" color="dark" />
          <Text size="sm" ml="sm" style={{ color: '#374567' }}>Cargando historial...</Text>
        </Center>
      )}

      {/* ── Estado: error ── */}
      {!cargando && error && (
        <div className="historial-vacio">
          <IconClockHour4 size={36} />
          <Text>No se pudo cargar el historial</Text>
          <Text size="xs" style={{ color: '#C4C4C4' }}>{error}</Text>
        </div>
      )}

      {/* ── Estado: sin registros ── */}
      {!cargando && !error && historial.length === 0 && (
        <div className="historial-vacio">
          <IconClockHour4 size={36} />
          <Text>Sin historial registrado</Text>
        </div>
      )}

      {/* ── Tabla de historial ── */}
      {!cargando && !error && historial.length > 0 && (
        <ScrollArea style={{ maxHeight: '65vh' }} offsetScrollbars>
          <div className="historial-tabla">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '200px' }}>Evento</th>
                  <th>Descripción</th>
                  <th style={{ width: '120px' }}>Fecha</th>
                  <th style={{ width: '220px' }}>Realizado por</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((registro, idx) => (
                  <FilaHistorial key={`${registro.origen}-${registro.id}-${idx}`} registro={registro} />
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      )}
    </Modal>
  );
};

export default ModalHistorialAfiliado;