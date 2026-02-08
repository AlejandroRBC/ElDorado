const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta a la base de datos
const dbPath = path.join(__dirname, '../../data/elDorado.db');

// Asegurarnos que la carpeta data existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Conectar a SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a SQLite:', err.message);
  } else {
    console.log('✅ Conectado a SQLite en:', dbPath);
    crearTablas();
  }
});

// Función para crear tablas
function crearTablas() {
  // Tabla afiliado
  db.run(`
    CREATE TABLE IF NOT EXISTS afiliado (
      id_afiliado INTEGER PRIMARY KEY AUTOINCREMENT,
      ci VARCHAR(20) NOT NULL UNIQUE,
      extension VARCHAR(3) DEFAULT 'LP',
      nombre VARCHAR(100) NOT NULL,
      paterno VARCHAR(100) NOT NULL,
      materno VARCHAR(100),
      sexo VARCHAR(1) CHECK(sexo IN ('M', 'F')),
      fecNac DATE,
      telefono VARCHAR(20),
      ocupacion VARCHAR(100),
      direccion TEXT,
      url_perfil VARCHAR(255) DEFAULT '/assets/perfiles/sinPerfil.png',
      fecha_afiliacion DATE DEFAULT CURRENT_DATE,
      es_habilitado BOOLEAN DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla afiliado:', err.message);
    } else {
      console.log('✅ Tabla afiliado creada/verificada');
      
    }
  });

  // Tabla puesto
  db.run(`
    CREATE TABLE IF NOT EXISTS puesto (
      id_puesto INTEGER PRIMARY KEY AUTOINCREMENT,
      fila VARCHAR(1) NOT NULL CHECK(fila IN ('A', 'B', 'C', 'D', 'E')),
      cuadra VARCHAR(50) NOT NULL,
      nroPuesto INTEGER NOT NULL,
      ancho INTEGER,
      largo INTEGER,
      tiene_patente BOOLEAN DEFAULT 0,
      rubro TEXT,
      UNIQUE(fila, cuadra, nroPuesto)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla puesto:', err.message);
    } else {
      console.log('✅ Tabla puesto creada/verificada');
    }
  });

  // Tabla tenencia_puesto
  db.run(`
    CREATE TABLE IF NOT EXISTS tenencia_puesto (
      id_tenencia INTEGER PRIMARY KEY AUTOINCREMENT,
      id_afiliado INTEGER,
      id_puesto INTEGER,
      fecha_ini DATE DEFAULT CURRENT_DATE,
      fecha_fin DATE,
      razon VARCHAR(50),
      FOREIGN KEY (id_afiliado) REFERENCES afiliado(id_afiliado),
      FOREIGN KEY (id_puesto) REFERENCES puesto(id_puesto)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla tenencia_puesto:', err.message);
    } else {
      console.log('✅ Tabla tenencia_puesto creada/verificada');
    }
  });
}



module.exports = db;