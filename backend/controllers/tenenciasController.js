//controller/tenenciasController.js
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
// TRASPASO MÚLTIPLE (NUEVO)
// ======================================
const traspasoMultiple = (req, res) => {
  const { paraAfiliado, puestos, motivo } = req.body;

  if (!paraAfiliado || !paraAfiliado.id || !puestos || puestos.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Datos incompletos para el traspaso"
    });
  }

  // Iniciamos la serialización para que las consultas se ejecuten en orden
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let procesados = 0;
    let errores = [];

    puestos.forEach((idPuesto) => {
      // 1. Cerramos la tenencia actual del puesto
      db.run(`
        UPDATE tenencia_puesto 
        SET fecha_fin = CURRENT_DATE,
            razon = 'TRASPASO'
        WHERE id_puesto = ? AND fecha_fin IS NULL
      `, [idPuesto], (err) => {
        if (err) errores.push(`Error cerrando puesto ${idPuesto}`);

        // 2. Creamos la nueva tenencia para el nuevo dueño
        db.run(`
          INSERT INTO tenencia_puesto 
          (id_afiliado, id_puesto, razon, fecha_ini)
          VALUES (?, ?, ?, CURRENT_DATE)
        `, [paraAfiliado.id, idPuesto, motivo || 'TRASPASO MÚLTIPLE'], function(err) {
          if (err) errores.push(`Error asignando puesto ${idPuesto}`);

          procesados++;
          
          // Cuando el contador llegue al final del array, decidimos si hacer COMMIT o ROLLBACK
          if (procesados === puestos.length) {
            if (errores.length > 0) {
              db.run('ROLLBACK');
              res.status(500).json({ success: false, message: "Errores en el proceso", errores });
            } else {
              db.run('COMMIT');
              res.json({ 
                success: true, 
                message: `Se han traspasado ${procesados} puestos exitosamente.` 
              });
            }
          }
        });
      });
    });
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
  asignarPuesto,
  traspasarPuesto,
  abandonoPuesto,
  despojarPuesto,
  historialPuesto,
  tenenciaActiva,
  historialCompleto,
  traspasoMultiple,
  obtenerInfoTraspaso
};
