// controllers/puestosController.js
const db = require('../config/db');

// ===============================
// LISTAR PUESTOS DISPONIBLES (PARA MÓDULO AFILIADOS)
// ===============================
const listarPuestosDisponibles = (req, res) => {
  // Sin fecha_fin: un puesto está ocupado si tiene fila en tenencia_puesto
  const sql = `
    SELECT
      p.id_puesto,
      p.fila,
      p.cuadra,
      p.nroPuesto,
      p.ancho,
      p.largo,
      p.tiene_patente,
      p.nro_patente,
      p.rubro,
      CASE WHEN t.id_puesto IS NULL THEN 1 ELSE 0 END as disponible
    FROM puesto p
    LEFT JOIN tenencia_puesto t ON p.id_puesto = t.id_puesto
    WHERE p.nroPuesto < 10000
      AND p.disponible = 1
      AND t.id_puesto IS NULL
    ORDER BY p.id_puesto
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Error al listar puestos disponibles', error: err.message });
    }
    res.json(rows);
  });
};


// ===============================
// FILTRAR PUESTOS DISPONIBLES (PARA MÓDULO AFILIADOS)
// ===============================
const obtenerFiltros = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) as total,
      GROUP_CONCAT(DISTINCT fila)   as filas,
      GROUP_CONCAT(DISTINCT cuadra) as cuadras,
      MIN(nroPuesto) as min_nro,
      MAX(nroPuesto) as max_nro
    FROM puesto
    WHERE disponible = 1
  `;

  db.get(sql, [], (err, row) => {
    if (err) {
      console.error('Error obteniendo filtros:', err);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      total:   row.total || 0,
      filas:   row.filas   ? row.filas.split(',').sort()   : [],
      cuadras: row.cuadras ? row.cuadras.split(',').sort() : [],
      rango_numeros: { min: row.min_nro || 1, max: row.max_nro || 100 },
    });
  });
};


// ===============================
// LISTAR PUESTOS PARA GESTIÓN (CON APODERADO)
// ===============================
const listar = (req, res) => {
  // Sin subquery de fecha_fin: tenencia_puesto tiene una fila por puesto máximo
  const sql = `
    SELECT
      p.id_puesto,
      p.fila,
      p.cuadra,
      p.nroPuesto,
      p.ancho,
      p.largo,
      p.tiene_patente,
      p.nro_patente,
      p.rubro,
      t.fecha_ini AS fecha_adquisicion,
      a.id_afiliado,
      a.ci,
      (a.nombre || ' ' || a.paterno || ' ' || a.materno) AS apoderado
    FROM puesto p
    LEFT JOIN tenencia_puesto t ON p.id_puesto = t.id_puesto
    LEFT JOIN afiliado a        ON a.id_afiliado = t.id_afiliado
    ORDER BY p.id_puesto ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al listar puestos' });
    }
    res.json(rows);
  });
};


// ===============================
// OBTENER INFORMACIÓN PARA TRASPASO
// ===============================
const infoTraspaso = (req, res) => {
  const idPuesto = parseInt(req.params.id);
  if (!idPuesto) return res.status(400).json({ error: 'ID inválido' });

  // Sin fecha_fin: si hay fila en tenencia_puesto, ese afiliado es el dueño
  db.get(`
    SELECT a.*
    FROM tenencia_puesto t
    JOIN afiliado a ON a.id_afiliado = t.id_afiliado
    WHERE t.id_puesto = ?
    LIMIT 1
  `, [idPuesto], (err, afiliado) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error buscando afiliado actual' });
    }

    if (!afiliado) {
      return res.json({ afiliadoActual: null, puestosDelAfiliado: [] });
    }

    db.all(`
      SELECT p.*
      FROM tenencia_puesto t
      JOIN puesto p ON p.id_puesto = t.id_puesto
      WHERE t.id_afiliado = ?
    `, [afiliado.id_afiliado], (err2, puestos) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Error buscando puestos' });
      }
      res.json({ afiliadoActual: afiliado, puestosDelAfiliado: puestos });
    });
  });
};


// ===============================
// REALIZAR TRASPASO DE PUESTO
// Flujo: UPDATE razon → DELETE viejo → INSERT nuevo (atómico).
// El trigger BEFORE DELETE graba la salida en historial_puestos.
// El trigger AFTER INSERT graba la entrada en historial_puestos.
// ===============================
const traspasar = (req, res) => {
  const { id_puesto, id_nuevo_afiliado } = req.body;

  if (!id_puesto || !id_nuevo_afiliado) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 1. Obtener tenencia actual
    db.get(
      `SELECT * FROM tenencia_puesto WHERE id_puesto = ? LIMIT 1`,
      [id_puesto],
      (err, tenenciaActual) => {
        if (err || !tenenciaActual) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'No existe tenencia activa para este puesto' });
        }

        if (tenenciaActual.id_afiliado == id_nuevo_afiliado) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'El puesto ya pertenece a ese afiliado' });
        }

        // 2. Marcar razón TRASPASO para que trg_puesto_delete la lea en OLD.razon
        db.run(
          `UPDATE tenencia_puesto SET razon = 'TRASPASO' WHERE id_puesto = ?`,
          [id_puesto],
          (err2) => {
            if (err2) { db.run('ROLLBACK'); return res.status(500).json({ error: err2.message }); }

            // 3. DELETE (dispara trg_puesto_delete → graba TRASPASO-salida en historial)
            db.run(
              `DELETE FROM tenencia_puesto WHERE id_puesto = ?`,
              [id_puesto],
              (err3) => {
                if (err3) { db.run('ROLLBACK'); return res.status(500).json({ error: err3.message }); }

                // 4. INSERT (dispara trg_puesto_insert → graba TRASPASO-entrada en historial)
                db.run(
                  `INSERT INTO tenencia_puesto (id_afiliado, id_puesto, razon)
                   VALUES (?, ?, 'TRASPASO')`,
                  [id_nuevo_afiliado, id_puesto],
                  (err4) => {
                    if (err4) { db.run('ROLLBACK'); return res.status(500).json({ error: err4.message }); }

                    db.run('COMMIT');
                    res.json({ success: true, mensaje: 'Puesto traspasado correctamente' });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};


// ===============================
// ACTUALIZAR PUESTO (VERSIÓN GESTIÓN)
// ===============================
const actualizar = (req, res) => {
  const id = parseInt(req.params.id);

  let {
    nroPuesto,
    rubro,
    fila,
    cuadra,
    ancho,
    largo,
    tiene_patente,
    nro_patente,
  } = req.body;

  if (!id) return res.status(400).json({ error: 'ID inválido' });

  // Si nro_patente viene vacío → sin patente
  if (!nro_patente || String(nro_patente).trim() === '') {
    nro_patente   = null;
    tiene_patente = 0;
  } else {
    tiene_patente = 1;
  }

  const sql = `
    UPDATE puesto
    SET nroPuesto = ?, rubro = ?, fila = ?, cuadra = ?,
        ancho = ?, largo = ?, tiene_patente = ?, nro_patente = ?
    WHERE id_puesto = ?
  `;

  db.run(sql, [nroPuesto, rubro, fila, cuadra, ancho, largo, tiene_patente, nro_patente, id],
    function (err) {
      if (err) {
        console.error('ERROR SQL:', err.message);
        return res.status(500).json({ error: 'Error al actualizar puesto en la base de datos', details: err.message });
      }
      res.json({ success: true, mensaje: 'Puesto actualizado correctamente' });
    }
  );
};


// ===============================
// EXPORTAR TODAS LAS FUNCIONES
// ===============================
module.exports = {
  listarPuestosDisponibles,
  obtenerFiltros,
  listar,
  infoTraspaso,
  traspasar,
  actualizar,
};