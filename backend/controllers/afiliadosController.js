//controllers/afiliadosController
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
// =============================
// BUSCAR AFILIADOS (por CI o nombre)
// =============================
const buscarAfiliados = (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Falta término de búsqueda" });
  }

  const sql = `
    SELECT * 
    FROM afiliado
    WHERE ci LIKE ? OR nombre LIKE ? OR paterno LIKE ? OR materno LIKE ?
    ORDER BY paterno, nombre
    LIMIT 10
  `;

  const termino = `%${q}%`;
  db.all(sql, [termino, termino, termino, termino], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Error en búsqueda" });
    }

    res.json(rows);
  });
};
// =============================
// OBTENER AFILIADOS ACTIVOS
// =============================
const obtenerActivos = (req, res) => {
  const sql = `
    SELECT *
    FROM afiliado
    WHERE es_habilitado = 1
    ORDER BY paterno, nombre
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error obteniendo afiliados activos"
      });
    }

    res.json(rows);
  });
};

// =============================
// OBTENER PUESTOS DE UN AFILIADO
// =============================
const obtenerPuestosAfiliado = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      p.*,
      t.fecha_ini,
      t.razon
    FROM puesto p
    JOIN tenencia_puesto t ON p.id_puesto = t.id_puesto
    WHERE t.id_afiliado = ?
    AND t.fecha_fin IS NULL
    ORDER BY p.fila, p.cuadra, p.nroPuesto
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error obteniendo puestos del afiliado"
      });
    }

    res.json(rows);
  });
};

// =============================
// BUSQUEDA AVANZADA
// =============================
const buscarAvanzado = (req, res) => {
  const { nombre, ci, ocupacion, habilitado } = req.query;

  let condiciones = [];
  let parametros = [];

  if (nombre) {
    condiciones.push("(nombre LIKE ? OR paterno LIKE ? OR materno LIKE ?)");
    const termino = `%${nombre}%`;
    parametros.push(termino, termino, termino);
  }

  if (ci) {
    condiciones.push("ci LIKE ?");
    parametros.push(`%${ci}%`);
  }

  if (ocupacion) {
    condiciones.push("ocupacion LIKE ?");
    parametros.push(`%${ocupacion}%`);
  }

  if (habilitado !== undefined) {
    condiciones.push("es_habilitado = ?");
    parametros.push(habilitado === 'true' ? 1 : 0);
  }

  let whereClause = condiciones.length > 0 ? 
    `WHERE ${condiciones.join(' AND ')}` : 
    '';

  const sql = `
    SELECT *
    FROM afiliado
    ${whereClause}
    ORDER BY paterno, nombre
    LIMIT 100
  `;

  db.all(sql, parametros, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error en búsqueda avanzada"
      });
    }

    res.json(rows);
  });
};



module.exports = {
  listaAfiliados,
  buscarAfiliadoPorCI,
  buscarAfiliadoPorId,
  crearAfiliado,
  actualizarAfiliado,
  deshabilitarAfiliado,
  buscarAfiliados,
  obtenerActivos,         // NUEVO
  obtenerPuestosAfiliado, // NUEVO
  buscarAvanzado
};
