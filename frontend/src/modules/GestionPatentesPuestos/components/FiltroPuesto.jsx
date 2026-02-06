import { useState } from "react";
import '../estilos/FiltroBusqueda.css';

const FiltroPuesto = ({ onFiltrar }) => {
    const [criterios, setCriterios] = useState({
        texto: "",
        patente: "todos",
        cuadra: "todos",
        fila: "todos",
        rubro: "todos"
    });

    const manejaCambio = (e) => {
        const { name, value } = e.target;
        const nuevosCriterios = {
            ...criterios,
            [name]: value
        };
        setCriterios(nuevosCriterios);
        onFiltrar(nuevosCriterios);
    };

    return (
        <div className="search-card">
            <div className="search-input-group">
                <input 
                    type="text"
                    name="texto"
                    placeholder="Buscar por Nombre, CI, Rubro o ID..." 
                    value={criterios.texto}
                    onChange={manejaCambio}
                    className="search-input"
                />

                <select name="patente" value={criterios.patente} onChange={manejaCambio} className="filter-select">
                    <option value="todos">Todos los estados</option>
                    <option value="Con Patente">Con Patente</option>
                    <option value="Sin Patente">Sin Patente</option>
                </select>

                {/* Sincronizado con Mock: Cuadra es "1" */}
                <select name="cuadra" value={criterios.cuadra} onChange={manejaCambio} className="filter-select">
                    <option value="todos">Todas las Cuadras</option>
                    <option value="1">Cuadra 1</option>
                    <option value="2">Cuadra 2</option>
                </select>

                {/* Sincronizado con Mock: Fila es "A", "B" */}
                <select name="fila" value={criterios.fila} onChange={manejaCambio} className="filter-select">
                    <option value="todos">Todas las Filas</option>
                    <option value="A">Fila A</option>
                    <option value="B">Fila B</option>
                </select>

                <select name="rubro" value={criterios.rubro} onChange={manejaCambio} className="filter-select">
                    <option value="todos">Todos los Patentes</option>
                    <option value="Juguetes">Nro Patentes 1</option>
                    <option value="Comida">Nro Patentes 2</option>
                    <option value="Abarrote">Nro Patentes 3</option>
                </select>
            </div>
        </div>
    );
};

export default FiltroPuesto;