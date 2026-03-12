
const Afiliado = require('../models/Afiliado');

// ============================================
// OBTENER TODOS (con filtros)
// ============================================
exports.obtenerTodos = async (req, res) => {
  try {
    const {
      search,
      rubro,
      orden = 'alfabetico',
      puestoCount = null,
      conPatente = null
    } = req.query;

    const afiliados = await Afiliado.obtenerTodos({ search, rubro, orden, puestoCount, conPatente });
    res.json(afiliados);
  } catch (error) {
    console.error('Error en obtenerTodos:', error);
    res.status(500).json({ error: 'Error al obtener afiliados', detalles: error.message });
  }
};


// ============================================
// OBTENER DESHABILITADOS
// ============================================
exports.obtenerDeshabilitados = async (req, res) => {
  try {
    const { search, orden = 'alfabetico' } = req.query;

    const afiliados = await Afiliado.obtenerDeshabilitados({ search, orden });
    res.json(afiliados);
  } catch (error) {
    console.error('Error en obtenerDeshabilitados:', error);
    res.status(500).json({ error: 'Error al obtener afiliados deshabilitados', detalles: error.message });
  }
};


// ============================================
// OBTENER POR ID
// ============================================
exports.obtenerPorId = async (req, res) => {
  try {
    const afiliado = await Afiliado.obtenerPorId(req.params.id);

    if (!afiliado) {
      return res.status(404).json({ error: 'Afiliado no encontrado' });
    }

    res.json(afiliado);
  } catch (error) {
    console.error(`Error en obtenerPorId ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al obtener afiliado', detalles: error.message });
  }
};


// ============================================
// CREAR
// ============================================
exports.crear = async (req, res) => {
  try {
    if (!req.body.ci || !req.body.nombre || !req.body.paterno) {
      return res.status(400).json({ error: 'CI, nombre y apellido paterno son requeridos' });
    }

    if (!/^\d+$/.test(req.body.ci)) {
      return res.status(400).json({ error: 'CI debe contener solo números' });
    }

    const nuevoAfiliado = await Afiliado.crear({
      ...req.body,
      url_perfil: req.body.url_perfil || '/uploads/perfiles/sinPerfil.png'
    });

    res.status(201).json({ mensaje: 'Afiliado creado exitosamente', afiliado: nuevoAfiliado });
  } catch (error) {
    console.error('Error en crear:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ya existe un afiliado con este CI' });
    }
    res.status(500).json({ error: 'Error al crear afiliado', detalles: error.message });
  }
};


// ============================================
// ACTUALIZAR
// ============================================
exports.actualizar = async (req, res) => {
  try {
    const datos = req.body;

    if (!datos.ci || !datos.nombre || !datos.paterno) {
      return res.status(400).json({ error: 'CI, nombre y apellido paterno son requeridos' });
    }

    if (!/^\d+$/.test(datos.ci)) {
      return res.status(400).json({ error: 'CI debe contener solo números' });
    }

    const afiliadoActualizado = await Afiliado.actualizar(req.params.id, datos);
    res.json({ mensaje: 'Afiliado actualizado exitosamente', afiliado: afiliadoActualizado });
  } catch (error) {
    console.error('Error en actualizar:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ya existe un afiliado con este CI' });
    }
    res.status(500).json({ error: 'Error al actualizar afiliado', detalles: error.message });
  }
};


// ============================================
// DESHABILITAR
// ============================================
exports.deshabilitar = async (req, res) => {
  try {
    const { es_habilitado } = req.body;
    await Afiliado.deshabilitar(req.params.id, es_habilitado);

    res.json({
      success: true,
      mensaje: es_habilitado === 0 ? 'Afiliado deshabilitado' : 'Afiliado habilitado'
    });
  } catch (error) {
    console.error('Error en deshabilitar:', error);
    if (error.message === 'Afiliado no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// REHABILITAR
// ============================================
exports.rehabilitar = async (req, res) => {
  try {
    const resultado = await Afiliado.rehabilitar(req.params.id);
    res.json({ success: true, mensaje: 'Afiliado rehabilitado exitosamente', ...resultado });
  } catch (error) {
    console.error('Error en rehabilitar:', error);
    if (error.message === 'Afiliado no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// CONTAR DESHABILITADOS
// ============================================
exports.contarDeshabilitados = async (req, res) => {
  try {
    const total = await Afiliado.contarDeshabilitados();
    res.json({ total });
  } catch (error) {
    console.error('Error en contarDeshabilitados:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// BUSCAR (para selector de traspaso)
// ============================================
exports.buscar = async (req, res) => {
  try {
    const resultados = await Afiliado.buscar(req.query.q || '');
    res.json(resultados);
  } catch (error) {
    console.error('Error en buscar:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// OBTENER PUESTOS ACTIVOS DE UN AFILIADO
// ============================================
exports.obtenerPuestos = async (req, res) => {
  try {
    const puestos = await Afiliado.obtenerPuestos(req.params.id);
    res.json(puestos);
  } catch (error) {
    console.error('Error en obtenerPuestos:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// ASIGNAR PUESTO
// ============================================
exports.asignarPuesto = async (req, res) => {
  try {
    const resultado = await Afiliado.asignarPuesto(req.params.id, req.body);
    res.json({ success: true, mensaje: 'Puesto asignado exitosamente', ...resultado });
  } catch (error) {
    console.error('Error en asignarPuesto:', error);
    const erroresCliente = ['Puesto no encontrado', 'El puesto no está disponible', 'El puesto ya está ocupado'];
    if (erroresCliente.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ============================================
// DESPOJAR O LIBERAR PUESTO
// ============================================
exports.despojarPuesto = async (req, res) => {
  try {
    const { idAfiliado, idPuesto, razon } = req.body;

    if (!idAfiliado || !idPuesto || !razon) {
      return res.status(400).json({ error: 'idAfiliado, idPuesto y razon son requeridos' });
    }

    if (!['DESPOJADO', 'LIBERADO'].includes(razon)) {
      return res.status(400).json({ error: 'La razón debe ser DESPOJADO o LIBERADO' });
    }

    const resultado = await Afiliado.despojarPuesto(idAfiliado, idPuesto, razon);
    res.json({
      success: true,
      mensaje: `Puesto ${razon === 'DESPOJADO' ? 'despojado' : 'liberado'} correctamente`,
      ...resultado
    });
  } catch (error) {
    console.error('Error en despojarPuesto:', error);
    if (error.message.includes('No se encontró')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// OBTENER RUBROS
// ============================================
exports.obtenerRubros = async (req, res) => {
  try {
    const rubros = await Afiliado.obtenerRubros();
    res.json(rubros);
  } catch (error) {
    console.error('Error en obtenerRubros:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// OBTENER ESTADÍSTICAS
// ============================================
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Afiliado.obtenerEstadisticas();
    res.json(estadisticas);
  } catch (error) {
    console.error('Error en obtenerEstadisticas:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// OBTENER DATOS PARA PDF
// ============================================
exports.obtenerDatosPdf = async (req, res) => {
  try {
    const afiliado = await Afiliado.obtenerPorId(req.params.id);

    if (!afiliado) {
      return res.status(404).json({ error: 'Afiliado no encontrado' });
    }

    res.json({ ...afiliado, fechaGeneracion: new Date().toISOString() });
  } catch (error) {
    console.error('Error en obtenerDatosPdf:', error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================
// SUBIR FOTO DE PERFIL
// ============================================
exports.subirFotoPerfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ exito: false, error: 'No se recibió ninguna imagen' });
    }

    const resultado = await Afiliado.actualizarFotoPerfil(
      req.params.id,
      `/uploads/perfiles/${req.file.filename}`
    );

    res.json({
      exito: true,
      mensaje: 'Foto de perfil actualizada correctamente',
      datos: { url: resultado.url, idAfiliado: req.params.id }
    });
  } catch (error) {
    console.error('Error en subirFotoPerfil:', error);
    res.status(500).json({ exito: false, error: 'Error al procesar la imagen' });
  }
};


// ============================================
// RUTA DE PRUEBA
// ============================================
exports.probar = (req, res) => {
  res.json({ mensaje: 'API de Afiliados funcionando', fecha: new Date().toISOString() });
};