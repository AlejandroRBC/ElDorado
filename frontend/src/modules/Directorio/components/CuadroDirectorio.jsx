import { memo }       from 'react';
import { ScrollArea, ActionIcon, Loader, Center, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconUserPlus } from '@tabler/icons-react';
import '../styles/directorio.css';

// ============================================================
// CUADRO DIRECTORIO
// Muestra las 12 secretarías con su titular (o "Vacante").
// Presenta siempre las 12 filas aunque no haya datos.
// ============================================================

const CuadroDirectorio = memo(({
  filas           = [],
  cargando        = false,
  error           = null,
  gestionLabel    = '',
  onEditarGestion,          // abre el modal en modo 'editar'
}) => {

  if (cargando) {
    return (
      <div className="dir-cuadro">
        <div className="dir-cuadro-header">
          <span className="dir-cuadro-titulo">DIRECTORIO</span>
          {gestionLabel && (
            <span className="dir-cuadro-gestion">Gestión {gestionLabel}</span>
          )}
        </div>
        <Center py="xl">
          <Loader size="sm" color="dark" />
          <Text ml="sm" size="sm" style={{ color: '#C4C4C4', fontFamily: 'Poppins, sans-serif' }}>
            Cargando directorio...
          </Text>
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
          <Text style={{ color: '#C4C4C4' }}>No se pudo cargar el directorio</Text>
          <Text size="xs" style={{ color: '#C4C4C4' }}>{error}</Text>
        </div>
      </div>
    );
  }

  // Determinar si hay al menos un cargo sin afiliado (para saber si mostrar "Añadir")
  const hayVacantes = filas.some((f) => !f.id_afiliado);
  const hayAsignados = filas.some((f) => !!f.id_afiliado);

  return (
    <div className="dir-cuadro">
      {/* ── Cabecera del cuadro ── */}
      <div className="dir-cuadro-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span className="dir-cuadro-titulo">DIRECTORIO</span>
          {gestionLabel && (
            <span className="dir-cuadro-gestion">Gestión {gestionLabel}</span>
          )}
        </div>

        {/* Botón Editar / Añadir */}
        {onEditarGestion && (
          <Tooltip
            label={hayAsignados ? 'Editar o completar este directorio' : 'Asignar titulares al directorio'}
            position="left"
          >
            <ActionIcon
              onClick={onEditarGestion}
              aria-label="Editar gestión"
              style={{
                backgroundColor: '#EDBE3C',
                color: '#0F0F0F',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
              }}
            >
              {hayAsignados ? <IconEdit size={17} /> : <IconUserPlus size={17} />}
            </ActionIcon>
          </Tooltip>
        )}
      </div>

      {/* ── Tabla ── */}
      <ScrollArea offsetScrollbars>
        <div className="dir-tabla">
          <table>
            <thead>
              <tr>
                <th style={{ width: '48px' }}>#</th>
                <th style={{ width: '280px' }}>Cargo</th>
                <th>Titular</th>
                <th style={{ width: '140px' }}>C.I.</th>
                <th style={{ width: '120px' }}>Desde</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.id_secretaria || fila.nom_secretaria}>
                  {/* Orden */}
                  <td>
                    <span className="dir-cargo-orden">{fila.orden}</span>
                  </td>

                  {/* Cargo */}
                  <td>
                    <span className="dir-cargo-nombre">{fila.nom_secretaria}</span>
                  </td>

                  {/* Titular */}
                  <td>
                    {fila.nom_afiliado ? (
                      <span className="dir-afiliado-nombre">{fila.nom_afiliado}</span>
                    ) : (
                      <span className="dir-vacante">Vacante</span>
                    )}
                  </td>

                  {/* CI */}
                  <td>
                    {fila.ci ? (
                      <span className="dir-afiliado-ci">
                        {fila.ci} {fila.extension || ''}
                      </span>
                    ) : (
                      <span className="dir-vacante">—</span>
                    )}
                  </td>

                  {/* Fecha inicio */}
                  <td>
                    {fila.fecha_inicio ? (
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#C4C4C4' }}>
                        {new Date(`${fila.fecha_inicio}T00:00:00`).toLocaleDateString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span className="dir-vacante">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
});

CuadroDirectorio.displayName = 'CuadroDirectorio';

export default CuadroDirectorio;