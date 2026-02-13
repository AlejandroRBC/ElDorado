const db = require('../config/db');

exports.listar = (req, res) => {

  const sql = `
    SELECT
      p.id_puesto,
      p.fila,
      p.cuadra,
      p.nroPuesto,
      p.ancho,
      p.largo,
      p.tiene_patente,
      p.rubro,

      t.fecha_ini AS fecha_adquisicion,

      a.id_afiliado,
      a.ci,
      (a.nombre || ' ' || a.paterno || ' ' || a.materno) AS apoderado

    FROM puesto p

    LEFT JOIN tenencia_puesto t 
    ON t.id_tenencia = (
        SELECT id_tenencia
        FROM tenencia_puesto
        WHERE id_puesto = p.id_puesto
        AND fecha_fin IS NULL
        ORDER BY id_tenencia DESC
        LIMIT 1
    )
    LEFT JOIN afiliado a
      ON a.id_afiliado = t.id_afiliado

    ORDER BY p.id_puesto ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al listar puestos" });
    }

    res.json(rows);
  });
};

exports.infoTraspaso = (req, res) => {

  const idPuesto = parseInt(req.params.id);

  if (!idPuesto) {
    return res.status(400).json({ error: "ID inválido" });
  }

  db.get(`
    SELECT a.*
    FROM tenencia_puesto t
    JOIN afiliado a ON a.id_afiliado = t.id_afiliado
    WHERE t.id_puesto = ?
    AND t.fecha_fin IS NULL
    ORDER BY t.id_tenencia DESC
    LIMIT 1
  `, [idPuesto], (err, afiliado) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error buscando afiliado actual" });
    }

    if (!afiliado) {
      return res.json({
        afiliadoActual: null,
        puestosDelAfiliado: []
      });
    }

    db.all(`
      SELECT p.*
      FROM tenencia_puesto t
      JOIN puesto p ON p.id_puesto = t.id_puesto
      WHERE t.id_afiliado = ?
      AND t.fecha_fin IS NULL
    `, [afiliado.id_afiliado], (err2, puestos) => {

      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Error buscando puestos" });
      }

      res.json({
        afiliadoActual: afiliado,
        puestosDelAfiliado: puestos
      });

    });

  });
};

exports.traspasar = (req, res) => {

    const { id_puesto, id_nuevo_afiliado, razon } = req.body;

    if (!id_puesto || !id_nuevo_afiliado) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    db.serialize(() => {

      db.run("BEGIN TRANSACTION");
      db.get(`
        SELECT *
        FROM tenencia_puesto
        WHERE id_puesto = ?
        AND fecha_fin IS NULL
        ORDER BY id_tenencia DESC
        LIMIT 1
      `, [id_puesto], (err, tenenciaActual) => {

        if (err || !tenenciaActual) {
          db.run("ROLLBACK");
          return res.status(400).json({ error: "No existe tenencia activa" });
        }

        
        if (tenenciaActual.id_afiliado == id_nuevo_afiliado) {
          db.run("ROLLBACK");
          return res.status(400).json({ 
            error: "El puesto ya pertenece a ese afiliado" 
          });
        }
        db.run(`
          UPDATE tenencia_puesto
          SET fecha_fin = CURRENT_DATE,
              razon = 'TRASPASO'
          WHERE id_tenencia = ?
        `, [razon || 'traspaso', tenenciaActual.id_tenencia], (err2) => {

          if (err2) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err2.message });
          }
          db.run(`
            INSERT INTO tenencia_puesto
            (id_afiliado, id_puesto, razon)
            VALUES (?, ?, 'TRASPASO')
          `, [id_nuevo_afiliado, id_puesto], (err3) => {

            if (err3) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err3.message });
            }
            db.run("COMMIT");
            res.json({
              success: true,
              mensaje: "Puesto traspasado correctamente"
            });

          });

        });

      });

    });

};

exports.actualizar = (req, res) => {
  const id = parseInt(req.params.id);
  const {
    nroPuesto,
    rubro,
    fila,
    cuadra,
    ancho,
    largo,
    tiene_patente
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const sql = `
    UPDATE puesto
    SET nroPuesto = ?,
        rubro = ?,
        fila = ?,
        cuadra = ?,
        ancho = ?,
        largo = ?,
        tiene_patente = ?
    WHERE id_puesto = ?
  `;

  db.run(sql, [
    nroPuesto,
    rubro,
    fila,
    cuadra,
    ancho,
    largo,
    tiene_patente ? 1 : 0,
    id
  ], function (err) {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al actualizar puesto" });
    }

    res.json({
      success: true,
      mensaje: "Puesto actualizado"
    });
  });
};



// ===============================
// ELIMINAR PUESTO
// ===============================
const eliminarPuesto = (req, res) => {

  const { id } = req.params;

  db.run(
    `DELETE FROM puesto WHERE id_puesto = ?`,
    [id],
    function(err) {

      if (err) {
        console.error(err.message);
        return res.status(500).json({
          message: "Error al eliminar"
        });
      }

      res.json({
        message: "Puesto eliminado"
      });

    }
  );

};



// ===============================
// LISTAR PUESTOS CON AFILIADO ACTUAL
// (JOIN con tenencia activa)
// ===============================
const listarPuestosConAfiliado = (req, res) => {

  const sql = `
    SELECT 
      p.*,
      a.id_afiliado,
      a.nombre,
      a.paterno,
      a.ci
    FROM puesto p
    LEFT JOIN tenencia_puesto t 
      ON p.id_puesto = t.id_puesto
      AND t.fecha_fin IS NULL
    LEFT JOIN afiliado a
      ON t.id_afiliado = a.id_afiliado
    ORDER BY p.fila, p.cuadra, p.nroPuesto
  `;

  db.all(sql, [], (err, rows) => {

    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error en consulta"
      });
    }

    res.json(rows);

  });

};







// ===============================
// LISTAR PUESTOS DISPONIBLES (NO OCUPADOS, NO PASOS) esto lo ando usando en el modulo de afiliados
// ===============================
const listarPuestosDisponibles = (req, res) => {
  const sql = `
      SELECT 
      p.id_puesto,
      p.fila,
      p.cuadra,
      p.nroPuesto,
      p.ancho,
      p.largo,
      p.tiene_patente,
      p.rubro,
      CASE 
        WHEN p.disponible = 1 AND t.id_puesto IS NULL THEN 1
        ELSE 0
      END as disponible
    FROM puesto p
    LEFT JOIN tenencia_puesto t ON p.id_puesto = t.id_puesto AND t.fecha_fin IS NULL
    WHERE p.nroPuesto < 10000  
      AND p.disponible = 1     
      AND t.id_puesto IS NULL  
    ORDER BY 
      CASE p.fila 
        WHEN 'A' THEN 1 
        WHEN 'B' THEN 2 
        WHEN 'C' THEN 3 
        WHEN 'D' THEN 4 
        WHEN 'E' THEN 5 
      END,
      p.cuadra,
      p.nroPuesto
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error al listar puestos disponibles",
        error: err.message
      });
    }

    res.json(rows);
  });
};
module.exports = {
  listarPuestos,
  obtenerPuesto,
  crearPuesto,
  actualizarPuesto,
  eliminarPuesto,
  listarPuestosConAfiliado,
  listarPuestosDisponibles // este es el metodo de afiliados
};
