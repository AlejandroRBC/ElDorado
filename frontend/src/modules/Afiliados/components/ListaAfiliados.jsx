
export function ListaAfiliados({ afiliados, loading, error, onVerDetalle }) {
    if (loading) {return (<p>Cargando ...</p>);}
  
    if (error) {
      return (
        <div >
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      );
    }
  
    if (afiliados.length === 0) {
      return (
        <div>
          <p>No hay afiliados registrados</p>
        </div>
      );
    }
  
    return (
      <div >
        <table >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>C.I.</th>
              <th>Teléfono</th>
              <th>Puesto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className={'afiliados-table'}>
            {afiliados.map(afiliado => (
              <tr key={afiliado.id_afiliado}>
                <td>{afiliado.id_afiliado}</td>
                <td>{`${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno}`}</td>
                <td>{`${afiliado.ci} ${afiliado.extension}`}</td>
                <td>{afiliado.telefono}</td>
                <td>{afiliado.puesto}</td>
                <td>
                  <span className={`estado-badge ${afiliado.estado ? 'activo' : 'inactivo'}`}>
                    {afiliado.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button 
                    className="detalle-btn"
                    onClick={() => onVerDetalle(afiliado.id_afiliado)}
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }