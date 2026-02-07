const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');


const authRoutes = require('./routes/authRoutes');
const afiliadosRoutes = require('./routes/afiliadosRoutes');



const app = express();
const PORT = 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads', 'perfiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Carpeta uploads/perfiles creada');
}
// Servir archivos estáticos (fotos de perfil)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Servir archivos estáticos del frontend (para desarrollo)
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));


// --- REDIRECCIÓN DE RUTAS ---
// Todas las rutas dentro de authRoutes tendrán el prefijo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/afiliados', afiliadosRoutes);



// Ruta principal
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
  
  // Manejo de rutas no encontradas
  app.use((req, res) => {
    res.status(404).json({
      error: 'Ruta no encontrada',
      ruta: req.url
    });
  });
  

app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 Servidor ElDorado: http://localhost:${PORT}`);
    console.log(`📡 Rutas cargadas: /api/auth/login`);
    console.log(`-------------------------------------------`);
});