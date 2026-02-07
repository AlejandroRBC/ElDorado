const db = require('../config/db');


// =============================
// LISTAR TODOS
// =============================
const listaAfiliados = (req, res) => {

  const sql = `
    SELECT *
    FROM afiliado
    ORDER BY paterno ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error al obtener afiliados"
      });
    }

    res.json(rows);
  });

};



// =============================
// BUSCAR POR CI
// =============================
const buscarAfiliadoPorCI = (req, res) => {

  const { ci } = req.params;

  const sql = `
    SELECT *
    FROM afiliado
    WHERE ci = ?
  `;

  db.get(sql, [ci], (err, row) => {

    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error en búsqueda"
      });
    }

    if (!row) {
      return res.status(404).json({
        message: "Afiliado no encontrado"
      });
    }

    res.json(row);
  });

};



// =============================
// BUSCAR POR ID
// =============================
const buscarAfiliadoPorId = (req, res) => {

  const { id } = req.params;

  db.get(
    `SELECT * FROM afiliado WHERE id_afiliado = ?`,
    [id],
    (err, row) => {

      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Error" });
      }

      if (!row) {
        return res.status(404).json({ message: "No existe" });
      }

      res.json(row);
    }
  );

};



// =============================
// CREAR AFILIADO
// =============================
const crearAfiliado = (req, res) => {

  const {
    ci,
    extension,
    nombre,
    paterno,
    materno,
    sexo,
    fecNac,
    telefono,
    ocupacion,
    direccion
  } = req.body;

  const sql = `
    INSERT INTO afiliado
    (ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    ci,
    extension,
    nombre,
    paterno,
    materno,
    sexo,
    fecNac,
    telefono,
    ocupacion,
    direccion
  ],
  function(err) {

    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error al crear afiliado"
      });
    }

    res.status(201).json({
      message: "Afiliado creado",
      id: this.lastID
    });

  });

};



// =============================
// ACTUALIZAR
// =============================
const actualizarAfiliado = (req, res) => {

  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE afiliado
    SET nombre = ?,
        paterno = ?,
        materno = ?,
        telefono = ?,
        direccion = ?,
        ocupacion = ?
    WHERE id_afiliado = ?
  `;

  db.run(sql, [
    datos.nombre,
    datos.paterno,
    datos.materno,
    datos.telefono,
    datos.direccion,
    datos.ocupacion,
    id
  ],
  function(err) {

    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error al actualizar"
      });
    }

    res.json({
      message: "Actualizado",
      cambios: this.changes
    });

  });

};



// =============================
// DESHABILITAR (soft delete)
// =============================
const deshabilitarAfiliado = (req, res) => {

  const { id } = req.params;

  db.run(
    `UPDATE afiliado SET es_habilitado = 0 WHERE id_afiliado = ?`,
    [id],
    function(err) {

      if (err) {
        console.error(err.message);
        return res.status(500).json({
          message: "Error al deshabilitar"
        });
      }

      res.json({
        message: "Afiliado deshabilitado"
      });

    }
  );

};



module.exports = {
  listaAfiliados,
  buscarAfiliadoPorCI,
  buscarAfiliadoPorId,
  crearAfiliado,
  actualizarAfiliado,
  deshabilitarAfiliado
};
