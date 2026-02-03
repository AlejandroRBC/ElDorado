import '../styles/sidebar.css';

export default function Sidebar({ 
    moduloActivo, 
    setModuloActivo, 
    colapsada, 
    setColapsada 
}) {
    const menuItems = [
        { id: 'home',icon : '🧊', label: 'home' },
        { id: 'afiliados',icon : '🧊', label: 'Afiliados' },
        { id: 'puestos', icon : '🧊',label: 'Puestos' },
        { id: 'patentes', icon : '🧊',label: 'Patentes' },
        { id: 'actividades', icon : '🧊',label: 'Actividades' },
        { id: 'deudas', icon : '🧊',label: 'Deudas' },
        { id: 'reportes', icon : '🧊',label: 'Reportes' },
        { id: 'configuracion', icon : '🧊',label: 'Configuración' },
    ];

    const handleItemClick = (moduloId) => {
        setModuloActivo(moduloId);
        if (window.innerWidth < 768) {
            setColapsada(true);
        }
    };

    return (
        <aside className={`sidebar ${colapsada ? 'colapsada' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">
                        {/* aqui va uan img del logo XD  */}
                    </div>
                    {!colapsada && (
                        <div className="logo-text">
                            <h2>El Dorado</h2>
                        </div>
                    )}
                </div>
                
                <button 
                    className="toggle-sidebar-btn"
                    onClick={() => setColapsada(!colapsada)}
                    title={colapsada ? "Expandir sidebar" : "Colapsar sidebar"}
                >
                    {colapsada ? '→' : '←'}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-menu">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                className={`nav-item ${moduloActivo === item.id ? 'active' : ''}`}
                                onClick={() => handleItemClick(item.id)}
                                title={colapsada ? item.label : ''}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!colapsada && (
                                    <>
                                        <span className="nav-label">{item.label}</span>
                                    </>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {!colapsada && (
                <div className="sidebar-footer">
                    <div className="version-info">
                        <span>Sistema v1.0.0</span>
                        <span className="status-indicator active">En línea</span>
                    </div>
                </div>
            )}
        </aside>
    );
}