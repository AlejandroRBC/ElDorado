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
      insertarDatosEjemplo();
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

// Insertar datos de ejemplo para probar
function insertarDatosEjemplo() {
  // Verificar si ya hay datos
  db.get('SELECT COUNT(*) as count FROM afiliado', (err, row) => {
    if (err) {
      console.error('❌ Error contando afiliados:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('📝 Insertando datos de ejemplo...');
      
      const afiliadosEjemplo = [
        ['1234567', 'LP', 'Juan', 'Pérez', 'García', 'M', '1985-05-15', '76543210', 'Comerciante', 'Av. Principal #123', '/assets/perfiles/sinPerfil.png'],
        ['7654321', 'LP', 'María', 'García', 'Rodríguez', 'F', '1990-08-22', '71234567', 'Servicios', 'Calle Secundaria #456', '/assets/perfiles/sinPerfil.png'],
        ['9876543', 'LP', 'Carlos', 'López', 'Mendoza', 'M', '1978-03-10', '70123456', 'Industrial', 'Av. Industrial #789', '/assets/perfiles/sinPerfil.png'],
        ['4567890', 'LP', 'Ana', 'Martínez', 'Pérez', 'F', '1995-11-30', '79876543', 'Comerciante', 'Calle Comercial #321', '/assets/perfiles/sinPerfil.png'],
        ['2345678', 'LP', 'Luis', 'Rodríguez', 'Fernández', 'M', '1982-07-18', '78901234', 'Servicios', 'Av. Central #654', '/assets/perfiles/sinPerfil.png'],
        ['8765432', 'LP', 'Sofía', 'Fernández', 'Gómez', 'F', '1993-02-25', '75678901', 'Industrial', 'Calle Norte #987', '/assets/perfiles/sinPerfil.png'],
        ['3456789', 'LP', 'Pedro', 'Gómez', 'López', 'M', '1988-09-12', '73456789', 'Comerciante', 'Av. Sur #159', '/assets/perfiles/sinPerfil.png'],
        ['5678901', 'LP', 'Laura', 'Díaz', 'Martínez', 'F', '1991-12-05', '72345678', 'Servicios', 'Calle Este #753', '/assets/perfiles/sinPerfil.png']
      ];

      let insertados = 0;
      afiliadosEjemplo.forEach(afiliado => {
        db.run(`
          INSERT INTO afiliado 
          (ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion, url_perfil)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, afiliado, function(err) {
          if (err) {
            console.error('❌ Error insertando afiliado:', err.message);
          } else {
            insertados++;
            if (insertados === afiliadosEjemplo.length) {
              console.log(`✅ ${insertados} afiliados de ejemplo insertados`);
              insertarPuestosEjemplo();
            }
          }
        });
      });
    } else {
      console.log(`✅ Ya existen ${row.count} afiliados en la base de datos`);
    }
  });
}

// Insertar puestos de ejemplo
function insertarPuestosEjemplo() {
  const puestosEjemplo = [
    ['A', '1ra cuadra', 101, 3, 4, 1, 'Repuestos de auto'],
    ['A', '1ra cuadra', 102, 3, 4, 1, 'Ropa'],
    ['B', '2da cuadra', 201, 4, 5, 1, 'Electrónica'],
    ['B', '2da cuadra', 202, 4, 5, 0, null],
    ['C', '3ra cuadra', 301, 3, 3, 1, 'Frescos'],
    ['C', 'callejon', 302, 2, 3, 1, 'Tapices']
  ];

  let insertados = 0;
  puestosEjemplo.forEach(puesto => {
    db.run(`
      INSERT INTO puesto 
      (fila, cuadra, nroPuesto, ancho, largo, tiene_patente, rubro)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, puesto, function(err) {
      if (err) {
        console.error('❌ Error insertando puesto:', err.message);
      } else {
        insertados++;
        if (insertados === puestosEjemplo.length) {
          console.log(`✅ ${insertados} puestos de ejemplo insertados`);
          asignarPuestosEjemplo();
        }
      }
    });
  });
}

// Asignar puestos a afiliados
function asignarPuestosEjemplo() {
  const asignaciones = [
    [1, 1, 'NUEVITO'], // Juan Pérez tiene puesto 101
    [2, 3, 'NUEVITO'], // María García tiene puesto 201
    [3, 5, 'NUEVITO'], // Carlos López tiene puesto 301
    [4, 6, 'NUEVITO'], // Ana Martínez tiene puesto 302
    [1, 2, 'TRASPASO'], // Juan Pérez también tiene puesto 102
    [5, 4, 'NUEVITO']  // Luis Rodríguez tiene puesto 202 (sin patente)
  ];

  let asignados = 0;
  asignaciones.forEach(([afiliadoId, puestoId, razon]) => {
    db.run(`
      INSERT INTO tenencia_puesto 
      (id_afiliado, id_puesto, razon)
      VALUES (?, ?, ?)
    `, [afiliadoId, puestoId, razon], function(err) {
      if (err) {
        console.error('❌ Error asignando puesto:', err.message);
      } else {
        asignados++;
        if (asignados === asignaciones.length) {
          console.log(`✅ ${asignados} asignaciones de puestos creadas`);
          
          // Actualizar puestos que tienen patente
          db.run(`
            UPDATE puesto 
            SET tiene_patente = 1 
            WHERE id_puesto IN (1, 3, 5, 6)
          `, (err) => {
            if (err) {
              console.error('❌ Error actualizando patentes:', err.message);
            } else {
              console.log('✅ Puestos con patente actualizados');
            }
          });
        }
      }
    });
  });
}

module.exports = db;