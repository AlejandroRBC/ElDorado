const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/puestosController');

// ✅ 1. PRIMERO las rutas específicas (sin parámetros dinámicos)
router.get('/disponibles', ctrl.listarPuestosDisponibles);  // 👈 DEBE IR PRIMERO
router.get('/con-afiliado', ctrl.listarPuestosConAfiliado);

// ✅ 2. DESPUÉS las rutas con parámetros dinámicos
router.get('/', ctrl.listarPuestos);
router.get('/:id', ctrl.obtenerPuesto);

// ✅ 3. Rutas POST, PUT, DELETE
router.post('/', ctrl.crearPuesto);
router.put('/:id', ctrl.actualizarPuesto);
router.delete('/:id', ctrl.eliminarPuesto);

module.exports = router;