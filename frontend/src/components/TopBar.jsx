import '../styles/topbar.css';

export default function TopBar({ 
    usuario, 
    onLogout, 
    onToggleSidebar,
    sidebarColapsada 
}) {
    return (
        <header className="topbar">
            <div className="topbar-left">
                <button 
                    className="menu-toggle-btn"
                    onClick={onToggleSidebar}
                    title={sidebarColapsada ? "Expandir menú" : "Colapsar menú"}
                >
                    ☰
                </button>
                
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar en el sistema..."
                        className="search-input"
                        disabled
                        title="Funcionalidad de búsqueda global en desarrollo"
                    />
                    <span className="search-icon">🔍</span>
                </div>
            </div>
            
            <div className="topbar-right">
                <div className="user-info">
                    <div className="user-avatar">
                        {usuario?.nombre?.charAt(0) || 'U'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
                        <span className="user-role">{usuario?.rol || 'Administrador'}</span>
                    </div>
                </div>
                
                <button 
                    className="logout-btn"
                    onClick={onLogout}
                    title="Cerrar sesión"
                >
                    <span className="logout-icon">🚪</span>
                    <span className="logout-text">Salir</span>
                </button>
            </div>
        </header>
    );
}