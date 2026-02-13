//controller/tenenciasController.js
const db = require('../config/db');

// ======================================
// TRASPASO DE PUESTO
// ======================================
const traspasarPuesto = (req, res) => {

  const { id_puesto, nuevo_afiliado } = req.body;

  db.serialize(() => {

    // cerrar tenencia actual
    db.run(`
      UPDATE tenencia_puesto
      SET fecha_fin = CURRENT_DATE
      WHERE id_puesto = ?
      AND fecha_fin IS NULL
    `, [id_puesto]);

    // crear nueva
    db.run(`
      INSERT INTO tenencia_puesto
      (id_afiliado, id_puesto, razon)
      VALUES (?, ?, 'TRASPASO')
    `,
    [nuevo_afiliado, id_puesto],
    function(err) {

      if (err) {
        return res.status(500).json({
          message: "Error en traspaso"
        });
      }

      res.json({
        message: "Traspaso realizado",
        id_tenencia: this.lastID
      });

    });

  });

};


// ==============================
// HISTORIAL COMPLETO DE UN PUESTO
// ==============================
const historialCompleto = (req, res) => {
  const { id_puesto } = req.params;

  const sql = `
    SELECT 
      h.id_historial,
      h.id_tenencia,
      h.id_puesto,
      h.id_afiliado,
      h.fecha_ini,
      h.fecha_fin,
      h.razon,
      h.fecha_accion,
      a.nombre,
      a.paterno,
      a.materno,
      a.ci
    FROM historial_puesto h
    JOIN afiliado a ON h.id_afiliado = a.id_afiliado
    WHERE h.id_puesto = ?
    ORDER BY h.fecha_ini DESC
  `;

  db.all(sql, [id_puesto], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Error obteniendo historial" });
    }

    res.json(rows);
  });
};


// ======================================
// INFO PARA TRASPASO
// ======================================
const obtenerInfoTraspaso = (req, res) => {
  const { idPuesto } = req.params;

  db.get(`
    SELECT 
      p.*,
      a.id_afiliado,
      a.nombre,
      a.paterno,
      a.ci,
      a.extension,
      a.telefono
    FROM puesto p
    LEFT JOIN tenencia_puesto t ON p.id_puesto = t.id_puesto AND t.fecha_fin IS NULL
    LEFT JOIN afiliado a ON t.id_afiliado = a.id_afiliado
    WHERE p.id_puesto = ?
  `, [idPuesto], (err, row) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: "Error obteniendo información" 
      });
    }
    
    if (!row) {
      return res.status(404).json({ 
        success: false,
        message: "Puesto no encontrado" 
      });
    }
    
    res.json({
      success: true,
      data: row
    });
  });
};
module.exports = {
  traspasarPuesto,
  historialCompleto,
  obtenerInfoTraspaso
};
