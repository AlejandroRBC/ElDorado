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
      (a.nombre || ' ' || a.paterno) AS apoderado

    FROM puesto p

    LEFT JOIN tenencia_puesto t 
    ON t.id_tenencia = (
        SELECT id_tenencia
        FROM tenencia_puesto
        WHERE id_puesto = p.id_puesto
        ORDER BY id_tenencia DESC
        LIMIT 1
    )
    LEFT JOIN afiliado a
      ON a.id_afiliado = t.id_afiliado

    ORDER BY p.fila, p.cuadra, p.nroPuesto
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
