const db = require('../config/db'); 
const bcrypt = require('bcryptjs');

const login = (req, res) => {
    const { usuario, password } = req.body;

    // ===============================
    // VALIDACIONES COMPLETAS EN BACKEND
    // ===============================
    
    // 1. Validar que existan los campos
    if (!usuario || !password) {
        return res.status(400).json({
            success: false,
            message: "Usuario y contraseña son requeridos"
        });
    }

    const usuarioLimpio = usuario.trim();

    // 2. Validar longitud mínima de usuario
    if (usuarioLimpio.length < 3) {
        return res.status(400).json({
            success: false,
            message: "El usuario debe tener al menos 3 caracteres"
        });
    }

    // 3. Validar longitud máxima de usuario
    if (usuarioLimpio.length > 50) {
        return res.status(400).json({
            success: false,
            message: "El usuario no puede exceder 50 caracteres"
        });
    }

    // 4. Validar caracteres permitidos en usuario
    const usuarioRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usuarioRegex.test(usuarioLimpio)) {
        return res.status(400).json({
            success: false,
            message: "Solo se permiten letras, números, puntos y guiones en el usuario"
        });
    }

    // 5. Validar longitud mínima de contraseña
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "La contraseña debe tener al menos 6 caracteres"
        });
    }

    // 6. Validar longitud máxima de contraseña
    if (password.length > 100) {
        return res.status(400).json({
            success: false,
            message: "La contraseña es demasiado larga"
        });
    }

    // 7. Validar formato del usuario (no empezar/terminar con . o -)
    if (usuarioLimpio.startsWith('.') || usuarioLimpio.startsWith('-') || 
        usuarioLimpio.endsWith('.') || usuarioLimpio.endsWith('-')) {
        return res.status(400).json({
            success: false,
            message: "El usuario no puede empezar o terminar con punto o guión"
        });
    }

    // 8. Validar caracteres consecutivos
    if (usuarioLimpio.includes('..') || usuarioLimpio.includes('--') || 
        usuarioLimpio.includes('.-') || usuarioLimpio.includes('-.')) {
        return res.status(400).json({
            success: false,
            message: "El usuario no puede tener puntos o guiones consecutivos"
        });
    }

    // ===============================
    // CONSULTA A LA BASE DE DATOS
    // ===============================
    const query = `
        SELECT 
            id_usuario,
            nom_usuario,
            password,
            rol,
            es_vigente,
            fecha_fin_usuario
        FROM usuarios
        WHERE nom_usuario = ?
    `;

    db.get(query, [usuarioLimpio], (err, user) => {
        if (err) {
            console.error("Error en BD:", err.message);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }

        // 9. Validar si el usuario existe
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // 10. Validar si el usuario está activo
        if (user.es_vigente !== 1) {
            return res.status(401).json({
                success: false,
                message: "Usuario inactivo. Contacte al administrador."
            });
        }

        // 11. Validar fecha de expiración
        if (user.fecha_fin_usuario) {
            const fechaFin = new Date(user.fecha_fin_usuario);
            const hoy = new Date();
            
            if (fechaFin < hoy) {
                // Actualizar estado a inactivo
                db.run(`UPDATE usuarios SET es_vigente = 0 WHERE id_usuario = ?`, 
                    [user.id_usuario]);
                
                return res.status(401).json({
                    success: false,
                    message: "Su cuenta ha sido deshabilitada . Contacte al administrador."
                });
            }
        }

        // 12. Validar contraseña
        bcrypt.compare(password, user.password, (err, passwordValida) => {
            if (err) {
                console.error("Error bcrypt:", err);
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

            // ===============================
            // LOGIN EXITOSO
            // ===============================
            return res.json({
                success: true,
                message: `Acceso concedido. Bienvenido ${user.nom_usuario}`,
                user: {
                    id_usuario: user.id_usuario,
                    usuario: user.nom_usuario,
                    rol: user.rol
                }
            });
        });
    });
};

const login = (req, res) => {
    // 1. Extraemos 'usuario' que viene del frontend
    const { usuario, password } = req.body;
    try {
        const sql = `
            SELECT u.*, a.nombre, a.paterno 
            FROM usuarios u
            JOIN afiliado a ON u.id_afiliado = a.id_afiliado
            WHERE u.nom_usuario = ? AND u.password = ? AND u.es_Vigente = 1
        `;
        const user = db.prepare(sql).get(usuario, password);
        
        if (user) {
            registrarAuditoria({
                nom_usuario_esclavo: user.nom_usuario,
                nom_afiliado_esclavo: `${user.nombre} ${user.paterno}`,
                rol: user.rol,
                id_afiliado: user.id_afiliado,
                motivo: "Inicio de sesión",
                nom_usuario_master: "SISTEMA",
                nom_afiliado_master: "AUTOGESTIÓN"
            });

            
            delete user.password;
            res.status(200).json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    } catch (error) {
        console.error("Error en login:", error.message);
        res.status(500).json({ success: false, message: "Error interno en el servidor" });
    }
};

module.exports = { login };