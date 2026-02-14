const db = require('../config/db'); 
const bcrypt = require('bcryptjs');

// ============================================
// LOGIN
// ============================================
const login = (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({
            success: false,
            message: "Usuario y contraseña son requeridos"
        });
    }

    const usuarioLimpio = usuario.trim();

    if (usuarioLimpio.length < 3) {
        return res.status(400).json({
            success: false,
            message: "El usuario debe tener al menos 3 caracteres"
        });
    }

    const query = `
        SELECT 
            u.id_usuario,
            u.nom_usuario,
            u.password,
            u.rol,
            u.es_vigente,
            u.fecha_fin_usuario,
            a.nombre || ' ' || a.paterno AS nom_afiliado 
        FROM usuario u
        LEFT JOIN afiliado a ON u.id_afiliado = a.id_afiliado  
        WHERE u.nom_usuario = ?
    `;

    db.get(query, [usuarioLimpio], (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        if (user.es_vigente !== 1) {
            return res.status(401).json({
                success: false,
                message: "Usuario inactivo. Contacte al administrador."
            });
        }

        bcrypt.compare(password, user.password, (err, passwordValida) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error interno del servidor"
                });
            }

            if (!passwordValida) {
                return res.status(401).json({
                    success: false,
                    message: "Contraseña incorrecta"
                });
            }

            req.session.usuario = {
                id_usuario: user.id_usuario,
                nom_usuario: user.nom_usuario,
                nom_afiliado: user.nom_afiliado || null,
                rol: user.rol
            };

            db.run(
                `INSERT OR REPLACE INTO usuario_sesion 
                 (id, id_usuario_master, nom_usuario_master, nom_afiliado_master)
                 VALUES (1, ?, ?, ?)`,
                [user.id_usuario, user.nom_usuario, user.nom_afiliado || 'SISTEMA']
            );

            return res.json({
                success: true,
                message: `Acceso concedido. Bienvenido ${user.nom_usuario}`,
                user: {
                    id_usuario: user.id_usuario,
                    usuario: user.nom_usuario,
                    nom_afiliado: user.nom_afiliado,
                    rol: user.rol
                }
            });
        });
    });
};

// ============================================
// VERIFICAR SESIÓN
// ============================================
const verificarSesion = (req, res) => {
    if (req.session && req.session.usuario) {
        return res.json({
            success: true,
            user: req.session.usuario
        });
    }
    
    return res.status(401).json({
        success: false,
        message: "No hay sesión activa"
    });
};

// ============================================
// LOGOUT
// ============================================
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error al cerrar sesión"
            });
        }
        
        res.clearCookie('eldorado.sid');
        res.json({
            success: true,
            message: "Sesión cerrada correctamente"
        });
    });
};

module.exports = { 
    login, 
    verificarSesion, 
    logout           
};