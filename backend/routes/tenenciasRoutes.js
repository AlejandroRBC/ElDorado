const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/tenenciasController');

router.post('/asignar', ctrl.asignarPuesto);
router.post('/traspaso', ctrl.traspasarPuesto);
router.post('/abandono', ctrl.abandonoPuesto);
router.post('/despojo', ctrl.despojarPuesto);

router.get('/historial/:id', ctrl.historialPuesto);
router.get('/activa/:id', ctrl.tenenciaActiva);

module.exports = router;
