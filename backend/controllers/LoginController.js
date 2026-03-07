// backend/controllers/LoginController.js

// ============================================
// CONTROLADOR — AUTENTICACIÓN
// ============================================

const bcrypt = require('bcryptjs');
const { buscarUsuarioPorNombre, guardarSesionMaster } = require('../Models/LoginModel');

/**
 * Autentica al usuario validando credenciales contra la BD.
 * Verifica que el usuario exista, esté vigente y la contraseña sea correcta.
 * Si todo es válido guarda la sesión y responde con los datos del usuario.
 */
const login = (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ success: false, message: "Usuario y contraseña son requeridos" });
  }

  const usuarioLimpio = usuario.trim();

  if (usuarioLimpio.length < 3) {
    return res.status(400).json({ success: false, message: "El usuario debe tener al menos 3 caracteres" });
  }

  buscarUsuarioPorNombre(usuarioLimpio, (err, user) => {
    if (err) {
      console.error('Error en db.get:', err);
      return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    if (user.es_vigente !== 1) {
      return res.status(401).json({ success: false, message: "Usuario inactivo. Contacte al administrador." });
    }

    bcrypt.compare(password, user.password, (err, passwordValida) => {
      if (err) {
        console.error('Error en bcrypt:', err);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
      }

      if (!passwordValida) {
        return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
      }

      // ── Guardar sesión ──
      req.session.usuario = {
        id_usuario:   user.id_usuario,
        nom_usuario:  user.nom_usuario,
        nom_afiliado: user.nom_afiliado || null,
        rol:          user.rol
      };

      guardarSesionMaster(user.id_usuario, user.nom_usuario, user.nom_afiliado);

      return res.json({
        success: true,
        message: `Acceso concedido. Bienvenido ${user.nom_usuario}`,
        user: {
          id_usuario:   user.id_usuario,
          nom_usuario:  user.nom_usuario,
          nom_afiliado: user.nom_afiliado,
          rol:          user.rol
        }
      });
    });
  });
};

/**
 * Verifica si hay una sesión activa y retorna los datos del usuario.
 */
const verificarSesion = (req, res) => {
  if (req.session?.usuario) {
    return res.json({ success: true, user: req.session.usuario });
  }
  return res.status(401).json({ success: false, message: "No hay sesión activa" });
};

/**
 * Destruye la sesión activa y limpia la cookie del cliente.
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error al cerrar sesión" });
    }
    res.clearCookie('eldorado.sid');
    res.json({ success: true, message: "Sesión cerrada correctamente" });
  });
};

module.exports = { login, verificarSesion, logout };