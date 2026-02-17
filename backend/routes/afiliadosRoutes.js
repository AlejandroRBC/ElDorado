const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const afiliadosController = require('../controllers/afiliadosController');
const db = require('../config/db');

router.put('/:id', afiliadosController.update);

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
    
    // 1. Buscar el puesto (NO CREAR NUEVO)
    db.get(
      `SELECT id_puesto, disponible FROM puesto WHERE fila = ? AND cuadra = ? AND nroPuesto = ?`,
      [fila, cuadra, nroPuesto],
      (err, puesto) => {
        if (err) {
          console.error('Error buscando puesto:', err);
          return res.status(500).json({ error: 'Error al buscar puesto' });
        }
        
        if (!puesto) {
          return res.status(404).json({ error: 'Puesto no encontrado' });
        }

        // Verificar si el puesto está disponible
        if (puesto.disponible === 0) {
          return res.status(400).json({ error: 'El puesto no está disponible' });
        }

        // Verificar si ya está ocupado
        db.get(
          `SELECT * FROM tenencia_puesto WHERE id_puesto = ? AND fecha_fin IS NULL`,
          [puesto.id_puesto],
          (err, tenenciaActiva) => {
            if (err) {
              console.error('Error verificando tenencia:', err);
              return res.status(500).json({ error: 'Error al verificar puesto' });
            }

            if (tenenciaActiva) {
              return res.status(400).json({ error: 'El puesto ya está ocupado' });
            }

            const idPuesto = puesto.id_puesto;

            // 2. Actualizar datos del puesto
            db.run(
              `UPDATE puesto SET rubro = ?, tiene_patente = ? WHERE id_puesto = ?`,
              [rubro || null, tiene_patente ? 1 : 0, idPuesto],
              (err) => {
                if (err) console.error('Error actualizando puesto:', err);
              }
            );

            // 3. Crear tenencia_puesto
            db.run(
              `INSERT INTO tenencia_puesto (id_afiliado, id_puesto, razon, fecha_ini) 
               VALUES (?, ?, ?, CURRENT_DATE)`,
              [idAfiliado, idPuesto, razon || 'ASIGNADO'],
              function(err) {
                if (err) {
                  console.error('Error creando tenencia_puesto:', err);
                  return res.status(500).json({ error: 'Error al asignar puesto' });
                }
                
                // 4. Marcar puesto como NO disponible
                db.run(
                  `UPDATE puesto SET disponible = 0 WHERE id_puesto = ?`,
                  [idPuesto],
                  (err) => {
                    if (err) console.error('Error actualizando disponibilidad:', err);
                  }
                );
                
                res.json({
                  success: true,
                  message: 'Puesto asignado exitosamente',
                  id_tenencia: this.lastID,
                  id_puesto: idPuesto
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error en asignar-puesto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
router.post('/despojar-puesto', afiliadosController.despojarPuesto);



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


router.put('/:id/deshabilitar', async (req, res) => {
  try {
    const { id } = req.params;
    const { es_habilitado } = req.body;
    
    // Actualizar solo el estado de habilitación
    db.run(
      'UPDATE afiliado SET es_habilitado = ? WHERE id_afiliado = ?',
      [es_habilitado, id],
      function(err) {
        if (err) {
          console.error('Error actualizando estado:', err);
          return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Afiliado no encontrado' });
        }
        
        res.json({
          success: true,
          message: es_habilitado === 0 ? 'Afiliado deshabilitado' : 'Afiliado habilitado',
          id: id
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Rutas existentes
router.get('/test', afiliadosController.test);
router.get('/', afiliadosController.getAll);
//buscador para los traspasos (Emisaor y receptor)
router.get('/buscar', afiliadosController.buscar);

router.get('/:id/puestos', afiliadosController.obtenerPuestos);

router.get('/:id', afiliadosController.getById);
router.post('/', afiliadosController.create);


module.exports = router;