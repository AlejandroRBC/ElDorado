const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/puestosController');

router.get('/', ctrl.listarPuestos);
router.get('/con-afiliado', ctrl.listarPuestosConAfiliado);
router.get('/:id', ctrl.obtenerPuesto);

router.post('/', ctrl.crearPuesto);
router.put('/:id', ctrl.actualizarPuesto);
router.delete('/:id', ctrl.eliminarPuesto);

module.exports = router;
