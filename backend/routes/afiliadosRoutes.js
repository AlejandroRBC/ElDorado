const express = require('express');
const router = express.Router();
const afiliadosController = require('../controllers/afiliadosController');

// Ruta de prueba
router.get('/test', afiliadosController.test);

// Obtener todos los afiliados
router.get('/', afiliadosController.getAll);

// Obtener afiliado por ID
router.get('/:id', afiliadosController.getById);

// Crear nuevo afiliado
router.post('/', afiliadosController.create);

module.exports = router;