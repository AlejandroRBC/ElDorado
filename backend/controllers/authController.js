const db = require('../config/db');

const registrarAuditoria = (datos) => {
    const { 
        nom_usuario_esclavo, nom_afiliado_esclavo, rol, 
        id_afiliado, motivo, nom_usuario_master, nom_afiliado_master 
    } = datos;

    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toLocaleTimeString('es-BO', { hour12: false });

    // IMPORTANTE: Asegúrate de crear esta tabla en tu db.js o esto dará error 500
    const sql = `
        INSERT INTO historial_usuarios (
            nom_usuario_esclavo, nom_afiliado_esclavo, rol, id_afiliado, 
            fecha, hora, motivo, nom_usuario_master, nom_afiliado_master
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        // Usamos un try/catch interno para que si falla la auditoría, 
        // el usuario IGUAL pueda logearse.
        db.prepare(sql).run(
            nom_usuario_esclavo, nom_afiliado_esclavo, rol, id_afiliado, 
            fecha, hora, motivo, nom_usuario_master, nom_afiliado_master
        );
    } catch (err) {
        console.error("⚠️ Nota: No se pudo registrar auditoría (¿Falta la tabla?):", err.message);
    }
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