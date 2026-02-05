import { useState,useMemo } from "react";
import FormularioPuestoPatente from './components/FormularioPuestoPatente';
import FiltroPuesto from "./components/FiltroPuesto"; 
import { mockPuestos, mockPatentes } from "./datosMoock";
import { filtrarPuestos, obtenerPatenteDePuesto } from "./servicios/PuestosService";
import "./estilos/GestionEstilos.css";
import "./estilos/FiltroBusqueda.css";

const GestionPatentesPuestos = () => {
    const [puestos, setPuestos] = useState(mockPuestos);
    const [patentes, setPatentes] = useState(mockPatentes);
    const [isModalOpen, setModalOpen] = useState(false);
    const [criterios, setCriterios] = useState({ texto: "", patente: "todos" });

    const puestosFiltrados = useMemo(() => 
        filtrarPuestos(puestos, patentes, criterios), 
        [puestos, patentes, criterios]
    );

    const handleGuardar = (nuevoPuesto, nuevaPatente) => {
        setPuestos(prev => [...prev, nuevoPuesto]);
        if (nuevaPatente) setPatentes(prev => [...prev, nuevaPatente]);
        setModalOpen(false);
    };

    return (
        <div className="gestion-module">
            <div className="module-header">
                <h1>Gestión De Puestos y Patentes</h1>
                <button className="btn-new" onClick={() => setModalOpen(true)}>
                    + Registrar Nuevo Puesto
                </button>
            </div>

            
            <FiltroPuesto onFiltrar={(c) => setCriterios(c)} />

            <div className="tabla-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID Puesto</th>
                            <th>ID Patente</th>  
                            <th>Fila - Cuadra</th>
                            <th>Nro Puesto</th>
                            <th>Medidas</th>
                            <th>Patente Alcaldía</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        {puestosFiltrados.map((puesto) => {
                            const patenteAsociada = obtenerPatenteDePuesto(patentes, puesto.id_puesto);
                            return (
                                <tr key={puesto.id_puesto}>
                                    <td>{puesto.id_puesto}</td>
                                    <td>
                                        {patenteAsociada
                                            ? <strong>{patenteAsociada.id_patente}</strong>
                                            : <span className="text-muted">Sin Patente</span>
                                        }
                                    </td>
                                    <td>{puesto.fila} - {puesto.cuadra}</td>
                                    <td>{puesto.nroPuesto}</td>
                                    <td>{puesto.ancho}m x {puesto.largo}m</td>
                                    <td>
                                        {patenteAsociada
                                            ? <strong>{patenteAsociada.codigo_alcaldia}</strong>
                                            : <span className="text-muted">Sin Patente</span>
                                        }
                                    </td>
                                    <td>
                                        <span className={patenteAsociada ? "badge-activo" : "badge-inactivo"}>
                                            {patenteAsociada ? "Patentado" : "No Patentado"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table> 
            </div>

            <FormularioPuestoPatente
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleGuardar}
            />
        </div>
    );
};

export default GestionPatentesPuestos;