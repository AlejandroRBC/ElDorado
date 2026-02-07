const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/afiliadosController');

router.get('/', ctrl.listaAfiliados);
router.get('/ci/:ci', ctrl.buscarAfiliadoPorCI);
router.get('/:id', ctrl.buscarAfiliadoPorId);

router.post('/', ctrl.crearAfiliado);
router.put('/:id', ctrl.actualizarAfiliado);
router.delete('/:id', ctrl.deshabilitarAfiliado);

module.exports = router;
