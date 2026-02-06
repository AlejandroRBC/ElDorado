import { useState,useMemo } from "react";
import FormularioPuestoPatente from './components/FormularioPuestoPatente';
import FiltroPuesto from "./components/FiltroPuesto"; 
import { mockPuestos, mockPatentes, mockAfiliados, mockTenenciaPuesto } from "./datosMoock";
import { filtrarPuestos, obtenerInfo } from "./servicios/PuestosService";
import DetalleModal from "./components/DetalleModal";
import ModalHistorialPuesto from "./components/ModalHistorialPuesto";
import FormularioTraspaso from "./components/FormularioTraspaso";
import "./estilos/GestionEstilos.css";
import "./estilos/FiltroBusqueda.css";

const GestionPatentesPuestos = () => {
    const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
    const [showModalDetalles, setShowModalDetalles] = useState(false);
    const [showModalHistorial, setShowModalHistorial] = useState(false);
    const [tenencias, setTenencias] = useState(mockTenenciaPuesto);
    const [afiliados, setAfiliados] = useState(mockAfiliados);
    const [puestos, setPuestos] = useState(mockPuestos);
    const [patentes, setPatentes] = useState(mockPatentes);
    const [isModalOpen, setModalOpen] = useState(false);
    const [criterios, setCriterios] = useState({ texto: "", patente: "todos" });
    const [showModalTraspaso, setShowModalTraspaso] = useState(false);

    //funcion para procesesa el movimiento (trapaso,despojo...)
    const handleConfirmarMovimiento = (idPuesto, idNuevoAfilido, razon, tipo) => {
        const nuevatenencia  = registrarMovimiento(
            tenencias,
            idPuesto,
            idNuevoAfilido,
            idNuevoAfilido,
            razon,
            tipo
        );
        setTenencias(nuevatenencia);
        setModalTraspaso(false);
    };

    
    const handleAccion = (accion, puesto) =>{
        setPuestoSeleccionado(puesto);
        if(accion === "detalles") setShowModalDetalles(true);
        if(accion === "historial") setShowModalHistorial(true);
        if(accion === "traspaso") setShowModalTraspaso(true);
    }

    const puestosFiltrados = useMemo(() => 
        filtrarPuestos(puestos, patentes,tenencias, afiliados, criterios), 
        [puestos, patentes,tenencias, afiliados, criterios]
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
                <FiltroPuesto onFiltrar={(c) => setCriterios(c)} />
                <button className="btn-new" onClick={() => setModalOpen(true)}>
                    + Registrar Nuevo Puesto
                </button>
                <button className="btn-reporte" onClick={() => setModalOpen(false)}>
                    + Generar Reporte General
                </button>
            </div>
            <div className="tabla-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID Puesto</th>
                            <th>Fila - Cuadra</th>
                            <th>Nombre Afiliado</th>
                            <th>Carnet de Identidad</th>
                            <th>Fecha de Adquisicion</th>
                            <th>Rubro</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {puestosFiltrados.map((puesto) => {
                            const data = obtenerInfo(puesto, tenencias, afiliados, patentes);

                            return (
                                <tr key={puesto.id_puesto} className={data.nombreCompleto === "PUESTO VACANTE" ? "fila-vacante": ""}>
                                    <td>{puesto.id_puesto}</td>
                                    <td>{puesto.fila} - {puesto.cuadra}</td>
                                    <td className={data.nombreCompleto=== "PUESTO VACANTE" ? "texto-alerta" : ""}>{data.nombreCompleto}</td> 
                                    <td>{data.ci}</td>
                                    <td>{data.fechaAdquisicion}</td>
                                    <td>
                                        {/* Ahora el rubro sale del puesto directamente */}
                                        <div className="contenedor-rubros">
                                            {puesto.rubros?.split(',').map((r, i) => (
                                                <span key={i} className="badge-rubro">{r.trim()}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={data.tienePatente ? "badge-activo" : "badge-inactivo"}>
                                            {data.tienePatente ? "Patentado" : "No Patentado"}
                                        </span>
                                    </td>

                                    <td>
                                        <select 
                                            className="select-acciones" 
                                            onChange={(e) => handleAccion(e.target.value, puesto)}
                                            value="" 
                                        >
                                            <option value="" disabled>Detalles / Historial / Traspasos</option>
                                            <option value="detalles">🔍 Ver Detalles</option>
                                            <option value="historial">📜 Ver Historial</option>
                                            <option value="traspaso">🔄 Realizar Traspaso</option>
                                        </select>
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
            <DetalleModal 
                isOpen={showModalDetalles} 
                onClose={() => setShowModalDetalles(false)}
                puesto={puestoSeleccionado}
                datos={{ tenencias, afiliados, patentes }}
            />

            <ModalHistorialPuesto 
                isOpen={showModalHistorial}
                onClose={() => setShowModalHistorial(false)}
                idPuesto={puestoSeleccionado?.id_puesto}
                tenencias={tenencias}
                afiliados={afiliados}
            />
          
            <FormularioTraspaso 
                isOpen={showModalTraspaso}
                onClose={() => setShowModalTraspaso(false)}
                puesto={puestoSeleccionado}
                afiliados={afiliados}
                onConfirmar={handleConfirmarMovimiento}
            />
        </div>
    );
};

export default GestionPatentesPuestos;