// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================

/**
 * Verifica que el usuario esté autenticado
 */
const loginMiddleware = (req, res, next) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado. Sesión expirada o no iniciada.'
        });
    }
    
    req.user = req.session.usuario;
    next();
};

/**
 * Verifica que el usuario sea administrador
 */
const adminMiddleware = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};

module.exports = { loginMiddleware, adminMiddleware };