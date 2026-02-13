//controllers/puestosController

const db = require('../config/db');


// ===============================
// LISTAR TODOS LOS PUESTOS
// ===============================
const listarPuestos = (req, res) => {

  const sql = `
    SELECT *
    FROM puesto
    ORDER BY fila, cuadra, nroPuesto
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error al listar puestos"
      });
    }

    res.json(rows);
  });

};



// ===============================
// VER PUESTO POR ID
// ===============================
const obtenerPuesto = (req, res) => {

  const { id } = req.params;

  db.get(
    `SELECT * FROM puesto WHERE id_puesto = ?`,
    [id],
    (err, row) => {

      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Error" });
      }

      if (!row) {
        return res.status(404).json({
          message: "Puesto no encontrado"
        });
      }

      res.json(row);
    }
  );

};



// ===============================
// CREAR PUESTO
// ===============================
const crearPuesto = (req, res) => {

  const {
    fila,
    cuadra,
    nroPuesto,
    ancho,
    largo,
    tiene_patente,
    rubro
  } = req.body;

  const sql = `
    INSERT INTO puesto
    (fila, cuadra, nroPuesto, ancho, largo, tiene_patente, rubro)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    fila,
    cuadra,
    nroPuesto,
    ancho,
    largo,
    tiene_patente ? 1 : 0,
    rubro
  ],
  function(err) {

    if (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "Error al crear puesto",
        error: err.message
      });
    }

    res.status(201).json({
      message: "Puesto creado",
      id: this.lastID
    });

  });

};



// ===============================
// ACTUALIZAR PUESTO
// ===============================
const actualizarPuesto = (req, res) => {

  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE puesto
    SET fila = ?,
        cuadra = ?,
        nroPuesto = ?,
        ancho = ?,
        largo = ?,
        tiene_patente = ?,
        rubro = ?
    WHERE id_puesto = ?
  `;

  db.run(sql, [
    datos.fila,
    datos.cuadra,
    datos.nroPuesto,
    datos.ancho,
    datos.largo,
    datos.tiene_patente ? 1 : 0,
    datos.rubro,
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
      message: "Puesto actualizado",
      cambios: this.changes
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
