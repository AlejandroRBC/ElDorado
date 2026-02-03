export function BarraBusqueda({
    terminoBusqueda,
    setTerminoBusqueda,
    campoFiltro,
    setCampoFiltro,
    totalResultados,
    totalAfiliados,
    limpiarBusqueda
}) {
    return (
        <div className="barra-busqueda-container">
            <div className="busqueda-header">
                <h3>Buscar Afiliados</h3>
                <div className="resultados-info">
                    {totalResultados === totalAfiliados ? (
                        <span>Mostrando todos los afiliados ({totalAfiliados})</span>
                    ) : (
                        <span>
                            {totalResultados} de {totalAfiliados} resultados
                        </span>
                    )}
                </div>
            </div>
            
            <div className="busqueda-controls">
                <div className="filtro-select-container">
                    <label htmlFor="campo-filtro" className="filtro-label">
                        Buscar por:
                    </label>
                    <select
                        id="campo-filtro"
                        value={campoFiltro}
                        onChange={(e) => setCampoFiltro(e.target.value)}
                        className="filtro-select"
                    >
                        <option value="todos">Todos los campos</option>
                        <option value="ci">Cédula de Identidad</option>
                        <option value="nombre">Nombre</option>
                        <option value="apellido">Apellido</option>
                    </select>
                </div>
                
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder={
                            campoFiltro === 'ci' ? "Buscar por CI (ej: 1234567 LP)" :
                            campoFiltro === 'nombre' ? "Buscar por nombre..." :
                            campoFiltro === 'apellido' ? "Buscar por apellido..." :
                            "Buscar por CI, nombre o apellido..."
                        }
                        value={terminoBusqueda}
                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                        className="search-input"
                        autoFocus
                    />
                    
                    {terminoBusqueda && (
                        <button
                            type="button"
                            onClick={limpiarBusqueda}
                            className="clear-search-btn"
                            title="Limpiar búsqueda"
                        >
                            ✕
                        </button>
                    )}
                    
                    <div className="search-icon">
                        🔍
                    </div>
                </div>
            </div>
            
            {terminoBusqueda && totalResultados === 0 && (
                <div className="no-results-message">
                    <p>No se encontraron afiliados que coincidan con "{terminoBusqueda}"</p>
                    <button
                        onClick={limpiarBusqueda}
                        className="clear-all-btn"
                    >
                        Mostrar todos los afiliados
                    </button>
                </div>
            )}
        </div>
    );
}