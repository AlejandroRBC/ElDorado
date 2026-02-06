const express = require('express');
const router = express.Router();
const puestoController = require('../controllers/puestosController');

router.get('/listar', puestoController.listaPuestos);

module.exports=router;