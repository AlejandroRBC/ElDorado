// routes/historialRoutes.js

// ============================================
// RUTAS — HISTORIAL DE PUESTOS
// ============================================

const express = require('express');
const router  = express.Router();
const { obtenerHistorialPuesto } = require('../controllers/historialController');

/**
 * GET /historial/:idPuesto
 * Obtiene el historial de asignaciones de un puesto específico.
 */
router.get('/historial/:idPuesto', obtenerHistorialPuesto);

module.exports = router;