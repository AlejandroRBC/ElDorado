const db = require('../config/db');

const Afiliado = {
  

  update: (id, afiliadoData) => {
    return new Promise((resolve, reject) => {
      const {
        ci, extension, nombre, paterno, materno,
        sexo, fecNac, telefono, ocupacion, direccion,
        es_habilitado
      } = afiliadoData;
      
      db.run(`
        UPDATE afiliado 
        SET ci = ?,
            extension = ?,
            nombre = ?,
            paterno = ?,
            materno = ?,
            sexo = ?,
            fecNac = ?,
            telefono = ?,
            ocupacion = ?,
            direccion = ?,
            es_habilitado = ?
        WHERE id_afiliado = ?
      `, [
        ci, extension, nombre, paterno, materno,
        sexo, fecNac, telefono, ocupacion, direccion,
        es_habilitado ? 1 : 0, id
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        if (this.changes === 0) {
          reject(new Error('Afiliado no encontrado'));
          return;
        }
        
        resolve({ id, ...afiliadoData });
      });
    });
  },
  

  // Obtener rubros únicos de puestos activos
  getRubrosUnicos: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT p.rubro 
        FROM puesto p
        WHERE p.rubro IS NOT NULL AND p.rubro != ''
        ORDER BY p.rubro
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const rubros = rows.map(row => row.rubro).filter(Boolean);
        resolve(rubros);
      });
    });
  },

  // Obtener estadísticas para contadores
  getEstadisticas: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(DISTINCT a.id_afiliado) as total_afiliados,
          COUNT(DISTINCT CASE 
            WHEN p.tiene_patente = 1 AND tp.fecha_fin IS NULL 
            THEN p.id_puesto 
          END) as puestos_con_patente,
          COUNT(DISTINCT CASE 
            WHEN p.tiene_patente = 0 AND tp.fecha_fin IS NULL 
            THEN p.id_puesto 
          END) as puestos_sin_patente,
          COUNT(DISTINCT CASE 
            WHEN tp.id_afiliado IS NOT NULL AND tp.fecha_fin IS NULL 
            THEN p.id_puesto 
          END) as puestos_ocupados
        FROM afiliado a
        LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado AND tp.fecha_fin IS NULL
        LEFT JOIN puesto p ON tp.id_puesto = p.id_puesto
      `;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || {});
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
  },

  // Obtener todos los afiliados con filtros mejorados
  findAll: (params = {}) => {
    return new Promise((resolve, reject) => {
      
      // PRIMERO: Obtener IDs de afiliados que cumplen el filtro de cantidad de puestos
      let getIdsPorCantidadPuestos = () => {
        return new Promise((resolve, reject) => {
          if (!params.puestoCount) {
            resolve(null);
            return;
          }

          let sql = `
            SELECT 
              a.id_afiliado,
              COUNT(tp.id_tenencia) as total_puestos
            FROM afiliado a
            LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado AND tp.fecha_fin IS NULL
            WHERE a.es_habilitado = 1
            GROUP BY a.id_afiliado
          `;

          const count = parseInt(params.puestoCount);
          if (count === 5) {
            sql += ` HAVING total_puestos >= 5`;
          } else {
            sql += ` HAVING total_puestos = ?`;
          }

          db.all(sql, count === 5 ? [] : [count], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.id_afiliado));
          });
        });
      };

      // SEGUNDO: Construir query principal
      let buildMainQuery = (idsFiltrados) => {
        let query = `
          SELECT 
            a.*,
            COUNT(DISTINCT tp.id_tenencia) as total_puestos,
            SUM(CASE WHEN p.tiene_patente = 1 THEN 1 ELSE 0 END) as puestos_con_patente,
            GROUP_CONCAT(DISTINCT p.nroPuesto || '-' || p.fila || '-' || p.cuadra) as puestos_codes,
            GROUP_CONCAT(DISTINCT p.rubro) as rubros
          FROM afiliado a
          LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado AND tp.fecha_fin IS NULL
          LEFT JOIN puesto p ON tp.id_puesto = p.id_puesto
          WHERE a.es_habilitado = 1
        `;

        const queryParams = [];

        // FILTRO POR IDS (cantidad de puestos)
        if (idsFiltrados && idsFiltrados.length > 0) {
          query += ` AND a.id_afiliado IN (${idsFiltrados.map(() => '?').join(',')})`;
          queryParams.push(...idsFiltrados);
        } else if (params.puestoCount && (!idsFiltrados || idsFiltrados.length === 0)) {
          // Si hay filtro de puestos pero no hay resultados, retornar vacío
          resolve([]);
          return;
        }

        // FILTRO DE BÚSQUEDA
        if (params.search) {
          query += ` AND (
            a.paterno LIKE ? OR 
            a.nombre LIKE ? OR 
            a.materno LIKE ? OR
            a.ci LIKE ? OR
            a.ocupacion LIKE ? OR
            p.rubro LIKE ? OR
            p.nroPuesto LIKE ?
          )`;
          const searchTerm = `%${params.search}%`;
          queryParams.push(
            searchTerm, searchTerm, searchTerm, 
            searchTerm, searchTerm, searchTerm, searchTerm
          );
        }

        // FILTRO POR PATENTE
        if (params.conPatente !== null && params.conPatente !== undefined) {
          const valorPatente = params.conPatente === 'true' || params.conPatente === true ? 1 : 0;
          query += ` AND a.id_afiliado IN (
            SELECT DISTINCT tp.id_afiliado 
            FROM tenencia_puesto tp
            JOIN puesto p ON tp.id_puesto = p.id_puesto
            WHERE tp.fecha_fin IS NULL AND p.tiene_patente = ?
          )`;
          queryParams.push(valorPatente);
        }

        // FILTRO POR RUBRO
        if (params.rubro) {
          query += ` AND a.id_afiliado IN (
            SELECT DISTINCT tp.id_afiliado
            FROM tenencia_puesto tp
            JOIN puesto p ON tp.id_puesto = p.id_puesto
            WHERE tp.fecha_fin IS NULL AND p.rubro = ?
          )`;
          queryParams.push(params.rubro);
        }

        query += ` GROUP BY a.id_afiliado`;

        // ORDENAMIENTO
        if (params.orden === 'registro') {
          query += ` ORDER BY a.fecha_afiliacion DESC`;
        } else {
          query += ` ORDER BY a.paterno, a.materno, a.nombre`;
        }

        return { query, queryParams };
      };

      // EJECUTAR TODO
      getIdsPorCantidadPuestos()
        .then(idsFiltrados => {
          const { query, queryParams } = buildMainQuery(idsFiltrados);
          
          db.all(query, queryParams, (err, rows) => {
            if (err) {
              reject(err);
              return;
            }

            // Transformar datos
            const afiliados = rows.map(row => {
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

              const puestosActivos = row.puestos_codes 
                ? row.puestos_codes.split(',').filter(p => p) 
                : [];

              return {
                id: row.id_afiliado,
                nombre: `${row.nombre} ${row.paterno} ${row.materno || ''}`.trim(),
                ci: `${row.ci}-${row.extension}`,
                ocupacion: row.ocupacion,
                patentes: puestosActivos,
                total_puestos: row.total_puestos || 0,
                puestos_con_patente: row.puestos_con_patente || 0,
                estado: 'Activo',
                telefono: row.telefono,
                direccion: row.direccion,
                fechaRegistro: row.fecha_afiliacion,
                url_perfil: row.url_perfil || '/assets/perfiles/sinPerfil.png',
                edad: edad,
                sexo: row.sexo === 'M' ? 'Masculino' : 'Femenino',
                fecha_afiliacion: row.fecha_afiliacion
              };
            });

            resolve(afiliados);
          });
        })
        .catch(reject);
    });
  },

};

module.exports = Afiliado;