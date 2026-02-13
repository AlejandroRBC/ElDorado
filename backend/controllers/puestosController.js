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

      // 1️⃣ Obtener tenencia activa actual
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

        // 🔒 evitar traspaso al mismo afiliado
        if (tenenciaActual.id_afiliado == id_nuevo_afiliado) {
          db.run("ROLLBACK");
          return res.status(400).json({ 
            error: "El puesto ya pertenece a ese afiliado" 
          });
        }

        // 2️⃣ cerrar tenencia actual
        db.run(`
          UPDATE tenencia_puesto
          SET fecha_fin = CURRENT_DATE,
              razon = ?
          WHERE id_tenencia = ?
        `, [razon || 'traspaso', tenenciaActual.id_tenencia], (err2) => {

          if (err2) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err2.message });
          }

          // 3️⃣ crear nueva tenencia
          db.run(`
            INSERT INTO tenencia_puesto
            (id_afiliado, id_puesto, razon)
            VALUES (?, ?, 'traspaso_recibido')
          `, [id_nuevo_afiliado, id_puesto], (err3) => {

            if (err3) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err3.message });
            }

            db.run("COMMIT");

            res.json({
              success: true,
              mensaje: "✅ Puesto traspasado correctamente"
            });

          });

        });

      });

    });

  };
