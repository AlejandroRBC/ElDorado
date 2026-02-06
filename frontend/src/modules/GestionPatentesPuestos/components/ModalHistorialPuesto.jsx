import { useState } from "react";
import { obtenerHistorialPuesto} from "../servicios/PuestosService";

const ModalHistorialPuesto = ({isOpen, onClose, idPuesto, tenencias, afiliados}) => {
    if(!isOpen || !tenencias || !afiliados ) return null;

    const historial = obtenerHistorialPuesto(idPuesto, tenencias, afiliados);

    return(
        <div className="modal-overlay">
            <div className="modal-content historial-modal">
                <h2>Historial de Movimientos - Puesto {idPuesto}</h2>
                <table className="tabla-historial">
                    <thead>
                        <tr>
                            <th>Afiliado</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Razon/Estados</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.map(h =>(
                            <tr key={h.id_tenencia} className={h.switch ? "Fila-actual": "Fila-pasada"}>
                                <td>{h.nombreAfiliado}</td>
                                <td>{h.fecha_ini}</td>    
                                <td>{h.fecha_fin || "A la fecha"}</td>
                                <td>
                                    {h.switch ?
                                        <span className="badge-activo">Actual</span> :
                                        <span className="badge-pasado">Traspasado</span>
                                    }
                                </td>
                            </tr>
                            
                        ))}
                    </tbody>
                </table>
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default ModalHistorialPuesto;
