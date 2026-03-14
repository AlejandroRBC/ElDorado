const Directorio = require('../Models/DirectorioModel');
const db = require('../config/db');

// ============================================
// SECRETARÍAS — catálogo fijo
// ============================================
exports.obtenerSecretarias = async (req, res) => {
  try {
    const secretarias = await Directorio.obtenerSecretarias();
    res.json({ success: true, data: secretarias });
  } catch (error) {
    console.error('Error en obtenerSecretarias:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// GESTIONES
// ============================================
exports.obtenerGestiones = async (req, res) => {
  try {
    const gestiones = await Directorio.obtenerGestiones();
    res.json({ success: true, data: gestiones });
  } catch (error) {
    console.error('Error en obtenerGestiones:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerGestionActiva = async (req, res) => {
  try {
    const gestion = await Directorio.obtenerGestionActiva();
    if (!gestion) return res.status(404).json({ error: 'No hay gestión activa configurada' });
    res.json({ success: true, data: gestion });
  } catch (error) {
    console.error('Error en obtenerGestionActiva:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// DIRECTORIO — listar por gestión
// ============================================
exports.obtenerPorGestion = async (req, res) => {
  try {
    const idGestion = parseInt(req.params.idGestion);
    if (!idGestion) return res.status(400).json({ error: 'ID de gestión inválido' });

    const directorio = await Directorio.obtenerPorGestion(idGestion);
    res.json({ success: true, data: directorio });
  } catch (error) {
    console.error('Error en obtenerPorGestion:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const cargo = await Directorio.obtenerPorId(req.params.id);
    if (!cargo) return res.status(404).json({ error: 'Cargo no encontrado' });
    res.json({ success: true, data: cargo });
  } catch (error) {
    console.error('Error en obtenerPorId:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// ASIGNAR CARGO
// ============================================
exports.asignarCargo = async (req, res) => {
  try {
    const { id_gestion, id_secretaria, id_afiliado, fecha_inicio } = req.body;

    if (!id_gestion || !id_secretaria || !id_afiliado) {
      return res.status(400).json({ error: 'id_gestion, id_secretaria e id_afiliado son requeridos' });
    }

    const resultado = await Directorio.asignarCargo({
      id_gestion,
      id_secretaria,
      id_afiliado,
      fecha_inicio
    });

    res.status(201).json({
      success: true,
      mensaje: 'Cargo asignado en el Directorio',
      ...resultado
    });
  } catch (error) {
    console.error('Error en asignarCargo:', error);
    const erroresCliente = [
      'Afiliado no encontrado',
      'El afiliado no está vigente. Solo afiliados activos pueden integrar el Directorio',
      'Esa secretaría ya tiene un titular en la gestión seleccionada',
      'El afiliado ya ocupa un cargo en esta gestión'
    ];
    if (erroresCliente.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ============================================
// CERRAR CARGO
// ============================================
exports.cerrarCargo = async (req, res) => {
  try {
    const { fecha_fin } = req.body;
    const resultado = await Directorio.cerrarCargo(req.params.id, fecha_fin);
    res.json({ success: true, mensaje: 'Cargo cerrado correctamente', ...resultado });
  } catch (error) {
    console.error('Error en cerrarCargo:', error);
    if (error.message === 'Cargo no encontrado' || error.message === 'Este cargo ya fue cerrado anteriormente') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ============================================
// REEMPLAZAR CARGO (saliente → entrante)
// ============================================
exports.reemplazarCargo = async (req, res) => {
  try {
    const { id_afiliado_nuevo, fecha_cambio } = req.body;
    const idDirectorioSaliente = parseInt(req.params.id);

    if (!id_afiliado_nuevo) {
      return res.status(400).json({ error: 'id_afiliado_nuevo es requerido' });
    }

    const resultado = await Directorio.reemplazarCargo({
      idDirectorioSaliente,
      id_afiliado_nuevo,
      fecha_cambio
    });

    res.json({
      success: true,
      mensaje: 'Cargo reemplazado correctamente',
      ...resultado
    });
  } catch (error) {
    console.error('Error en reemplazarCargo:', error);
    const erroresCliente = [
      'Cargo activo no encontrado',
      'El afiliado entrante no está vigente'
    ];
    if (erroresCliente.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ============================================
// HISTORIAL DEL DIRECTORIO — de un afiliado
// ============================================
exports.obtenerHistorialAfiliado = async (req, res) => {
  try {
    const rows = await Directorio.obtenerHistorialAfiliado(req.params.idAfiliado);
    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    console.error('Error en obtenerHistorialAfiliado:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerHistorialCompleto = async (req, res) => {
  try {
    const { id_gestion, tipo, limite } = req.query;
    const rows = await Directorio.obtenerHistorialCompleto({ id_gestion, tipo, limite });
    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    console.error('Error en obtenerHistorialCompleto:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// HISTORIAL DE AFILIADO (datos personales)
// ============================================
exports.obtenerHistorialAfiliacion = (req, res) => {
  const idAfiliado = parseInt(req.params.idAfiliado);
  if (!idAfiliado) return res.status(400).json({ error: 'ID inválido' });

  const sql = `
    SELECT
      id_historial_af,
      id_afiliado,
      nom_afiliado,
      tipo,
      detalle,
      fecha,
      hora,
      nom_usuario_master,
      nom_afiliado_master
    FROM historial_afiliado
    WHERE id_afiliado = ?
    ORDER BY fecha DESC, id_historial_af DESC
  `;

  db.all(sql, [idAfiliado], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: rows, total: rows.length });
  });
};


/// crear gestion pero despues areglar 
exports.crearGestion = async (req, res) => {
  const { anio_inicio, anio_fin } = req.body;
 
  if (!anio_inicio || !anio_fin) {
    return res.status(400).json({ error: 'anio_inicio y anio_fin son requeridos' });
  }
  if (parseInt(anio_fin) <= parseInt(anio_inicio)) {
    return res.status(400).json({ error: 'anio_fin debe ser mayor que anio_inicio' });
  }
 
  const db = require('../config/db');
 
  db.run(
    `INSERT INTO gestion (anio_inicio, anio_fin, es_activa) VALUES (?, ?, 0)`,
    [parseInt(anio_inicio), parseInt(anio_fin)],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: `Ya existe una gestión ${anio_inicio}-${anio_fin}` });
        }
        return res.status(500).json({ error: 'Error al crear la gestión' });
      }
      res.status(201).json({
        success: true,
        mensaje: `Gestión ${anio_inicio}-${anio_fin} creada`,
        data: { id_gestion: this.lastID, anio_inicio, anio_fin, es_activa: 0 },
      });
    }
  );
};