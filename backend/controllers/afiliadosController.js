const Afiliado = require('../models/Afiliado');
const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { 
      search, 
      rubro, 
      orden = 'alfabetico',
      puestoCount = null,
      conPatente = null 
    } = req.query;
    
    const afiliados = await Afiliado.findAll({ 
      search, 
      rubro,
      orden,
      puestoCount,
      conPatente
    });
    
    res.json(afiliados);
  } catch (error) {
    console.error('Error en getAll:', error);
    res.status(500).json({ 
      error: 'Error al obtener afiliados',
      detalles: error.message 
    });
  }
};

// Obtener rubros únicos para el filtro
exports.getRubros = async (req, res) => {
  try {
    const rubros = await Afiliado.getRubrosUnicos();
    res.json(rubros);
  } catch (error) {
    console.error('Error al obtener rubros:', error);
    res.status(500).json({ error: 'Error al obtener rubros' });
  }
};

// Obtener estadísticas para los contadores
exports.getEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Afiliado.getEstadisticas();
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
// Obtener afiliado por ID
exports.getById = async (req, res) => {
  try {
    const afiliado = await Afiliado.findById(req.params.id);
    
    if (!afiliado) {
      return res.status(404).json({ error: 'Afiliado no encontrado' });
    }
    
    res.json(afiliado);
  } catch (error) {
    console.error(`Error en getById ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Error al obtener afiliado',
      detalles: error.message 
    });
  }
};

// Crear nuevo afiliado
exports.create = async (req, res) => {
  try {
    // Validaciones básicas
    if (!req.body.ci || !req.body.nombre || !req.body.paterno) {
      return res.status(400).json({ 
        error: 'CI, nombre y apellido paterno son requeridos' 
      });
    }
    
    // Validar formato de CI (ejemplo simple)
    if (!/^\d+$/.test(req.body.ci)) {
      return res.status(400).json({ 
        error: 'CI debe contener solo números' 
      });
    }
    
    const nuevoAfiliado = await Afiliado.create(req.body);
    
    res.status(201).json({
      mensaje: 'Afiliado creado exitosamente',
      afiliado: nuevoAfiliado
    });
  } catch (error) {
    console.error('Error en create:', error);
    
    // Manejar error de CI duplicado
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ 
        error: 'Ya existe un afiliado con este CI' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al crear afiliado',
      detalles: error.message 
    });
  }
};
// AGREGAR MÉTODO UPDATE

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    
    // Validaciones básicas
    if (!datos.ci || !datos.nombre || !datos.paterno) {
      return res.status(400).json({ 
        error: 'CI, nombre y apellido paterno son requeridos' 
      });
    }
    
    // Validar formato de CI
    if (!/^\d+$/.test(datos.ci)) {
      return res.status(400).json({ 
        error: 'CI debe contener solo números' 
      });
    }
    
    const afiliadoActualizado = await Afiliado.update(id, datos);
    
    res.json({
      mensaje: 'Afiliado actualizado exitosamente',
      afiliado: afiliadoActualizado
    });
  } catch (error) {
    console.error('Error en update:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ 
        error: 'Ya existe un afiliado con este CI' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al actualizar afiliado',
      detalles: error.message 
    });
  }
};

// Ruta de prueba
exports.test = (req, res) => {
  res.json({ 
    mensaje: 'API de Afiliados funcionando',
    fecha: new Date().toISOString()
  });
};

// buscador para el recpetior y emisor
exports.buscar = (req, res) => {
  const q = req.query.q || '';

  const sql = `
    SELECT id_afiliado, ci, nombre, paterno, url_perfil
    FROM afiliado
    WHERE 
      ci LIKE ? OR
      nombre LIKE ? OR
      paterno LIKE ?
    LIMIT 10
  `;

  const like = `%${q}%`;

  db.all(sql, [like, like, like], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Obtener puestos activos de un afiliado
exports.obtenerPuestos = (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
      p.id_puesto,
      p.fila,
      p.cuadra,
      p.nroPuesto,
      p.rubro,
      p.tiene_patente,
      t.fecha_ini
    FROM puesto p
    JOIN tenencia_puesto t 
      ON t.id_puesto = p.id_puesto
    WHERE t.id_afiliado = ?
      AND t.fecha_fin IS NULL
    ORDER BY p.fila, p.cuadra, p.nroPuesto
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      console.error("Error obtenerPuestos:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
};

// Despojar o liberar puesto de un afiliado
exports.despojarPuesto = (req, res) => {
  const { idAfiliado, idPuesto, razon } = req.body;
  
  if (!idAfiliado || !idPuesto || !razon) {
    return res.status(400).json({ 
      error: 'Faltan datos: idAfiliado, idPuesto y razon son requeridos' 
    });
  }

  if (!['DESPOJADO', 'LIBERADO'].includes(razon)) {
    return res.status(400).json({ 
      error: 'La razón debe ser DESPOJADO o LIBERADO' 
    });
  }

  // Iniciar transacción
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 1. Actualizar la tenencia activa del puesto para este afiliado
    db.run(
      `UPDATE tenencia_puesto 
       SET fecha_fin = CURRENT_DATE, razon = ?
       WHERE id_afiliado = ? AND id_puesto = ? AND fecha_fin IS NULL`,
      [razon, idAfiliado, idPuesto],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          console.error('Error actualizando tenencia:', err);
          return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
          db.run('ROLLBACK');
          return res.status(404).json({ 
            error: 'No se encontró una tenencia activa para este puesto y afiliado' 
          });
        }

        // 2. Marcar el puesto como disponible
        db.run(
          `UPDATE puesto SET disponible = 1 WHERE id_puesto = ?`,
          [idPuesto],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Error actualizando disponibilidad:', err);
              return res.status(500).json({ error: err.message });
            }

            db.run('COMMIT');
            
            res.json({
              success: true,
              message: `Puesto ${razon === 'DESPOJADO' ? 'despojado' : 'liberado'} correctamente`,
              razon: razon,
              id_puesto: idPuesto,
              id_afiliado: idAfiliado
            });
          }
        );
      }
    );
  });
};