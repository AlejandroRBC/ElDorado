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
        ['1234567','LP','Juan','Pérez','dummy','M','1985-05-15','76543210','Comerciante','Av Principal'],
        ['7654321','LP','María','García','dummy','F','1990-08-22','71234567','Servicios','Calle Secundaria'],
        ['9876543','LP','Carlos','López','dummy','M','1978-03-10','70123456','Industrial','Av Industrial']
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
            //insertarTenenciasEjemplo();
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
// DATOS DE EJEMPLO PARA PUESTOS 
// ============================================
function insertarPuestosEjemplo() {
  db.get(`SELECT COUNT(*) AS count FROM puesto`, (err, row) => {
    
    if (err) return;
      
    if (row && row.count === 0) {
      // --- DATOS DE CONFIGURACIÓN ---
      const pasosA = [1, 8, 11, 19, 47, 55, 60, 67, 91, 113, 117, 122, 126, 130, 131, 132, 136, 142, 153, 167, 169, 171, 172, 182, 185, 211, 224, 245, 252, 277, 279, 281, 293, 298];
      const pasosB = [20, 32, 37, 41, 73, 79, 83, 90, 97, 128, 139, 151, 157, 161, 164, 167, 170, 173, 178, 186, 214, 215, 216, 217, 221, 225, 234, 239, 240];

      // Lógica para determinar la cuadra en Fila A
      function obtenerCuadraA(n) {
          if (n >= 1 && n <= 68) return "Cuadra 1";
          if (n >= 69 && n <= 118) return "Callejón";
          if (n >= 119 && n <= 170) return "Cuadra 2";
          if (n >= 171 && n <= 234) return "Cuadra 3";
          if (n >= 235 && n <= 299) return "Cuadra 4";
          return "Desconocido";
      }

      // Lógica para determinar la cuadra en Fila B
      function obtenerCuadraB(n) {
          if (n >= 1 && n <= 52) return "Cuadra 1";
          if (n >= 53 && n <= 119) return "Cuadra 2";
          if (n >= 120 && n <= 185) return "Cuadra 3";
          if (n >= 186 && n <= 247) return "Cuadra 4";
          return "Desconocido";
      }

      // Ejecución serializada para mantener el orden de los IDs
      db.serialize(() => {
          const stmt = db.prepare("INSERT INTO puesto (fila, cuadra, nroPuesto) VALUES (?, ?, ?)");

          // --- PROCESAR FILA A ---
          for (let n = 1; n <= 299; n++) {
              let cuadra = obtenerCuadraA(n);
              stmt.run('A', cuadra, n);
              // Si hay un paso después de este puesto
              if (pasosA.includes(n)) {
                  // Usamos 10000 + n para evitar el error de UNIQUE
                  stmt.run('A', cuadra, 10000 + n);
              }
          }
          // --- PROCESAR FILA B ---
          for (let n = 1; n <= 247; n++) {
              let cuadra = obtenerCuadraB(n);
              stmt.run('B', cuadra, n);   
              if (pasosB.includes(n)) {
                  stmt.run('B', cuadra, 10000 + n);
              }
          }
          stmt.finalize((err) => {
              if (err) {
                  console.error("no se pudo crear puestos", err.message);
              } else {
                  console.log("Puestos Creados correctamente");
              }
              db.close();
          });
      });

    } else {
      //insertarTenenciasEjemplo();
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