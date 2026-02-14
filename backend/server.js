const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const UsuarioRoutes = require('./routes/UsuarioRoutes');
const LoginRoutes = require('./routes/LoginRoutes');
const puestosRoutes = require('./routes/puestosRoutes');
const afiliadosRoutes = require('./routes/afiliadosRoutes');
const historialRoutes = require('./routes/historialRoutes');


const app = express();
const PORT = 3000;

// ============================================
// CONFIGURACIÓN CORS
// ============================================
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CONFIGURACIÓN DE SESIÓN
// ============================================
app.use(session({
    name: 'eldorado.sid',
    secret: 'ElDorado2024-SecretKey-CambiarEnProduccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8,
        sameSite: 'lax'
    }
}));

// ============================================
// MIDDLEWARE DE USUARIO EN REQUEST
// ============================================
app.use((req, res, next) => {
    req.user = req.session.usuario || null;
    next();
});

// ============================================
// IMPORTAR BASE DE DATOS
// ============================================
const db = require('./config/db');

// ============================================
// CONFIGURACIÓN DE UPLOADS
// ============================================
const uploadsDir = path.join(__dirname, 'uploads', 'perfiles');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));

// ============================================
// RUTAS
// ============================================
app.use('/api/auth', LoginRoutes);
app.use('/api/afiliados', afiliadosRoutes);
app.use('/api/puestos', puestosRoutes);

app.use('/api/usuario', UsuarioRoutes);

app.use('/api', historialRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de ELDORADO',
        version: '1.0',
        rutas: {
            afiliados: '/api/afiliados',
            afiliadoPorId: '/api/afiliados/:id',
            test: '/api/afiliados/test'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        ruta: req.url
    });
});





// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 Servidor ElDorado: http://localhost:${PORT}`);
    console.log(`📡 Rutas cargadas: /api/auth/login`);
    console.log(`🍪 Sesiones: ACTIVADAS con express-session`);
    console.log(`-------------------------------------------`);
});