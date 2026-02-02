export function ModalDetalleAfiliado({ afiliado, onClose }) {
    if (!afiliado) return null;
  
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-ES');
    };
  
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>Detalles del Afiliado</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="info-section">
              <h3>Información Personal</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">ID:</span>
                  <span className="value">{afiliado.id_afiliado}</span>
                </div>
                <div className="info-item">
                  <span className="label">Nombre Completo:</span>
                  <span className="value">
                    {`${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno}`}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">C.I.:</span>
                  <span className="value">{`${afiliado.ci} ${afiliado.extension}`}</span>
                </div>
                <div className="info-item">
                  <span className="label">Fecha de Nacimiento:</span>
                  <span className="value">{formatDate(afiliado.fecNac)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Sexo:</span>
                  <span className="value">{afiliado.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                </div>
              </div>
            </div>
  
            <div className="info-section">
              <h3>Información de Contacto</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Teléfono:</span>
                  <span className="value">{afiliado.telefono}</span>
                </div>
                <div className="info-item">
                  <span className="label">Dirección:</span>
                  <span className="value">{afiliado.direccion}</span>
                </div>
                <div className="info-item">
                  <span className="label">Ocupación:</span>
                  <span className="value">{afiliado.ocupacion}</span>
                </div>
              </div>
            </div>
  
            <div className="info-section">
              <h3>Información de Afiliación</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Fecha de Afiliación:</span>
                  <span className="value">{formatDate(afiliado.fecha_afiliacion)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Estado:</span>
                  <span className={`value estado ${afiliado.estado ? 'activo' : 'inactivo'}`}>
                    {afiliado.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Puesto:</span>
                  <span className="value">{afiliado.puesto}</span>
                </div>
                <div className="info-item">
                  <span className="label">Rubro:</span>
                  <span className="value">{afiliado.rubro}</span>
                </div>
              </div>
            </div>
  
            {afiliado.patentes && afiliado.patentes.length > 0 && (
              <div className="info-section">
                <h3>Patentes</h3>
                <div className="patentes-list">
                  {afiliado.patentes.map((patente, index) => (
                    <span key={index} className="patente-badge">{patente}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
  
          <div className="modal-footer">
            <button className="secondary-btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }