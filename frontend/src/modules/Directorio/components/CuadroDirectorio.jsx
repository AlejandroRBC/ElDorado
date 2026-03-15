// modules/Directorio/components/CuadroDirectorio.jsx

// ============================================================
// COMPONENTE CUADRO DIRECTORIO
// ============================================================

import { memo }                                      from 'react';
import { ActionIcon, Loader, Center, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconUserPlus }                     from '@tabler/icons-react';
import '../styles/directorio.css';

/**
 * Muestra las 12 secretarías del directorio con su titular o "Vacante".
 * Tabla estilo TablaAfiliados: striped, highlightOnHover, headers centrados.
 *
 * filas          - Array de 12 filas (secretaría + cargo asignado)
 * cargando       - Muestra loader mientras carga
 * error          - Mensaje de error si falló la carga
 * gestionLabel   - Label legible de la gestión activa
 * onEditarGestion - Callback para abrir el modal en modo editar
 */
const CuadroDirectorio = memo(({
  filas           = [],
  cargando        = false,
  error           = null,
  gestionLabel    = '',
  onEditarGestion,
}) => {

  if (cargando) {
    return (
      <div className="dir-cuadro">
        <div className="dir-cuadro-header">
          <div className="dir-cuadro-header-left">
            <span className="dir-cuadro-titulo">DIRECTORIO</span>
            {gestionLabel && <span className="dir-cuadro-gestion">Gestión {gestionLabel}</span>}
          </div>
        </div>
        <Center py="xl">
          <Loader size="sm" color="dark" />
          <Text ml="sm" size="sm" className="dir-texto-dimmed">Cargando directorio...</Text>
        </Center>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dir-cuadro">
        <div className="dir-cuadro-header">
          <span className="dir-cuadro-titulo">DIRECTORIO</span>
        </div>
        <div className="dir-vacio">
          <Text className="dir-texto-dimmed">No se pudo cargar el directorio</Text>
          <Text size="xs" className="dir-texto-dimmed">{error}</Text>
        </div>
      </div>
    );
  }

  const hayAsignados = filas.some((f) => !!f.id_afiliado);

  return (
    <div className="dir-cuadro">

      {/* ── Cabecera ── */}
      <div className="dir-cuadro-header">
        <div className="dir-cuadro-header-left">
          <span className="dir-cuadro-titulo">DIRECTORIO</span>
          {gestionLabel && <span className="dir-cuadro-gestion">Gestión {gestionLabel}</span>}
        </div>

        {onEditarGestion && (
          <Tooltip
            label={hayAsignados ? 'Editar o completar este directorio' : 'Asignar titulares al directorio'}
            position="left"
          >
            <ActionIcon onClick={onEditarGestion} className="dir-cuadro-btn-editar">
              {hayAsignados ? <IconEdit size={17} /> : <IconUserPlus size={17} />}
            </ActionIcon>
          </Tooltip>
        )}
      </div>

      {/* ── Tabla estilo TablaAfiliados ── */}
      <div className="dir-tabla">
        <table>
          <thead>
            <tr>
              <th style={{ width: '48px' }}>#</th>
              <th style={{ width: '280px', textAlign: 'left' }}>Cargo</th>
              <th>Titular</th>
              <th style={{ width: '140px' }}>C.I.</th>
              <th style={{ width: '120px' }}>Desde</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
             <tr
                  key={fila.id_secretaria || fila.nom_secretaria}
                  style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eee'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#fafafa'}
                >
                <td>
                  <span className="dir-cargo-orden">{fila.orden}</span>
                </td>
                <td style={{ textAlign: 'left' }}>
                  <span className="dir-cargo-nombre">{fila.nom_secretaria}</span>
                </td>
                <td>
                  {fila.nom_afiliado
                    ? <span className="dir-afiliado-nombre">{fila.nom_afiliado}</span>
                    : <span className="dir-vacante">Vacante</span>
                  }
                </td>
                <td>
                  {fila.ci
                    ? <span className="dir-afiliado-ci">{fila.ci} {fila.extension || ''}</span>
                    : <span className="dir-vacante">—</span>
                  }
                </td>
                <td>
                  {fila.fecha_inicio
                    ? <span className="dir-fecha">
                        {new Date(`${fila.fecha_inicio}T00:00:00`).toLocaleDateString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                        })}
                      </span>
                    : <span className="dir-vacante">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

CuadroDirectorio.displayName = 'CuadroDirectorio';
export default CuadroDirectorio;