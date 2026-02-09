//backend/server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const puestosRoutes = require('./routes/puestosRoutes');
const afiliadosRoutes = require('./routes/afiliadosRoutes');
const tenenciaRoutes = require('./routes/tenenciasRoutes');

const app = express();
const PORT = 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// --- REDIRECCIÓN DE RUTAS ---
// Todas las rutas dentro de authRoutes tendrán el prefijo /api/auth
app.use('/api/auth', authRoutes);

app.use('/api/puestos',puestosRoutes);
app.use('/api/afiliados',afiliadosRoutes);
app.use('/api/tenencias',tenenciaRoutes);

app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 Servidor ElDorado: http://localhost:${PORT}`);
    console.log(`📡 Rutas cargadas: /api/auth/login`);
    console.log(`-------------------------------------------`);
});