const express = require('express');
const router = express.Router();
const { loginMiddleware } = require('../middleware/login');
const ctrl = require('../controllers/directorioController');

// ── Todas las rutas requieren sesión activa ──
router.use(loginMiddleware);

// ============================================
// CATÁLOGOS
// ============================================
router.get('/secretarias',         ctrl.obtenerSecretarias);
router.get('/gestiones',           ctrl.obtenerGestiones);
router.get('/gestiones/activa',    ctrl.obtenerGestionActiva);
router.post('/gestiones', ctrl.crearGestion);


// ============================================
// DIRECTORIO
// ============================================
router.get('/gestion/:idGestion',  ctrl.obtenerPorGestion);
router.get('/:id',                 ctrl.obtenerPorId);
router.post('/',                   ctrl.asignarCargo);
router.patch('/:id/cerrar',        ctrl.cerrarCargo);
router.patch('/:id/reemplazar',    ctrl.reemplazarCargo);

// ============================================
// HISTORIAL DE DIRECTORIO
// ============================================
router.get('/historial/completo',               ctrl.obtenerHistorialCompleto);
router.get('/historial/afiliado/:idAfiliado',   ctrl.obtenerHistorialAfiliado);

// ============================================
// HISTORIAL DE AFILIADO (datos personales)
// ============================================
router.get('/historial-afiliado/:idAfiliado',   ctrl.obtenerHistorialAfiliacion);

module.exports = router;