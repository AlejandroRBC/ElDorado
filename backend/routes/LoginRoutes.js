const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/LoginController');

// Definimos que el método POST en /login lo maneja authController.login
router.post('/login', LoginController.login);


module.exports = router;