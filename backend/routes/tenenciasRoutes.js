const express = require('express');
const router = express.Router();
const {
  traspasarPuesto,
  historialCompleto,   
  obtenerInfoTraspaso      
} = require('../controllers/tenenciasController');

// Rutas existentes
router.post('/traspasar', traspasarPuesto);
router.get('/historial-completo/:id_puesto', historialCompleto);

// Nuevas rutas para traspaso mejorado
router.get('/info-traspaso/:idPuesto', obtenerInfoTraspaso);

module.exports = router;