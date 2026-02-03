export function CardAfiliado({ afiliado }) {
    if (!afiliado) return null;

    const getIniciales = () => {
        const inicialNombre = afiliado.nombre ? afiliado.nombre.charAt(0).toUpperCase() : '';
        const inicialPaterno = afiliado.paterno ? afiliado.paterno.charAt(0).toUpperCase() : '';
        return `${inicialNombre}${inicialPaterno}`;
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
                        <strong>Puesto:</strong> {afiliado.puesto}
                    </div>
                    <div className="info-line-vertical">
                        <strong>Rubro:</strong> {afiliado.rubro}
                    </div>
                    
                    <div className="card-status">
                        <span className={`estado-badge ${afiliado.estado ? 'activo' : 'inactivo'}`}>
                            {afiliado.estado ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}