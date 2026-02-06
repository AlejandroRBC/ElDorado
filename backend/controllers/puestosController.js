const db = require('../config/db');

const listaPuestos = (req, res) => {
    try {
        const sql = `
            SELECT  
                p.*,
                a.nombre || ' ' || (IFNULL(a.paterno, '')) AS nombre_completo,
                a.ci,
                t.fecha_ini AS fecha_adquisicion
            FROM puesto p
            LEFT JOIN tenencia_puesto t ON p.id_puesto = t.id_puesto AND t.fecha_fin IS NULL
            LEFT JOIN afiliado a ON t.id_afiliado = a.id_afiliado
        `;
        
        const puestos = db.prepare(sql).all();
        res.status(200).json(puestos);
    } catch (error) {
        console.error("Error detallado SQL:", error.message);
        res.status(500).json({ message: "Error al obtener los puestos" });
    }
};

module.exports = { listaPuestos };