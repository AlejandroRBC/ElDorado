export function DetalleAfiliadoExclusivo({ afiliado, onClose }) {
    if (!afiliado) return null;
    
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

    const contarPatentesActivas = () => {
        if (!afiliado.puestos_activos) return 0;
        return afiliado.puestos_activos.filter(p => p.estado_patente === 'Activa').length;
    };

    return (
        <div className="detalle-exclusivo-overlay">
            <div className="detalle-exclusivo-container">
                {/* Header */}
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
                        x
                    </button>
                </div>

                {/* Contenido principal */}
                <div className="detalle-content">
                    {/* Columna izquierda - Foto */}
                    <div className="detalle-left-column">
                        <div className="foto-perfil-container">
                        <img 
                            src={afiliado.url_perfil} 
                            alt={`${afiliado.nombre} ${afiliado.paterno}`}
                            className="foto-perfil-grande"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.querySelector('.iniciales-grandes').style.display = 'flex';
                            }}
                        />
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

                        {/* Resumen de puestos */}
                        <div className="resumen-puestos">
                            <h3>Resumen de Puestos</h3>
                            <div className="resumen-stats">
                                <div className="resumen-stat">
                                    <div className="stat-number">{afiliado.puestos_activos?.length || 0}</div>
                                    <div className="stat-label">Puestos Activos</div>
                                </div>
                                <div className="resumen-stat">
                                    <div className="stat-number">{contarPatentesActivas()}</div>
                                    <div className="stat-label">Patentes Activas</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha - Información */}
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
                                
                                <div className="dato-item full-width">
                                    <span className="dato-label">Dirección:</span>
                                    <span className="dato-valor">{afiliado.direccion || 'No registrada'}</span>
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
                                
                                <div className="dato-item">
                                    <span className="dato-label">Fecha de Afiliación:</span>
                                    <span className="dato-valor destacado">{formatDate(afiliado.fecha_afiliacion)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Puestos activos */}
                        {afiliado.puestos_activos && afiliado.puestos_activos.length > 0 && (
                            <div className="seccion-datos">
                                <h3>Puestos Activos</h3>
                                <div className="puestos-activos-grid">
                                    {afiliado.puestos_activos.map((puesto, index) => (
                                        <div key={index} className="puesto-activo-card">
                                            <div className="puesto-header">
                                                <span className="puesto-codigo">
                                                    {`Puesto ${puesto.fila}-${puesto.cuadra}-${puesto.nroPuesto}`}
                                                </span>
                                                <span className="puesto-estado activo">● Activo</span>
                                            </div>
                                            
                                            <div className="puesto-details">
                                                <div className="puesto-dimension">
                                                    <span className="dimension-label">Dimensiones:</span>
                                                    <span className="dimension-value">{puesto.ancho}m × {puesto.largo}m</span>
                                                </div>
                                                
                                                {puesto.patente ? (
                                                    <div className="puesto-patente">
                                                        <span className="patente-label">Patente:</span>
                                                        <span className={`patente-value ${puesto.estado_patente === 'Activa' ? 'activa' : 'vencida'}`}>
                                                            {puesto.patente}
                                                            <span className="patente-estado"> ({puesto.estado_patente})</span>
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="puesto-patente">
                                                        <span className="patente-label">Patente:</span>
                                                        <span className="sin-patente">Sin patente asignada</span>
                                                    </div>
                                                )}
                                                
                                                <div className="puesto-asignacion">
                                                    <span className="asignacion-label">Asignado desde:</span>
                                                    <span className="asignacion-value">{formatDate(puesto.fecha_asignacion)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sin puestos */}
                        {(!afiliado.puestos_activos || afiliado.puestos_activos.length === 0) && (
                            <div className="seccion-datos">
                                <h3>Puestos</h3>
                                <div className="sin-puestos-mensaje">
                                    <div className="sin-puestos-icon">🏪</div>
                                    <p>Este afiliado no tiene puestos activos asignados.</p>
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
                    <div className="acciones-derecha">
                        <button 
                            className="btn-secundario"
                            onClick={() => {
                                // Aquí se puede agregar funcionalidad de gestionar puestos
                                alert('Funcionalidad de gestión de puestos en desarrollo');
                            }}
                        >
                            🏪 Gestionar Puestos
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
                </div>

                {/* Espacio reservado para historial completo */}
                <div className="historial-placeholder">
                    <h3>📋 Historial Completo de Puestos</h3>
                    <p>Esta sección mostrará el historial completo de puestos asignados al afiliado, incluyendo los históricos.</p>
                    <div className="placeholder-content">
                        <div className="placeholder-item">
                            <span>Registros históricos: {afiliado.historial_puestos?.length || 0}</span>
                            <span className="placeholder-date">Cargando historial...</span>
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