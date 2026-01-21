const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/eldorado.db');
const db = new Database(dbPath);

// Inicialización de la tabla de usuarios
const initDB = () => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            usuario TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            rol TEXT DEFAULT 'admin'
        )
    `).run();

    // Insertamos un usuario de prueba si la tabla está vacía
    const userExists = db.prepare('SELECT count(*) as count FROM usuarios').get();
    if (userExists.count === 0) {
        db.prepare(`
            INSERT INTO usuarios (nombre, usuario, password, rol) 
            VALUES (?, ?, ?, ?)
        `).run('Alejandro', 'admin', '1234', 'superadmin');
        console.log("✅ Usuario de prueba creado: admin / 1234");
    }
};

initDB();

module.exports = db;