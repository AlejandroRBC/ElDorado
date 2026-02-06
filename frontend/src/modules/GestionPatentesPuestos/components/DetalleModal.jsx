import { obtenerInfo } from "../servicios/PuestosService";

const DetalleModal = ({ isOpen, onClose, puesto, datos }) => {
    if (!isOpen || !puesto) return null;

    const { tenencias, afiliados, patentes } = datos;

    const data = obtenerInfo(puesto, tenencias, afiliados, patentes);

    return (
        <div className="modal-overlay">
            <div className="modal-content detalle-modal">
                <div className="modal-header">
                    <h2>Detalle del Puesto: {puesto.id_puesto}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <hr />
                <div className="detalle-grid">
                    <p><strong>Ubicación:</strong> Fila {puesto.fila} - Cuadra {puesto.cuadra}</p>
                    <p><strong>Nro. Puesto:</strong> {puesto.nroPuesto || "S/N"}</p>
                    <p><strong>Medidas:</strong> {puesto.ancho}m x {puesto.largo}m</p>
                    
                    <p><strong>Afiliado Actual:</strong> 
                        <span className={data.nombreCompleto === "PUESTO VACANTE" ? "texto-alerta" : ""}>
                            {data.nombreCompleto}
                        </span>
                    </p>
                    
                    <p><strong>C.I.:</strong> {data.ci}</p>
                    
                    <p><strong>Rubro:</strong> {data.rubrosPuesto}</p>
                    
                    <p><strong>Fecha Inicio Tenencia:</strong> {data.fechaAdquisicion}</p>

                    <p><strong>Fecha Fin:</strong> {data.fechaFin}</p>
                    
                    <p><strong>Estado Legal:</strong> 
                        <span className={data.tienePatente ? "badge-activo" : "badge-inactivo"}>
                            {data.tienePatente ? "Patentado" : "Sin Patente"}
                        </span>
                    </p>

                    {data.tienePatente && (
                        <p><strong>Código Alcaldía:</strong> {data.codigoPatente}</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>Aceptar</button>
                </div>
            </div>
        </div>
    );
};

export default DetalleModal;