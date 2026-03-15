const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/afiliadosController');
const { normalizeAfiliado } = require('../middleware/normalizeAfiliado');

// ============================================
// CONFIGURACIÓN DE MULTER (subida de imágenes)
// ============================================
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
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const validos = /jpeg|jpg|png|gif/;
    const mimeOk = validos.test(file.mimetype);
    const extOk  = validos.test(path.extname(file.originalname).toLowerCase());
    if (mimeOk && extOk) return cb(null, true);
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
  }
});

// ============================================
// RUTAS ESTÁTICAS 
// ============================================
router.get('/test',                  ctrl.probar);
router.get('/buscar',                ctrl.buscar);
router.get('/estadisticas',          ctrl.obtenerEstadisticas);
router.get('/rubros',                ctrl.obtenerRubros);
router.get('/deshabilitados',        ctrl.obtenerDeshabilitados);
router.get('/deshabilitados/count',  ctrl.contarDeshabilitados);
router.post('/despojar-puesto',      ctrl.despojarPuesto);

// ============================================
// RUTAS CON PARÁMETRO /:id
// ============================================
router.get('/',  ctrl.obtenerTodos);

// normalizeAfiliado se aplica SOLO en crear y actualizar
router.post('/',     normalizeAfiliado, ctrl.crear);

router.get('/:id',              ctrl.obtenerPorId);
router.put('/:id',              normalizeAfiliado, ctrl.actualizar);
router.put('/:id/deshabilitar', ctrl.deshabilitar);
router.put('/:id/rehabilitar',  ctrl.rehabilitar);

router.get('/:id/puestos',         ctrl.obtenerPuestos);
router.post('/:id/asignar-puesto',normalizeAfiliado,ctrl.asignarPuesto);

router.get('/:id/pdf-data',        ctrl.obtenerDatosPdf);

router.post('/:id/upload-perfil', upload.single('foto'), ctrl.subirFotoPerfil);

module.exports = router;