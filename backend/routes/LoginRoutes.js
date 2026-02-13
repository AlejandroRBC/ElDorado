const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/LoginController');

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// Login de usuario
router.post('/login', LoginController.login);

// Verificar si hay sesión activa
router.get('/verificarSesion', LoginController.verificarSesion);

// Cerrar sesión
router.post('/logout', LoginController.logout);

module.exports = router;