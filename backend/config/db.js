const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt'); 

const dbPath = path.join(__dirname, '../../data/elDorado.db');
const dataDir = path.join(__dirname, '../../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a SQLite:', err.message);
  } else {
    db.run("PRAGMA foreign_keys = ON");
    db.run("PRAGMA journal_mode = WAL");
    crearTablas();
  }
});

// ============================================
// CREACIÓN DE TABLAS
// ============================================
function crearTablas() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS afiliado (
      id_afiliado INTEGER PRIMARY KEY AUTOINCREMENT,
      ci VARCHAR(20) NOT NULL UNIQUE,
      extension VARCHAR(3) DEFAULT 'LP',
      nombre VARCHAR(100) NOT NULL,
      paterno VARCHAR(100) NOT NULL,
      materno VARCHAR(100) NOT NULL,
      sexo VARCHAR(1) CHECK(sexo IN ('M', 'F')),
      fecNac DATE,
      telefono VARCHAR(20),
      ocupacion VARCHAR(100),
      direccion TEXT,
      url_perfil VARCHAR(255) DEFAULT '/assets/perfiles/sinPerfil.png',
      fecha_afiliacion DATE DEFAULT CURRENT_DATE,
      es_habilitado BOOLEAN DEFAULT 1
    )`,

    `CREATE TABLE IF NOT EXISTS puesto (
      id_puesto INTEGER PRIMARY KEY AUTOINCREMENT,
      fila VARCHAR(1) NOT NULL CHECK(fila IN ('A', 'B', 'C', 'D', 'E')),
      cuadra VARCHAR(50) NOT NULL,
      nroPuesto INTEGER NOT NULL,
      ancho INTEGER,
      largo INTEGER,
      tiene_patente BOOLEAN DEFAULT 0,
      rubro TEXT,
      disponible BOOLEAN DEFAULT 1,
      UNIQUE(fila, cuadra, nroPuesto)
    )`,

    `CREATE TABLE IF NOT EXISTS tenencia_puesto (
      id_tenencia INTEGER PRIMARY KEY AUTOINCREMENT,
      id_afiliado INTEGER,
      id_puesto INTEGER,
      fecha_ini DATE DEFAULT CURRENT_DATE,
      fecha_fin DATE,
      razon VARCHAR(50),
      FOREIGN KEY (id_afiliado) REFERENCES afiliado(id_afiliado),
      FOREIGN KEY (id_puesto) REFERENCES puesto(id_puesto)
    )`,

    `CREATE TABLE IF NOT EXISTS usuario (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      id_afiliado INTEGER,
      rol VARCHAR(50) NOT NULL,
      nom_usuario VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fecha_ini_usuario DATE DEFAULT CURRENT_DATE,
      fecha_fin_usuario DATE,
      es_vigente BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_afiliado) REFERENCES afiliado(id_afiliado)
    )`,

    `CREATE TABLE IF NOT EXISTS usuario_sesion (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      id_usuario_master INTEGER,
      nom_usuario_master TEXT,
      nom_afiliado_master TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS historial_usuario (
      id_historial_usu INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER,
      nom_usuario_esclavo TEXT,
      nom_afiliado_esclavo TEXT,
      rol TEXT,
      fecha DATE DEFAULT CURRENT_DATE,
      hora TIME DEFAULT (time('now','localtime')),
      motivo TEXT,
      nom_usuario_master TEXT,
      nom_afiliado_master TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS historial_puestos (
      id_historial_puesto INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo VARCHAR(50),
      fecha DATE DEFAULT CURRENT_DATE,
      hora TIME DEFAULT (time('now','localtime')),
      afiliado VARCHAR(255),
      motivo TEXT,
      usuario VARCHAR(255),
      id_tenencia INTEGER,
      id_puesto INTEGER
    )`
  ];

  let pendientes = queries.length;
  queries.forEach(sql => {
    db.run(sql, function(err) {
      if (err) console.error('❌ Error creando tabla:', err.message);
      pendientes--;
      if (pendientes === 0) {
        afterTablesCreated();
      }
    });
  });
}

// ============================================
// POST-CREACIÓN DE TABLAS
// ============================================
function afterTablesCreated() {
  db.run(
    `INSERT OR IGNORE INTO usuario_sesion (id, nom_usuario_master, nom_afiliado_master)
     VALUES (1, 'sistema', 'sistema')`,
    (err) => {
      if (err) console.error('❌ Error insertando usuario_sesion:', err.message);
    }
  );

  crearIndices();
  const { crearTriggersPuestos } = require('./triggers/triggers-puestos');
  crearTriggersPuestos();
  require('./triggers/triggers-usuario');
  require('./triggers/triggers-puestos');
  insertarDatosEjemplo();
}

// ============================================
// CREACIÓN DE ÍNDICES
// ============================================
function crearIndices() {
  const indices = [
    `CREATE INDEX IF NOT EXISTS idx_usuario_nom_usuario ON usuario(nom_usuario)`,
    `CREATE INDEX IF NOT EXISTS idx_usuario_es_vigente ON usuario(es_vigente)`,
    `CREATE INDEX IF NOT EXISTS idx_afiliado_ci ON afiliado(ci)`,
    `CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_usuario(fecha)`,
    `CREATE INDEX IF NOT EXISTS idx_tenencia_fechas ON tenencia_puesto(fecha_ini, fecha_fin)`,
    `CREATE INDEX IF NOT EXISTS idx_historial_puestos_fecha ON historial_puestos(fecha)`
  ];

  indices.forEach(sql => {
    db.run(sql, (err) => {
      if (err) console.error('❌ Error creando índice:', err.message);
    });
  });
}

// ============================================
// DATOS DE EJEMPLO
// ============================================
function insertarDatosEjemplo() {
  db.get(`SELECT COUNT(*) AS count FROM afiliado`, (err, row) => {
    if (err) return;
    
    if (row && row.count === 0) {
      const afiliados = [
        ['1234567','LP','Juan','Pérez','García','M','1985-05-15','76543210','Comerciante','Av Principal'],
        ['7654321','LP','María','García','Rodríguez','F','1990-08-22','71234567','Servicios','Calle Secundaria'],
        ['9876543','LP','Carlos','López','Mendoza','M','1978-03-10','70123456','Industrial','Av Industrial']
      ];

      let insertados = 0;
      afiliados.forEach(a => {
        db.run(`
          INSERT INTO afiliado 
          (ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion)
          VALUES (?,?,?,?,?,?,?,?,?,?)
        `, a, function(err) {
          if (!err) insertados++;
          if (insertados === afiliados.length) {
            insertarPuestosEjemplo();
            insertarTenenciasEjemplo();
            crearUsuarioAdmin();
          }
        });
      });
      

    } else {
      crearUsuarioAdmin();
    }
    
  });
}

// ============================================
// DATOS DE EJEMPLO PARA PUESTOS Y TENENCIAS
// ============================================
function insertarPuestosEjemplo() {
  db.get(`SELECT COUNT(*) AS count FROM puesto`, (err, row) => {
    if (err) return;

    if (row && row.count === 0) {
      const puestos = [
        ['A','1',1,3,3,1,'Frutas y Verduras',1],
        ['A','1',2,3,3,0,'Carnicería',1],
        ['B','2',3,4,4,1,'Ropa',1],
        ['C','3',4,2,2,0,'Electrodomésticos',1]
      ];

      let insertados = 0;
      puestos.forEach((p, index) => {
        db.run(`
          INSERT INTO puesto
          (fila, cuadra, nroPuesto, ancho, largo, tiene_patente, rubro, disponible)
          VALUES (?,?,?,?,?,?,?,?)
        `, p, function(err) {
          if (!err) insertados++;

          // Cuando se inserten todos los puestos, agregamos las tenencias
          if (insertados === puestos.length) {
            insertarTenenciasEjemplo();
          }
        });
      });
    } else {
      insertarTenenciasEjemplo();
    }
  });
}

// ============================================
// DATOS DE EJEMPLO PARA TENENCIAS
// ============================================
function insertarTenenciasEjemplo() {
  db.get(`SELECT COUNT(*) AS count FROM tenencia_puesto`, (err, row) => {
    if (err) return;

    if (row && row.count === 0) {
      const tenencias = [
        [1, 1, null, null, 'ASIGNADO'], // Juan → Puesto 1
        [2, 2, null, null, 'ASIGNADO'], // María → Puesto 2
        [3, 3, null, null, 'ASIGNADO']  // Carlos → Puesto 3
      ];

      tenencias.forEach(t => {
        const [id_afiliado, id_puesto, fecha_ini, fecha_fin, razon] = t;
        db.run(`
          INSERT INTO tenencia_puesto
          (id_afiliado, id_puesto, fecha_ini, fecha_fin, razon)
          VALUES (?, ?, COALESCE(?, CURRENT_DATE), ?, ?)
        `, [id_afiliado, id_puesto, fecha_ini, fecha_fin, razon]);
      });
    }
  });
}






// ============================================
// USUARIO ADMIN POR DEFECTO
// ============================================
function crearUsuarioAdmin() {
  db.get(`SELECT COUNT(*) AS count FROM usuario WHERE id_usuario = 1`, (err, row) => {
    if (err) return;
    
    if (row && row.count === 0) {
      const hash = bcrypt.hashSync('123456', 10);
      db.run(`
        INSERT OR IGNORE INTO usuario
        (id_usuario, id_afiliado, rol, nom_usuario, password, es_vigente)
        VALUES (1, 1, 'superadmin', 'admin', ?, 1)
      `, [hash]);
    }
  });
}

module.exports = db;