const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const { loginMiddleware } = require('../middleware/login');

// ============================================
// RUTAS DE USUARIO
// ============================================

// Historial de cambios (con filtros opcionales)
router.get('/historial', loginMiddleware, UsuarioController.listarHistorialUsuario);

// Obtener afiliados para select (buscador)
router.get('/afiliados/select', loginMiddleware, UsuarioController.obtenerAfiliadosParaSelect);

// Obtener afiliado por ID
router.get('/afiliados/:id', loginMiddleware, UsuarioController.obtenerAfiliadoPorId);

// Listar usuarios (con filtro ?estado=activo|inactivo|todos)
router.get('/', loginMiddleware, UsuarioController.listarUsuarios);

// Obtener usuario por ID
router.get('/:id', loginMiddleware, UsuarioController.obtenerUsuarioPorId);

// Crear usuario
router.post('/', loginMiddleware, UsuarioController.crearUsuario);

// Actualizar usuario
router.put('/:id', loginMiddleware, UsuarioController.actualizarUsuario);

// Desactivar usuario
router.patch('/:id/desactivar', loginMiddleware, UsuarioController.desactivarUsuario);

// Reactivar usuario
router.patch('/:id/reactivar', loginMiddleware, UsuarioController.reactivarUsuario);

module.exports = router;