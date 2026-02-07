const db = require('../config/db');


// ======================================
// ASIGNAR PUESTO (TENENCIA NUEVA)
// ======================================
const asignarPuesto = (req, res) => {

  const { id_afiliado, id_puesto, razon } = req.body;

  // Verificar si ya está ocupado
  db.get(`
    SELECT * FROM tenencia_puesto
    WHERE id_puesto = ?
    AND fecha_fin IS NULL
  `, [id_puesto], (err, row) => {

    if (err) {
      return res.status(500).json({ message: "Error consultando tenencia" });
    }

    if (row) {
      return res.status(400).json({
        message: "El puesto ya tiene afiliado activo"
      });
    }

    // Insertar nueva tenencia
    db.run(`
      INSERT INTO tenencia_puesto
      (id_afiliado, id_puesto, razon)
      VALUES (?, ?, ?)
    `,
    [id_afiliado, id_puesto, razon || 'NUEVO'],
    function(err) {

      if (err) {
        return res.status(500).json({
          message: "Error asignando puesto",
          error: err.message
        });
      }

      res.json({
        message: "Puesto asignado",
        id_tenencia: this.lastID
      });

    });

  });

};



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



// ======================================
// ABANDONO DE PUESTO
// ======================================
const abandonoPuesto = (req, res) => {

  const { id_puesto } = req.body;

  db.run(`
    UPDATE tenencia_puesto
    SET fecha_fin = CURRENT_DATE,
        razon = 'ABANDONO'
    WHERE id_puesto = ?
    AND fecha_fin IS NULL
  `,
  [id_puesto],
  function(err) {

    if (err) {
      return res.status(500).json({
        message: "Error en abandono"
      });
    }

    res.json({
      message: "Puesto liberado por abandono"
    });

  });

};



// ======================================
// DESPOJO (POR ORGANIZACION)
// ======================================
const despojarPuesto = (req, res) => {

  const { id_puesto, motivo } = req.body;

  db.run(`
    UPDATE tenencia_puesto
    SET fecha_fin = CURRENT_DATE,
        razon = ?
    WHERE id_puesto = ?
    AND fecha_fin IS NULL
  `,
  [motivo || 'DESPOJO', id_puesto],
  function(err) {

    if (err) {
      return res.status(500).json({
        message: "Error en despojo"
      });
    }

    res.json({
      message: "Puesto despojado"
    });

  });

};



// ======================================
// HISTORIAL DE TENENCIA POR PUESTO
// ======================================
const historialPuesto = (req, res) => {

  const { id } = req.params;

  db.all(`
    SELECT 
      t.*,
      a.nombre,
      a.paterno,
      a.ci
    FROM tenencia_puesto t
    JOIN afiliado a
      ON t.id_afiliado = a.id_afiliado
    WHERE t.id_puesto = ?
    ORDER BY t.fecha_ini DESC
  `,
  [id],
  (err, rows) => {

    if (err) {
      return res.status(500).json({
        message: "Error obteniendo historial"
      });
    }

    res.json(rows);

  });

};



// ======================================
// VER TENENCIA ACTIVA DE UN PUESTO
// ======================================
const tenenciaActiva = (req, res) => {

  const { id } = req.params;

  db.get(`
    SELECT t.*, a.nombre, a.paterno, a.ci
    FROM tenencia_puesto t
    JOIN afiliado a
      ON t.id_afiliado = a.id_afiliado
    WHERE t.id_puesto = ?
    AND t.fecha_fin IS NULL
  `,
  [id],
  (err, row) => {

    if (err) {
      return res.status(500).json({
        message: "Error"
      });
    }

    res.json(row || null);

  });

};



module.exports = {
  asignarPuesto,
  traspasarPuesto,
  abandonoPuesto,
  despojarPuesto,
  historialPuesto,
  tenenciaActiva
};
