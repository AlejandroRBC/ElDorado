import { useAuth } from '../../../context/AuthContext';
import { CardAfiliado } from './CardAfiliado';

export function ListaCardsAfiliados({ afiliados, loading, error, onVerDetalle, onDesafiliar }) {
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
        <div className="cards-container-horizontal">
            <div className="cards-grid-horizontal">
                {afiliadosActivos.map(afiliado => (
                    <div key={afiliado.id_afiliado} className="card-wrapper-horizontal">
                        <div 
                            className="card-content" 
                            onClick={() => onVerDetalle(afiliado.id_afiliado)}
                            style={{ cursor: 'pointer' }}
                        >
                            <CardAfiliado afiliado={afiliado} />
                        </div>
                        
                       
                        <div className="card-actions-horizontal">
                            <button 
                                className="detalle-btn"
                                onClick={() => onVerDetalle(afiliado.id_afiliado)}
                                style={{ flex: 1 }}
                            >
                                Ver Detalles
                            </button>
                            
                            {esAdministrador && (
                                <button 
                                    className="desafiliar-btn"
                                    onClick={() => onDesafiliar(afiliado.id_afiliado)}
                                    style={{
                                        flex: 1,
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
                    </div>
                ))}
            </div>
        </div>
    );
}