const db = require('../config/db');

const Afiliado = {
  // Obtener todos los afiliados activos
  findAll: (params = {}) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          a.*,
          GROUP_CONCAT(p.nroPuesto || '-' || p.fila || '-' || p.cuadra) as puestos
        FROM afiliado a
        LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado 
          AND tp.fecha_fin IS NULL
        LEFT JOIN puesto p ON tp.id_puesto = p.id_puesto  
        WHERE a.es_habilitado = 1
      `;
      
      const queryParams = [];
      
      // Filtrar por búsqueda
      if (params.search) {
        query += ` AND (
          a.paterno LIKE ? OR 
          a.nombre LIKE ? OR 
          a.ci LIKE ? OR
          a.ocupacion LIKE ?
        )`;
        const searchTerm = `%${params.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      // Filtrar por rubro
      if (params.rubro) {
        query += ` AND a.ocupacion = ?`;
        queryParams.push(params.rubro);
      }
      
      query += ` GROUP BY a.id_afiliado ORDER BY a.paterno, a.materno`;
      
      db.all(query, queryParams, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Transformar datos para frontend
        const afiliados = rows.map(row => {
          // Calcular edad si hay fecha de nacimiento
          let edad = null;
          if (row.fecNac) {
            const hoy = new Date();
            const nacimiento = new Date(row.fecNac);
            edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
              edad--;
            }
          }
          
          return {
            id: row.id_afiliado,
            nombre: `${row.nombre} ${row.paterno} ${row.materno || ''}`.trim(),
            ci: `${row.ci}-${row.extension}`,
            ocupacion: row.ocupacion,
            patentes: row.puestos ? row.puestos.split(',').filter(p => p) : [],
            estado: 'Activo',
            telefono: row.telefono,
            direccion: row.direccion,
            fechaRegistro: row.fecha_afiliacion,
            url_perfil: row.url_perfil || '/assets/perfiles/sinPerfil.png',
            edad: edad,
            sexo: row.sexo === 'M' ? 'Masculino' : 'Femenino'
          };
        });
        
        resolve(afiliados);
      });
    });
  },




  // Obtener afiliado por ID con todos sus detalles
  findById: (id) => {
    return new Promise((resolve, reject) => {
      // Primero obtener datos básicos del afiliado
      db.get(`
        SELECT * FROM afiliado 
        WHERE id_afiliado = ? AND es_habilitado = 1
      `, [id], (err, afiliado) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!afiliado) {
          resolve(null);
          return;
        }
        
        // Obtener puestos actuales del afiliado
        db.all(`
          SELECT 
            p.*,
            tp.fecha_ini,
            tp.razon
          FROM puesto p
          JOIN tenencia_puesto tp ON p.id_puesto = tp.id_puesto
          WHERE tp.id_afiliado = ? AND tp.fecha_fin IS NULL
          ORDER BY p.fila, p.nroPuesto
        `, [id], (err, puestos) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Obtener historial de puestos
          db.all(`
            SELECT 
              p.*,
              tp.fecha_ini,
              tp.fecha_fin,
              tp.razon
            FROM puesto p
            JOIN tenencia_puesto tp ON p.id_puesto = tp.id_puesto
            WHERE tp.id_afiliado = ?
            ORDER BY tp.fecha_ini DESC
          `, [id], (err, historialPuestos) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Calcular edad
            let edad = null;
            if (afiliado.fecNac) {
              const hoy = new Date();
              const nacimiento = new Date(afiliado.fecNac);
              edad = hoy.getFullYear() - nacimiento.getFullYear();
              const mes = hoy.getMonth() - nacimiento.getMonth();
              if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad--;
              }
            }
            
            // Construir respuesta
            const respuesta = {
              id: afiliado.id_afiliado,
              nombre: afiliado.nombre,
              paterno: afiliado.paterno,
              materno: afiliado.materno,
              nombreCompleto: `${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno || ''}`.trim(),
              ci: `${afiliado.ci}-${afiliado.extension}`,
              ci_numero: afiliado.ci,
              extension: afiliado.extension,
              sexo: afiliado.sexo === 'M' ? 'Masculino' : 'Femenino',
              fecNac: afiliado.fecNac,
              edad: edad,
              telefono: afiliado.telefono,
              ocupacion: afiliado.ocupacion,
              direccion: afiliado.direccion,
              url_perfil: afiliado.url_perfil || '/assets/perfiles/sinPerfil.png',
              fecha_afiliacion: afiliado.fecha_afiliacion,
              es_habilitado: afiliado.es_habilitado,
              
              // Puestos actuales formateados para cards
              patentes: puestos.map(p => `${p.nroPuesto}-${p.fila}-${p.cuadra}`),
              
              // Puestos detallados para tabla
              puestos: historialPuestos.map(p => ({
                id: p.id_puesto,
                nro: p.nroPuesto,
                fila: p.fila,
                cuadra: p.cuadra,
                ancho: p.ancho,
                largo: p.largo,
                tiene_patente: p.tiene_patente,
                rubro: p.rubro,
                fecha_obtencion: p.fecha_ini,
                fecha_fin: p.fecha_fin,
                razon: p.razon,
                estado: p.fecha_fin ? 'Histórico' : 'Activo'
              }))
            };
            
            resolve(respuesta);
          });
        });
      });
    });
  },




  // Crear nuevo afiliado
  create: (afiliadoData) => {
    return new Promise((resolve, reject) => {
      const {
        ci, extension = 'LP', nombre, paterno, materno = '',
        sexo, fecNac, telefono, ocupacion, direccion
      } = afiliadoData;
      
      db.run(`
        INSERT INTO afiliado 
        (ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const nuevoAfiliado = {
          id: this.lastID,
          ...afiliadoData
        };
        
        resolve(nuevoAfiliado);
      });
    });
  }
};

module.exports = Afiliado;