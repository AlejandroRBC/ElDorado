export function DetalleAfiliadoExclusivo({ afiliado, onClose }) {
    if (!afiliado) return null;

    const getIniciales = () => {
        const inicialNombre = afiliado.nombre ? afiliado.nombre.charAt(0).toUpperCase() : '';
        const inicialPaterno = afiliado.paterno ? afiliado.paterno.charAt(0).toUpperCase() : '';
        return `${inicialNombre}${inicialPaterno}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calcularEdad = (fechaNacimiento) => {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        
        return edad;
    };

    const getSexoTexto = (sexo) => {
        return sexo === 'M' ? 'Masculino' : 'Femenino';
    };

    return (
        <div className="detalle-exclusivo-overlay">
            <div className="detalle-exclusivo-container">
                {/* Header de la ventana */}
                <div className="detalle-header">
                    <div className="detalle-header-left">
                        <h1>Detalles del Afiliado</h1>
                        <div className="detalle-subtitulo">
                            <span className="afiliado-id">ID: {afiliado.id_afiliado}</span>
                            <span className={`estado-badge-detalle ${afiliado.estado ? 'activo' : 'inactivo'}`}>
                                {afiliado.estado ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                    </div>
                    <button className="close-btn-exclusivo" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Contenido principal */}
                <div className="detalle-content">
                    {/* Columna izquierda - Foto grande */}
                    <div className="detalle-left-column">
                        <div className="foto-perfil-container">
                            {afiliado.url_perfil && afiliado.url_perfil !== '/img/user.jpg' ? (
                                <img 
                                    src={afiliado.url_perfil} 
                                    alt={`${afiliado.nombre} ${afiliado.paterno}`}
                                    className="foto-perfil-grande"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.querySelector('.iniciales-grandes').style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            
                            <div className="iniciales-grandes">
                                {getIniciales()}
                            </div>
                        </div>
                        
                        <div className="info-basica">
                            <h2 className="nombre-completo">
                                {`${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno}`}
                            </h2>
                            <div className="ci-completa">
                                <span className="ci-label">Cédula de Identidad:</span>
                                <span className="ci-valor">{`${afiliado.ci} ${afiliado.extension}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha - Información detallada */}
                    <div className="detalle-right-column">
                        <div className="seccion-datos">
                            <h3>Información Personal</h3>
                            <div className="datos-grid">
                                <div className="dato-item">
                                    <span className="dato-label">Fecha de Nacimiento:</span>
                                    <span className="dato-valor">
                                        {formatDate(afiliado.fecNac)} ({calcularEdad(afiliado.fecNac)} años)
                                    </span>
                                </div>
                                
                                <div className="dato-item">
                                    <span className="dato-label">Sexo:</span>
                                    <span className="dato-valor">{getSexoTexto(afiliado.sexo)}</span>
                                </div>
                                
                                <div className="dato-item">
                                    <span className="dato-label">Edad:</span>
                                    <span className="dato-valor">{calcularEdad(afiliado.fecNac)} años</span>
                                </div>
                            </div>
                        </div>

                        <div className="seccion-datos">
                            <h3>Información de Contacto</h3>
                            <div className="datos-grid">
                                <div className="dato-item">
                                    <span className="dato-label">Teléfono:</span>
                                    <span className="dato-valor">{afiliado.telefono || 'No registrado'}</span>
                                </div>
                                
                                <div className="dato-item">
                                    <span className="dato-label">Ocupación:</span>
                                    <span className="dato-valor">{afiliado.ocupacion || 'No registrada'}</span>
                                </div>
                                
                                <div className="dato-item full-width">
                                    <span className="dato-label">Dirección:</span>
                                    <span className="dato-valor">{afiliado.direccion || 'No registrada'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="seccion-datos">
                            <h3>Información de Afiliación</h3>
                            <div className="datos-grid">
                                <div className="dato-item">
                                    <span className="dato-label">Fecha de Afiliación:</span>
                                    <span className="dato-valor">{formatDate(afiliado.fecha_afiliacion)}</span>
                                </div>
                                
                                <div className="dato-item">
                                    <span className="dato-label">Antigüedad:</span>
                                    <span className="dato-valor">
                                        {(() => {
                                            const hoy = new Date();
                                            const afiliacion = new Date(afiliado.fecha_afiliacion);
                                            const años = hoy.getFullYear() - afiliacion.getFullYear();
                                            return `${años} año${años !== 1 ? 's' : ''}`;
                                        })()}
                                    </span>
                                </div>
                                
                                <div className="dato-item">
                                    <span className="dato-label">Puesto:</span>
                                    <span className="dato-valor destacado">{afiliado.puesto}</span>
                                </div>
                                
                                <div className="dato-item">
                                    <span className="dato-label">Rubro:</span>
                                    <span className="dato-valor destacado">{afiliado.rubro}</span>
                                </div>
                            </div>
                        </div>

                        {afiliado.patentes && afiliado.patentes.length > 0 && (
                            <div className="seccion-datos">
                                <h3>Patentes Registradas</h3>
                                <div className="patentes-container">
                                    {afiliado.patentes.map((patente, index) => (
                                        <span key={index} className="patente-badge-detalle">
                                            {patente}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer con acciones */}
                <div className="detalle-footer">
                    <button 
                        className="btn-secundario" 
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                    <button 
                        className="btn-primario"
                        onClick={() => {
                            // Aquí se puede agregar funcionalidad de editar
                            alert('Funcionalidad de editar en desarrollo');
                        }}
                    >
                        ✏️ Editar Afiliado
                    </button>
                </div>

                {/* Espacio reservado para historial */}
                <div className="historial-placeholder">
                    <h3>📋 Historial de Puestos</h3>
                    <p>Esta sección mostrará el historial de puestos asignados al afiliado.</p>
                    <div className="placeholder-content">
                        <div className="placeholder-item">
                            <span>Puesto actual: {afiliado.puesto}</span>
                            <span className="placeholder-date">Desde: {formatDate(afiliado.fecha_afiliacion)}</span>
                        </div>
                        <div className="placeholder-note">
                            <em>El historial completo se cargará próximamente...</em>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}