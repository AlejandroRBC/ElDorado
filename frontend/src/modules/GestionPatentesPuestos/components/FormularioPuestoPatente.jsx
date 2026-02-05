import { useState } from "react";
import { prepararNuevoRegistro } from "../servicios/PuestosService";
import "../estilos/GestionEstilos.css";

const FormularioPuestoPatente = ({isOpen, onClose, onSave}) =>{
    const[puestoData, setPuestoData] = useState({
        fila:'',
        cuadra: '',
        nroPuesto: '',
        ancho:'',
        largo:''
    });

    const [tienePatente, setTienePatente] = useState(false);
    const [patenteData, setPatenteData] = useState({
        codigo_alcaldia:'',
        estado: 'Vigente'
    });

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        
        //idpuesto temporal
        const { nuevoPuesto, nuevaPatente } = prepararNuevoRegistro(
            puestoData, 
            tienePatente, 
            patenteData
        );

        onSave(nuevoPuesto, nuevaPatente);
        limpiarFomrulario();
        onClose();

    };
    const limpiarFormulario = () => {
        setPuestoData({ fila:'', cuadra: '', nroPuesto: '', ancho:'', largo:'' });
        setPatenteData({ codigo_alcaldia:'', estado: 'Vigente' });
        setTienePatente(false);
    };
    return(
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrar Puesto</h2>
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>Informacion de Puesto</legend>
                        <label >Fila: </label>
                        <input 
                            type="text"
                            value={puestoData.fila}
                            onChange={(e) => setPuestoData({...puestoData, fila: e.target.value})} required
                        /> <br />

                        <label>Cuadra: </label>
                        <input 
                            type="text"
                            value={puestoData.cuadra}
                            onChange={(e) => setPuestoData({...puestoData, cuadra: e.target.value})} required
                        /> <br />

                        <label>Nro Puesto</label>
                        <input 
                            type="text" 
                            value={puestoData.nroPuesto}
                            onChange={(e) => setPuestoData({...puestoData, nroPuesto: e.target.value})} required
                        /> <br />

                        <label>Medidas (Ancho x largo)</label>
                        <input 
                            type="number"
                            placeholder="Ancho"
                            value={puestoData.ancho}
                            onChange={(e) => setPuestoData({...puestoData, ancho: e.target.value})} style={{width: '60px'}}
                        />
                        x
                        <input 
                            type="number" 
                            placeholder="largo"
                            value={puestoData.largo}
                            onChange={(e) => setPuestoData({...puestoData, largo: e.target.value})} style={{width: '60px'}}
                        />
                    </fieldset>
                    <br />

                    {/*parte del chexbox*/}
                    <div className="form-puestoPatente">
                        <label>
                            <input 
                                type="checkbox"
                                checked={tienePatente}  
                                onChange={(e) => setTienePatente(e.target.checked)}
                            />
                            Tiene Patente?
                        </label>
                    </div>

                    {/*campos de la patente*/ }
                    {tienePatente &&(
                        <fieldset>
                            <legend>Informacion de Patetne</legend>
                            <label >Codigo ALcaldia:</label>
                            <input 
                                type="text" 
                                value={patenteData.codigo_alcaldia}
                                onChange={(e) => setPatenteData({...patenteData, codigo_alcaldia: e.target.value})} required
                            /> <br />

                            <label>Estado: </label>
                            <select 
                                value={patenteData.estado}
                                onChange={(e) => setPatenteData({...patenteData, estado: e.target.value})}
                            >
                                <option value="Vigente">Si</option>
                                <option value="Caduco">No</option>
                            </select>
                        </fieldset>
                    )}
                    <br />
                    <button type="submit">Guardar Datos</button>
                    <button type="button" onClick={onClose}>Cancelar</button>
                </form>
            </div>
        </div>
    );
};

export default FormularioPuestoPatente;