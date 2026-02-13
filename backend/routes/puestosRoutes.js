const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/puestosController');

// ==========================================
// 1. RUTAS DE CONSULTA (GET) - Estáticas primero
// ==========================================

// Obtener puestos disponibles (sin dueño)
router.get('/disponibles', ctrl.listarPuestosDisponibles);

// Obtener puestos que ya tienen un afiliado asignado
router.get('/con-afiliado', ctrl.listarPuestosConAfiliado);

// Ruta adicional del branch 'Puestosbd' (puedes usar / o /listar)
router.get('/listar', ctrl.listarPuestos || ctrl.listar); 

// Obtener información específica para un traspaso
router.get('/info-traspaso/:id', ctrl.infoTraspaso);

// ==========================================
// 2. RUTAS CON PARÁMETROS DINÁMICOS (GET)
// ==========================================

// Listar todos o por ID (Esta debe ir después de /disponibles)
router.get('/', ctrl.listarPuestos);
router.get('/:id', ctrl.obtenerPuesto);

// ==========================================
// 3. RUTAS DE CREACIÓN Y ACCIONES (POST)
// ==========================================

// Crear un nuevo puesto
router.post('/', ctrl.crearPuesto);

// Realizar el proceso de traspaso de un puesto
router.post('/traspasar', ctrl.traspasar);

// ==========================================
// 4. RUTAS DE ACTUALIZACIÓN Y ELIMINACIÓN (PUT/DELETE)
// ==========================================

// Actualizar datos del puesto (se unifican los nombres del controlador)
router.put('/:id', ctrl.actualizarPuesto || ctrl.actualizar);

// Eliminar un puesto
router.delete('/:id', ctrl.eliminarPuesto);

module.exports = router;