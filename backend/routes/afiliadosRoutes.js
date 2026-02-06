const express = require('express');
const router = express.Router();
const afiliadosController = require('../controllers/afiliadosController');

router.get('/listar', afiliadosController.listaAfiliados);
router.get('/buscar/:ci', afiliadosController.buscarAfiliadoPorCI);

module.exports = router;