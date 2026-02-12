const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const afiliadosController = require('../controllers/afiliadosController');
const db = require('../config/db');

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads/perfiles');
    require('fs').mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);

    cb(null, 'perfil-' + req.params.id + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
  }
});

// Ruta para subir imagen de perfil
router.post('/:id/upload-perfil', upload.single('foto'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    
    const idAfiliado = req.params.id;
    const fotoPath = `/uploads/perfiles/${req.file.filename}`;
    
    // Actualizar en la base de datos
    db.run(
      'UPDATE afiliado SET url_perfil = ? WHERE id_afiliado = ?',
      [fotoPath, idAfiliado],
      function(err) {
        if (err) {
          console.error('Error al actualizar foto de perfil:', err);
          return res.status(500).json({ error: 'Error al guardar la imagen' });
        }
        
        res.json({
          success: true,
          message: 'Imagen subida exitosamente',
          url: fotoPath
        });
      }
    );
  } catch (error) {
    console.error('Error en upload-perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para asignar puesto a afiliado
router.post('/:id/asignar-puesto', (req, res) => {
  try {
    const { fila, cuadra, nroPuesto, rubro, tiene_patente, razon } = req.body;
    const idAfiliado = req.params.id;
    
    // 1. Buscar o crear el puesto
    db.get(
      `SELECT id_puesto FROM puesto WHERE fila = ? AND cuadra = ? AND nroPuesto = ?`,
      [fila, cuadra, nroPuesto],
      (err, puesto) => {
        if (err) {
          console.error('Error buscando puesto:', err);
          return res.status(500).json({ error: 'Error al buscar puesto' });
        }
        
        let idPuesto;
        
        if (puesto) {
          // Puesto existe, actualizar si es necesario
          idPuesto = puesto.id_puesto;
          db.run(
            `UPDATE puesto SET rubro = ?, tiene_patente = ? WHERE id_puesto = ?`,
            [rubro || null, tiene_patente ? 1 : 0, idPuesto],
            (err) => {
              if (err) console.error('Error actualizando puesto:', err);
            }
          );
        } else {
          // Crear nuevo puesto
          db.run(
            `INSERT INTO puesto (fila, cuadra, nroPuesto, rubro, tiene_patente) 
             VALUES (?, ?, ?, ?, ?)`,
            [fila, cuadra, nroPuesto, rubro || null, tiene_patente ? 1 : 0],
            function(err) {
              if (err) {
                console.error('Error creando puesto:', err);
                return res.status(500).json({ error: 'Error al crear puesto' });
              }
              idPuesto = this.lastID;
              crearTenenciaPuesto();
            }
          );
          return;
        }
        
        crearTenenciaPuesto();
        
        function crearTenenciaPuesto() {
          // 2. Crear tenencia_puesto
          db.run(
            `INSERT INTO tenencia_puesto (id_afiliado, id_puesto, razon) 
             VALUES (?, ?, ?)`,
            [idAfiliado, idPuesto, razon || 'NUEVITO'],
            function(err) {
              if (err) {
                console.error('Error creando tenencia_puesto:', err);
                return res.status(500).json({ error: 'Error al asignar puesto' });
              }
              
              res.json({
                success: true,
                message: 'Puesto asignado exitosamente',
                id_tenencia: this.lastID,
                id_puesto: idPuesto
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Error en asignar-puesto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});




router.get('/rubros', async (req, res) => {
  try {
    const Afiliado = require('../models/Afiliado');
    const rubros = await Afiliado.getRubrosUnicos();
    res.json(rubros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/estadisticas', async (req, res) => {
  try {
    const Afiliado = require('../models/Afiliado');
    const estadisticas = await Afiliado.getEstadisticas();
    res.json(estadisticas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Rutas existentes
router.get('/test', afiliadosController.test);
router.get('/', afiliadosController.getAll);
router.get('/:id', afiliadosController.getById);
router.post('/', afiliadosController.create);

module.exports = router;