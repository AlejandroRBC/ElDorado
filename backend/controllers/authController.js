const db = require('../config/db');

// Lógica de inicio de sesión
const login = (req, res) => {
    const { usuario, password } = req.body;

    try {
        // Hacemos la consulta a la base de datos
        const user = db.prepare('SELECT * FROM usuarios WHERE usuario = ? AND password = ?')
                       .get(usuario, password);

        if (user) {
            // Si el usuario existe, devolvemos éxito y datos no sensibles
            res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    rol: user.rol
                }
            });
        } else {
            // Si no coincide, error de credenciales
            res.status(401).json({ 
                success: false, 
                message: "Usuario o contraseña incorrectos" 
            });
        }
    } catch (error) {
        console.error("Error en Login:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor" 
        });
    }
};

module.exports = {
    login
};