export function CardAfiliado({ afiliado }) {
    if (!afiliado) return null;

    const getIniciales = () => {
        const inicialNombre = afiliado.nombre ? afiliado.nombre.charAt(0).toUpperCase() : '';
        const inicialPaterno = afiliado.paterno ? afiliado.paterno.charAt(0).toUpperCase() : '';
        return `${inicialNombre}${inicialPaterno}`;
    };

    const contarPatentes = () => {
        if (!afiliado.puestos_activos || afiliado.puestos_activos.length === 0) return 0;
        return afiliado.puestos_activos.filter(puesto => puesto.patente !== null).length;
    };

    return (
        <div className="card-afiliado-horizontal">
            <div className="card-left">
                <div className="profile-image-container">
                    {afiliado.url_perfil && afiliado.url_perfil !== '/img/user.jpg' ? (
                        <img 
                            src={afiliado.url_perfil} 
                            alt={`${afiliado.nombre} ${afiliado.paterno}`}
                            className="profile-image-large"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.querySelector('.profile-iniciales-large').style.display = 'flex';
                            }}
                        />
                    ) : null}
                    
                    <div className="profile-iniciales-large">
                        {getIniciales()}
                    </div>
                </div>
            </div>
            
            <div className="card-right">
                <div className="card-info-vertical">
                    <h3>{`${afiliado.nombre} ${afiliado.paterno}`}</h3>
                    <div className="info-line-vertical">
                        <strong>C.I.:</strong> {`${afiliado.ci} ${afiliado.extension}`}
                    </div>
                    <div className="info-line-vertical">
                        <strong>Tel:</strong> {afiliado.telefono}
                    </div>
                    <div className="info-line-vertical">
                        <strong>Puestos:</strong> {afiliado.puestos_activos?.length || 0}
                    </div>
                    <div className="info-line-vertical">
                        <strong>Patentes:</strong> {contarPatentes()}
                    </div>
                    
                    <div className="card-status">
                        <span className="afiliado-desde">
                            Desde: {new Date(afiliado.fecha_afiliacion).toLocaleDateString('es-ES')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}