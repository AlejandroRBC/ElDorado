import { useState } from "react";
import { filtrarAfiliadosParaTraspaso } from "../servicios/PuestosService";

const FormularioTraspaso = ({ isOpen, onClose, puesto, afiliados, onConfirmar }) => {
    const [tipo, setTipo] = useState("Traspaso");
    const [busqueda, setBusqueda] = useState(""); 
    const [idNuevoAfiliado, setIdNuevoAfiliado] = useState(null); 
    const [razon, setRazon] = useState("");
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    if (!isOpen || !puesto) return null;

    const necesitaAfiliado = tipo === "Traspaso" || tipo === "Herencia";

    // Filtrado inteligente: Nombre, Apellido o CI
    const sugerencias = filtrarAfiliadosParaTraspaso(afiliados, busqueda);

    const seleccionarAfiliado = (af) => {
        // Al seleccionar, mostramos Nombre + CI en el input
        setBusqueda(`${af.nombre} ${af.paterno} (CI: ${af.ci})`);
        setIdNuevoAfiliado(af.id_afiliado);
        setMostrarSugerencias(false);
    };

    const handleInputChange = (e) => {
        const valor = e.target.value;
        setBusqueda(valor);
        setMostrarSugerencias(true);
        // Si el usuario borra o cambia el texto, invalidamos la selección previa
        if (idNuevoAfiliado) setIdNuevoAfiliado(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (necesitaAfiliado && !idNuevoAfiliado) {
            alert("Por favor, selecciona un afiliado válido de la lista de sugerencias.");
            return;
        }
        onConfirmar(puesto.id_puesto, necesitaAfiliado ? idNuevoAfiliado : null, razon, tipo);
        
        // Limpiar para el próximo uso
        setBusqueda("");
        setIdNuevoAfiliado(null);
        setRazon("");
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content traspaso-modal">
                <div className="modal-header">
                    <h2>Movimiento de Puesto: {puesto.id_puesto}</h2>
                    <p className="subtitle">Ubicación: Fila {puesto.fila} - Cuadra {puesto.cuadra}</p>
                </div>
                
                <form onSubmit={handleSubmit} autoComplete="off">
                    <label>Tipo de Movimiento:</label>
                    <select value={tipo} onChange={(e) => {
                        setTipo(e.target.value);
                        setBusqueda("");
                        setIdNuevoAfiliado(null);
                    }}>
                        <option value="Traspaso">Venta / Traspaso</option>
                        <option value="Herencia">Sucesión / Herencia</option>
                        <option value="Despojo">Despojo (Quitar puesto)</option>
                        <option value="Abandono">Declaración de Abandono</option>
                    </select>

                    {necesitaAfiliado && (
                        <div className="search-container">
                            <label>Buscar Nuevo Dueño (Nombre o CI):</label>
                            <input 
                                type="text"
                                className={`search-input ${idNuevoAfiliado ? 'input-selected' : ''}`}
                                placeholder="Ej: 4567890 o Juan Perez..."
                                value={busqueda}
                                onChange={handleInputChange}
                                onFocus={() => setMostrarSugerencias(true)}
                                required
                            />
                            
                            {mostrarSugerencias && busqueda.length > 0 && !idNuevoAfiliado && (
                                <ul className="sugerencias-list">
                                    {sugerencias.length > 0 ? (
                                        sugerencias.map(af => (
                                            <li key={af.id_afiliado} onClick={() => seleccionarAfiliado(af)}>
                                                <div className="info-main">{af.nombre} {af.paterno}</div>
                                                <div className="info-secondary">CI: <strong>{af.ci}</strong></div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="no-results">No se encontró: "{busqueda}"</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}

                    <label>Razón / Observaciones:</label>
                    <textarea 
                        required 
                        value={razon} 
                        onChange={(e) => setRazon(e.target.value)} 
                        placeholder="Describa el motivo del cambio..."
                    />

                    <div className="modal-actions">
                        <button type="button" className="btn-secundario" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-confirmar">Ejecutar Movimiento</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioTraspaso;