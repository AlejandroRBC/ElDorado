const express = require('express');
const router = express.Router();

const puestosController = require('../controllers/puestosController');

router.get('/listar', puestosController.listar);

router.get('/info-traspaso/:id', puestosController.infoTraspaso);

router.post('/traspasar', puestosController.traspasar);

router.put('/:id', puestosController.actualizar);


module.exports = router;
