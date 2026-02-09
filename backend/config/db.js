const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// ===============================
// RUTA Y CONEXIÓN A LA BD
// ===============================
const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'elDorado.db');

// Asegurar carpeta data
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Conectar SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar a SQLite:', err.message);
    } else {
        console.log('✅ Conectado a SQLite:', dbPath);
        crearTablas();
    }
});

// ===============================
// CREAR TABLAS
// ===============================
function crearTablas() {

    // ---------- AFILIADO ----------
    db.run(`
        CREATE TABLE IF NOT EXISTS afiliado (
            id_afiliado INTEGER PRIMARY KEY AUTOINCREMENT,
            ci VARCHAR(20) NOT NULL UNIQUE,
            extension VARCHAR(3) DEFAULT 'LP',
            nombre VARCHAR(100) NOT NULL,
            paterno VARCHAR(100) NOT NULL,
            materno VARCHAR(100),
            sexo VARCHAR(1) CHECK(sexo IN ('M','F')),
            fecNac DATE,
            telefono VARCHAR(20),
            ocupacion VARCHAR(100),
            direccion TEXT,
            url_perfil VARCHAR(255) DEFAULT '/assets/perfiles/sinPerfil.png',
            fecha_afiliacion DATE DEFAULT CURRENT_DATE,
            es_habilitado BOOLEAN DEFAULT 1
        )
    `);

    // ---------- PUESTO ----------
    db.run(`
        CREATE TABLE IF NOT EXISTS puesto (
            id_puesto INTEGER PRIMARY KEY AUTOINCREMENT,
            fila VARCHAR(1) CHECK(fila IN ('A','B','C','D','E')),
            cuadra VARCHAR(50) NOT NULL,
            nroPuesto INTEGER NOT NULL,
            ancho INTEGER,
            largo INTEGER,
            tiene_patente BOOLEAN DEFAULT 0,
            rubro TEXT,
            UNIQUE(fila, cuadra, nroPuesto)
        )
    `);

    // ---------- TENENCIA ----------
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
    `);

    // ---------- USUARIOS ----------
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
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
        )
    `, () => {
        crearIndices();
        insertarDatosEjemplo();
    });
}

// ===============================
// ÍNDICES
// ===============================
function crearIndices() {
    db.run(`CREATE INDEX IF NOT EXISTS idx_usuarios_nom_usuario ON usuarios(nom_usuario)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_usuarios_id_afiliado ON usuarios(id_afiliado)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_usuarios_es_vigente ON usuarios(es_vigente)`);
}

// ===============================
// DATOS DE EJEMPLO
// ===============================
function insertarDatosEjemplo() {
    db.get(`SELECT COUNT(*) AS count FROM afiliado`, (err, row) => {
        if (row.count === 0) {

            const afiliados = [
                ['1234567','LP','Juan','Pérez','García','M','1985-05-15','76543210','Comerciante','Av Principal'],
                ['7654321','LP','María','García','Rodríguez','F','1990-08-22','71234567','Servicios','Calle Secundaria'],
                ['9876543','LP','Carlos','López','Mendoza','M','1978-03-10','70123456','Industrial','Av Industrial']
            ];

            afiliados.forEach(a => {
                db.run(`
                    INSERT INTO afiliado 
                    (ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion)
                    VALUES (?,?,?,?,?,?,?,?,?,?)
                `, a);
            });

            crearUsuarioAdmin();
            insertarPuestosEjemplo();
        } else {
            crearUsuarioAdmin();
        }
    });
}

// ===============================
// USUARIO ADMIN
// ===============================
function crearUsuarioAdmin() {
    db.get(`SELECT COUNT(*) AS count FROM usuarios WHERE nom_usuario='admin'`, (err, row) => {
        if (row.count === 0) {

            const hash = bcrypt.hashSync('123456', 10);

            db.run(`
                INSERT INTO usuarios 
                (id_afiliado, rol, nom_usuario, password, es_vigente)
                VALUES (1,'superadmin','admin',?,1)
            `, [hash]);

            console.log('✅ Usuario admin creado → admin / 123456');
        }
    });
}

// ===============================
// PUESTOS
// ===============================
function insertarPuestosEjemplo() {
    const puestos = [
        ['A','1ra cuadra',101,3,4,1,'Repuestos'],
        ['A','1ra cuadra',102,3,4,1,'Ropa'],
        ['B','2da cuadra',201,4,5,1,'Electrónica']
    ];

    puestos.forEach(p => {
        db.run(`
            INSERT INTO puesto
            (fila, cuadra, nroPuesto, ancho, largo, tiene_patente, rubro)
            VALUES (?,?,?,?,?,?,?)
        `, p);
    });
}

module.exports = db;
