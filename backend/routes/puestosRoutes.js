const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/puestosController');
const { normalizePuesto } = require('../middleware/normalizePuesto');

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

//normalizePuesto se aplica al actualizar (rubro, fila, cuadra → MAYÚSCULAS)
router.put('/:id', normalizePuesto, ctrl.actualizarPuesto || ctrl.actualizar);

module.exports = router;