const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/eldorado.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

// Inicialización de la tabla de usuarios
const initDB = () => {

    db.prepare(`
        CREATE TABLE IF NOT EXISTS afiliado (
            id_afiliado INTEGER PRIMARY KEY AUTOINCREMENT,
            ci TEXT UNIQUE NOT NULL,
            extension TEXT,
            nombre TEXT NOT NULL,
            paterno TEXT,
            materno TEXT,
            sexo TEXT,
            fecNac TEXT,
            telefono INTEGER,
            ocupacion TEXT,
            direccion TEXT,
            url_perfil TEXT,
            fecha_afiliacion TEXT,
            es_habilitado INTEGER DEFAULT 1
        )    
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            id_afiliado INTEGER,
            rol TEXT DEFAULT 'admin',
            nom_usuario TEXT NOT NULL,
            password TEXT NOT NULL,
            fecha_ini_usuario TEXT,
            fecha_fin_usuario TEXT,
            es_Vigente INTEGER DEFAULT 1,
            FOREIGN KEY (id_afiliado) REFERENCES afiliado(id_afiliado)
        )
    `).run();
    
    db.prepare(`
        CREATE TABLE IF NOT EXISTS puesto (
            id_puesto INTEGER PRIMARY KEY AUTOINCREMENT,
            fila TEXT,          
            cuadra TEXT,        
            nroPuesto INTEGER,
            ancho REAL,         
            largo REAL,         
            tiene_patente INTEGER DEFAULT 1, 
            rubro TEXT
        )
    `).run();
    
    db.prepare(`
        CREATE TABLE IF NOT EXISTS tenencia_puesto (
            id_tenencia INTEGER PRIMARY KEY AUTOINCREMENT,
            id_afiliado INTEGER,
            id_puesto INTEGER,
            fecha_ini TEXT NOT NULL,
            fecha_fin TEXT, 
            razon TEXT, -- TRASPASO, DESPOJO, LIBERADO, NUEVITO
            FOREIGN KEY (id_afiliado) REFERENCES afiliado(id_afiliado),
            FOREIGN KEY (id_puesto) REFERENCES puesto(id_puesto)
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS historial_usuarios (
            id_historial INTEGER PRIMARY KEY AUTOINCREMENT,
            nom_usuario_esclavo TEXT,
            nom_afiliado_esclavo TEXT,
            rol TEXT,
            id_afiliado INTEGER,
            fecha TEXT,
            hora TEXT,
            motivo TEXT,
            nom_usuario_master TEXT,
            nom_afiliado_master TEXT
        )
    `).run();
    // Insertamos un usuario de prueba si la tabla está vacía
    const userExists = db.prepare('SELECT count(*) as count FROM usuarios').get();
    if (userExists.count === 0) {
        const infoAfiliado = db.prepare(`
            INSERT INTO afiliado (ci, nombre, paterno)
            VALUES(?,?,?)
        `).run('0000000','Alejandro','Admin');

        const idNuevoAfiliado = infoAfiliado.lastInsertRowid;

        db.prepare(`
            INSERT INTO usuarios(id_afiliado, rol, nom_usuario, password, fecha_ini_usuario)
            VALUES(?,?,?,?,?)    
        `).run(idNuevoAfiliado, 'superadmin','admin','1234', new Date().toISOString());
        console.log("Sistema inicializado: Afiliado Master y Usuario 'admin' creados.");
    }
};

initDB();

module.exports = db;