// controllers/historialController.js
const db = require('../config/db');

const obtenerHistorialPuesto = (req, res) => {
  const idPuesto = parseInt(req.params.idPuesto);
  if (!idPuesto) return res.status(400).json({ error: "ID inválido" });

  const sql = `
  SELECT 
    fecha AS fecha_ini,
    NULL AS fecha_fin,
    hora AS hora_accion,
    tipo AS razon,
    afiliado,
    motivo,
    usuario
  FROM historial_puestos
  WHERE id_puesto = ?
  ORDER BY fecha DESC, id_historial_puesto DESC
  `;
  db.all(sql, [idPuesto], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

module.exports = { obtenerHistorialPuesto };
