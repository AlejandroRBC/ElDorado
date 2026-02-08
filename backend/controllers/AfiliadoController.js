const Afiliado = require('../models/Afiliado');

// Obtener todos los afiliados
exports.getAll = async (req, res) => {
  try {
    const { search, rubro } = req.query;
    const afiliados = await Afiliado.findAll({ search, rubro });
    res.json(afiliados);
  } catch (error) {
    console.error('Error en getAll:', error);
    res.status(500).json({ 
      error: 'Error al obtener afiliados',
      detalles: error.message 
    });
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
        error: 'CI, nombre y apellido paterno son requeridos <br>'+req.body; 
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

// Ruta de prueba
exports.test = (req, res) => {
  res.json({ 
    mensaje: 'API de Afiliados funcionando',
    fecha: new Date().toISOString()
  });
};