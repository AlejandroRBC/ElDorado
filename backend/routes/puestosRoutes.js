const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/puestosController');

// ==========================================
// 1. RUTAS DE CONSULTA (GET) - Estáticas primero
// ==========================================

// Obtener puestos disponibles (sin dueño)
router.get('/disponibles', ctrl.listarPuestosDisponibles);

// Ruta adicional del branch 'Puestosbd' (puedes usar / o /listar)
router.get('/listar', ctrl.listar); 

// Obtener información específica para un traspaso
router.get('/info-traspaso/:id', ctrl.infoTraspaso);

// filtros para el modulo de afiliados
router.get('/filtros', ctrl.obtenerFiltros);

// Realizar el proceso de traspaso de un puesto
router.post('/traspasar', ctrl.traspasar);

// ==========================================
// 4. RUTAS DE ACTUALIZACIÓN Y ELIMINACIÓN (PUT/DELETE)
// ==========================================

// Actualizar datos del puesto (se unifican los nombres del controlador) 
// tambien lo ando usando en afiliados, cuidado XD
router.put('/:id', ctrl.actualizarPuesto || ctrl.actualizar);

module.exports = router;