const express = require('express');
const router = express.Router();
const tenenciasController = require('../controllers/tenenciasController');

router.get('/listar', tenenciasController.listarTenencias);

module.exports = router;

