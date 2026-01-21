const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definimos que el método POST en /login lo maneja authController.login
router.post('/login', authController.login);

module.exports = router;