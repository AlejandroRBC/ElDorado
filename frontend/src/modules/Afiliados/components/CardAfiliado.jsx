export function CardAfiliado({ afiliado }) {
    if (!afiliado) return null;

    return (
        <div className="card-afiliado">
            <div className="card-header">
                <img 
                    src={afiliado.url_perfil || '/img/user.jpg'} 
                    alt={`${afiliado.nombre} ${afiliado.paterno}`}
                    className="profile-image"
                />
                <div className="card-info">
                    <h3>{`${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno}`}</h3>
                    <p><strong>C.I.:</strong> {`${afiliado.ci} ${afiliado.extension}`}</p>
                    <p><strong>Teléfono:</strong> {afiliado.telefono}</p>
                </div>
            </div>
            <div className="card-footer">
                <span className={`estado-badge ${afiliado.estado ? 'activo' : 'inactivo'}`}>
                    {afiliado.estado ? 'Activo' : 'Inactivo'}
                </span>
                <span className="puesto-info">{afiliado.puesto}</span>
            </div>
        </div>
    );
}