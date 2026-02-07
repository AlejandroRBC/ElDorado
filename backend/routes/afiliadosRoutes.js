const express = require('express');
const router = express.Router();
const {
  listaAfiliados,
  buscarAfiliadoPorCI,
  buscarAfiliadoPorId,
  crearAfiliado,
  actualizarAfiliado,
  deshabilitarAfiliado,
  buscarAfiliados,         // NUEVO
  obtenerActivos,         // NUEVO
  obtenerPuestosAfiliado, // NUEVO
  buscarAvanzado          // NUEVO
} = require('../controllers/afiliadosController');

// Rutas existentes
router.get('/', listaAfiliados);
router.get('/ci/:ci', buscarAfiliadoPorCI);
router.get('/:id', buscarAfiliadoPorId);
router.post('/', crearAfiliado);
router.put('/:id', actualizarAfiliado);
router.delete('/:id/deshabilitar', deshabilitarAfiliado);

// Nuevas rutas para búsqueda
router.get('/buscar', buscarAfiliados);            // GET /api/afiliados/buscar?q=juan
router.get('/activos', obtenerActivos);            // GET /api/afiliados/activos
router.get('/:id/puestos', obtenerPuestosAfiliado); // GET /api/afiliados/1/puestos
router.get('/buscar-avanzado', buscarAvanzado);    // GET /api/afiliados/buscar-avanzado?nombre=juan&ci=123

module.exports = router;