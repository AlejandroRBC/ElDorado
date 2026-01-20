const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

// Middleware para entender JSON
app.use(express.json());

// --- CONFIGURACIÓN DE SQLITE ---
// Esto crea el archivo de la base de datos en la carpeta /data si no existe
const dbPath = path.join(__dirname, '../data/eldorado.db');
const db = new Database(dbPath);

// Creamos una tabla de prueba si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT
  )
`).run();

// --- RUTAS ---
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "¡Hola desde el Backend de ElDorado!" });
});

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});