import { useState } from "react";
import '../estilos/FiltroBusqueda.css';
const FiltroPuesto = ({onFiltrar}) => {
    const [busqueda, setBusqueda] = useState("");
    const [filtroPatente, setFiltroPatente] = useState("Todos");

    const manejaCambio = (e) => {
        const {name, value} = e.target;
        
        let textoActualizado = busqueda;
        let patenteActualizada = filtroPatente;

        if(name === "busqueda"){
            setBusqueda(value);
            textoActualizado= value;
        }else if(name === "filtroPatente"){

            setFiltroPatente(value);
            patenteActualizada=value;
        }
        onFiltrar({
            texto: textoActualizado,
            patente: patenteActualizada,
        });
    };
    return(
        <div className="search-card">
            <div className="search-input-group">
                <select 
                    name="filtroPatente"
                    value={filtroPatente}
                    onChange={manejaCambio}
                    className="filter-select">
                        <option value="todos">Todos los puestos</option>
                        <option value="Con Patente">Con Patentes</option>
                        <option value="Sin Patente">Sin Patentes</option>
                </select>
                <input 
                    type="text"
                    name="busqueda"
                    placeholder="Buscar por codigo de alcaldia..." 
                    value={busqueda}
                    onChange={manejaCambio}
                    className="search-input"
                />
                
            </div>
        </div>
    );
};

export default FiltroPuesto;