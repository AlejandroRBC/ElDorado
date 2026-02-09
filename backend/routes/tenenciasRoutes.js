const express = require('express');
const router = express.Router();
const {
  asignarPuesto,
  traspasarPuesto,
  abandonoPuesto,
  despojarPuesto,
  historialPuesto,
  tenenciaActiva,
  historialCompleto,
  traspasoMultiple,        // NUEVO
  obtenerInfoTraspaso      // NUEVO
} = require('../controllers/tenenciasController');

// Rutas existentes
router.post('/asignar', asignarPuesto);
router.post('/traspasar', traspasarPuesto);
router.post('/abandonar', abandonoPuesto);
router.post('/despojar', despojarPuesto);
router.get('/historial/:id', historialPuesto);
router.get('/activa/:id', tenenciaActiva);
router.get('/historial-completo/:id_puesto', historialCompleto);

// Nuevas rutas para traspaso mejorado
router.post('/traspaso-multiple', traspasoMultiple);
router.get('/info-traspaso/:idPuesto', obtenerInfoTraspaso);

module.exports = router;