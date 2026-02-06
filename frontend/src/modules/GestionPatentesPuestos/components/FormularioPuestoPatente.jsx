import { useState } from "react";
import { PrepararNuevoRegistro, EstadoInicialPuesto, EstadoIncialPatente } from "../servicios/PuestosService";
import "../estilos/GestionEstilos.css";

const FormularioPuestoPatente = ({ isOpen, onClose, onSave }) => {
    const [puestoData, setPuestoData] = useState(EstadoInicialPuesto);
    const [tienePatente, setTienePatente] = useState(false);
    const [patenteData, setPatenteData] = useState(EstadoIncialPatente);

    // Función genérica para manejar inputs del puesto (incluyendo rubros)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPuestoData({ ...puestoData, [name]: value });
    };

    const limpiarYsalir = () => {
        setPuestoData(EstadoInicialPuesto);
        setPatenteData(EstadoIncialPatente);
        setTienePatente(false);
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // El service se encarga de la lógica pesada (IDs, fechas, vinculación)
        const { nuevoPuesto, nuevaPatente } = PrepararNuevoRegistro(
            puestoData, 
            tienePatente, 
            patenteData
        );

        onSave(nuevoPuesto, nuevaPatente);
        limpiarYsalir();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrar Nuevo Puesto</h2>
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>Información de Puesto</legend>
                        <label >Nro Puesto</label>
                        <input type="text" name="nroPuesto" value={puestoData.nroPuesto} onChange={handleInputChange} required/>
                        <label>Fila:</label>
                        <input type="text" name="fila" value={puestoData.fila} onChange={handleInputChange} required />
                        
                        <label>Cuadra:</label>
                        <input type="text" name="cuadra" value={puestoData.cuadra} onChange={handleInputChange} required />
                        
                        <label>Nro Puesto:</label>
                        <input type="text" name="nroPuesto" value={puestoData.nroPuesto} onChange={handleInputChange} required />

                        <label>Medidas (Ancho x Largo):</label>
                        <div className="input-group-inline">
                            <input type="number" name="ancho" placeholder="Ancho" value={puestoData.ancho} onChange={handleInputChange} style={{ width: '70px' }} required />
                            <span> x </span>
                            <input type="number" name="largo" placeholder="Largo" value={puestoData.largo} onChange={handleInputChange} style={{ width: '70px' }} required />
                        </div>

                        <label>Rubros (Separe por comas):</label>
                        <input 
                            type="text" 
                            name="rubros" 
                            placeholder="Ej: Abarrotes, Frutas" 
                            value={puestoData.rubros || ""} 
                            onChange={handleInputChange} 
                        />
                    </fieldset>

                    <div className="form-checkbox-section">
                        <label>
                            <input type="checkbox" checked={tienePatente} onChange={(e) => setTienePatente(e.target.checked)} />
                            ¿Tiene Patente de Alcaldía?
                        </label>
                    </div>

                    {tienePatente && (
                        <fieldset>
                            <legend>Información de Patente</legend>
                            <label>Código Alcaldía:</label>
                            <input 
                                type="text" 
                                value={patenteData.codigo_alcaldia} 
                                onChange={(e) => setPatenteData({ ...patenteData, codigo_alcaldia: e.target.value })} 
                                required 
                            />
                            
                            <label>Estado Inicial:</label>
                            <select 
                                value={patenteData.estado} 
                                onChange={(e) => setPatenteData({ ...patenteData, estado: e.target.value })}
                            >
                                <option value="Vigente">Vigente / Activo</option>
                                <option value="Caduco">Caduco / Pendiente</option>
                            </select>
                        </fieldset>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={limpiarYsalir}>Cancelar</button>
                        <button type="submit" className="btn-guardar">Guardar Registro</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioPuestoPatente;