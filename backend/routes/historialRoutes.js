// routes/historialRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerHistorialPuesto } = require('../controllers/historialController');

router.get('/historial/:idPuesto', obtenerHistorialPuesto);

module.exports = router;
