import { useAuth } from '../../../context/AuthContext';

export function ListaAfiliados({ afiliados, loading, error, onVerDetalle, onDesafiliar }) {
    const { user } = useAuth();
    
    const afiliadosActivos = afiliados.filter(afiliado => afiliado.estado === true);
    const esAdministrador = user?.rol === 'superadmin' || user?.rol === 'administrador';
    
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Cargando afiliados...</p>
            </div>
        );
    }
  
    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="refresh-btn"
          >
            Reintentar
          </button>
        </div>
      );
    }
  
    if (afiliadosActivos.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No hay afiliados activos registrados</p>
        </div>
      );
    }
  
    return (
      <div className="table-container">
        <table className="afiliados-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>C.I.</th>
              <th>Teléfono</th>
              <th>Puestos</th>
              <th>Patentes</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {afiliadosActivos.map(afiliado => (
              <tr key={afiliado.id_afiliado}>
                <td>{afiliado.id_afiliado}</td>
                <td>{`${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno}`}</td>
                <td>{`${afiliado.ci} ${afiliado.extension}`}</td>
                <td>{afiliado.telefono}</td>
                <td>
                  {afiliado.puestos_activos && afiliado.puestos_activos.length > 0 ? (
                    <div className="puestos-lista">
                      {afiliado.puestos_activos.map((puesto, index) => (
                        <div key={index} className="puesto-info">
                          <span className="puesto-codigo">
                            {`${puesto.fila}-${puesto.cuadra}-${puesto.nroPuesto}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span >Sin puestos asignados</span>
                  )}
                </td>
                <td>
                  {afiliado.puestos_activos && afiliado.puestos_activos.length > 0 ? (
                    <div className="patentes-lista">
                      {afiliado.puestos_activos.map((puesto, index) => (
                        <div key={index} className="patente-item">
                          {puesto.patente ? (
                            <span className={`patente-badge ${puesto.estado_patente === 'Activa' ? 'activa' : 'vencida'}`}>
                              {puesto.patente}
                            </span>
                          ) : (
                            <span className="sin-patente">Sin patente</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="sin-patente">-</span>
                  )}
                </td>
                <td>
                  <span className={`estado-badge ${afiliado.estado ? 'activo' : 'inactivo'}`}>
                    {afiliado.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="detalle-btn"
                      onClick={() => onVerDetalle(afiliado.id_afiliado)}
                    >
                      Ver Detalles
                    </button>
                    
                    {esAdministrador && (
                      <button 
                        className="desafiliar-btn"
                        onClick={() => onDesafiliar(afiliado.id_afiliado)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Desafiliar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}