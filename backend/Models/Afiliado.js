
const db = require('../config/db');

const Afiliado = {

  // ============================================
  // OBTENER TODOS (con filtros)
  // ============================================
  obtenerTodos: (params = {}) => {
    return new Promise((resolve, reject) => {

      // PASO 1: Si hay filtro por cantidad de puestos, obtener los IDs que cumplen
      const obtenerIdsPorCantidadPuestos = () => {
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

      // PASO 2: Construir la query principal.
      // FIX #1: construirQuery ya NO llama a resolve() internamente.
      // Solo devuelve null cuando no hay resultados posibles,
      // y el llamador decide qué hacer con eso — sin efectos secundarios ocultos.
      const construirQuery = (idsFiltrados) => {

        if (params.puestoCount && (!idsFiltrados || idsFiltrados.length === 0)) {
          return null;
        }

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

        if (idsFiltrados && idsFiltrados.length > 0) {
          query += ` AND a.id_afiliado IN (${idsFiltrados.map(() => '?').join(',')})`;
          queryParams.push(...idsFiltrados);
        }

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
          const termino = `%${params.search}%`;
          queryParams.push(termino, termino, termino, termino, termino, termino, termino);
        }

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

        if (params.orden === 'registro') {
          query += ` ORDER BY a.fecha_afiliacion ASC`;
        } else {
          query += ` ORDER BY a.paterno, a.materno, a.nombre ASC`;
        }

        return { query, queryParams };
      };

      // PASO 3: Ejecutar
      obtenerIdsPorCantidadPuestos()
        .then(idsFiltrados => {
          const resultado = construirQuery(idsFiltrados);

          // FIX #1: resolve([]) se llama aquí, donde corresponde,
          // no dentro de construirQuery donde era un efecto secundario oculto.
          if (!resultado) {
            resolve([]);
            return;
          }

          const { query, queryParams } = resultado;

          db.all(query, queryParams, (err, rows) => {
            if (err) { reject(err); return; }

            const afiliados = rows.map(row => ({
              id: row.id_afiliado,
              nombre: row.nombre.trim(),
              paterno: row.paterno,
              materno: row.materno,
              ci: `${row.ci} ${row.extension}`,
              ocupacion: row.ocupacion,
              patentes: row.puestos_codes ? row.puestos_codes.split(',').filter(Boolean) : [],
              total_puestos: row.total_puestos || 0,
              puestos_con_patente: row.puestos_con_patente || 0,
              estado: 'Activo',
              telefono: row.telefono,
              direccion: row.direccion,
              fechaRegistro: row.fecha_afiliacion,
              url_perfil: row.url_perfil || '/assets/perfiles/sinPerfil.png',
              edad: calcularEdad(row.fecNac),
              sexo: row.sexo === 'M' ? 'Masculino' : 'Femenino',
              fecha_afiliacion: row.fecha_afiliacion
            }));

            resolve(afiliados);
          });
        })
        .catch(reject);
    });
  },


  // ============================================
  // OBTENER TODOS LOS DESHABILITADOS
  // ============================================
  obtenerDeshabilitados: (params = {}) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          a.*,
          COUNT(DISTINCT tp.id_tenencia) as total_puestos,
          SUM(CASE WHEN p.tiene_patente = 1 THEN 1 ELSE 0 END) as puestos_con_patente,
          GROUP_CONCAT(DISTINCT p.nroPuesto || '-' || p.fila || '-' || p.cuadra) as puestos_codes
        FROM afiliado a
        LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado AND tp.fecha_fin IS NULL
        LEFT JOIN puesto p ON tp.id_puesto = p.id_puesto
        WHERE a.es_habilitado = 0
      `;

      const queryParams = [];

      if (params.search) {
        query += ` AND (
          a.paterno LIKE ? OR 
          a.nombre LIKE ? OR 
          a.materno LIKE ? OR
          a.ci LIKE ? OR
          a.ocupacion LIKE ?
        )`;
        const termino = `%${params.search}%`;
        queryParams.push(termino, termino, termino, termino, termino);
      }

      query += ` GROUP BY a.id_afiliado`;

      if (params.orden === 'registro') {
        query += ` ORDER BY a.fecha_afiliacion ASC`;
      } else {
        query += ` ORDER BY a.paterno, a.materno, a.nombre`;
      }

      db.all(query, queryParams, (err, rows) => {
        if (err) { reject(err); return; }

        const afiliados = rows.map(row => ({
          id: row.id_afiliado,
          nombre: `${row.nombre} ${row.paterno} ${row.materno || ''}`.trim(),
          ci: `${row.ci}-${row.extension}`,
          ocupacion: row.ocupacion,
          patentes: row.puestos_codes ? row.puestos_codes.split(',').filter(Boolean) : [],
          total_puestos: row.total_puestos || 0,
          puestos_con_patente: row.puestos_con_patente || 0,
          estado: 'Deshabilitado',
          telefono: row.telefono,
          direccion: row.direccion,
          fechaRegistro: row.fecha_afiliacion,
          url_perfil: row.url_perfil || '/assets/perfiles/sinPerfil.png',
          edad: calcularEdad(row.fecNac),
          sexo: row.sexo === 'M' ? 'Masculino' : 'Femenino',
          fecha_afiliacion: row.fecha_afiliacion,
          es_habilitado: 0
        }));

        resolve(afiliados);
      });
    });
  },


  // ============================================
  // OBTENER POR ID (con puestos e historial)
  // ============================================
  obtenerPorId: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM afiliado 
        WHERE id_afiliado = ? AND es_habilitado = 1
      `, [id], (err, afiliado) => {
        if (err) { reject(err); return; }
        if (!afiliado) { resolve(null); return; }

        db.all(`
          SELECT p.*, tp.fecha_ini, tp.razon
          FROM puesto p
          JOIN tenencia_puesto tp ON p.id_puesto = tp.id_puesto
          WHERE tp.id_afiliado = ? AND tp.fecha_fin IS NULL
          ORDER BY p.fila, p.nroPuesto
        `, [id], (err, puestos) => {
          if (err) { reject(err); return; }

          db.all(`
            SELECT p.*, tp.fecha_ini, tp.fecha_fin, tp.razon
            FROM puesto p
            JOIN tenencia_puesto tp ON p.id_puesto = tp.id_puesto
            WHERE tp.id_afiliado = ?
            ORDER BY tp.fecha_ini DESC
          `, [id], (err, historialPuestos) => {
            if (err) { reject(err); return; }

            resolve({
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
              edad: calcularEdad(afiliado.fecNac),
              telefono: afiliado.telefono,
              ocupacion: afiliado.ocupacion,
              direccion: afiliado.direccion,
              url_perfil: afiliado.url_perfil || '/assets/perfiles/sinPerfil.png',
              fecha_afiliacion: afiliado.fecha_afiliacion,
              es_habilitado: afiliado.es_habilitado,
              patentes: puestos.map(p => `${p.nroPuesto}-${p.fila}-${p.cuadra}`),
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
            });
          });
        });
      });
    });
  },


  // ============================================
  // CREAR
  // ============================================
  crear: (datos) => {
    return new Promise((resolve, reject) => {
      const {
        ci, extension = 'LP', nombre, paterno, materno = '',
        sexo, fecNac, telefono, ocupacion, direccion
      } = datos;

      db.run(`
        INSERT INTO afiliado 
        (ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion],
      function(err) {
        if (err) { reject(err); return; }
        resolve({ id: this.lastID, ...datos });
      });
    });
  },


  // ============================================
  // ACTUALIZAR
  // ============================================
  actualizar: (id, datos) => {
    return new Promise((resolve, reject) => {
      const {
        ci, extension, nombre, paterno, materno,
        sexo, fecNac, telefono, ocupacion, direccion, es_habilitado
      } = datos;

      db.run(`
        UPDATE afiliado 
        SET ci = ?, extension = ?, nombre = ?, paterno = ?, materno = ?,
            sexo = ?, fecNac = ?, telefono = ?, ocupacion = ?, direccion = ?,
            es_habilitado = ?
        WHERE id_afiliado = ?
      `, [
        ci, extension, nombre, paterno, materno,
        sexo, fecNac, telefono, ocupacion, direccion,
        es_habilitado ? 1 : 0, id
      ], function(err) {
        if (err) { reject(err); return; }
        if (this.changes === 0) { reject(new Error('Afiliado no encontrado')); return; }
        resolve({ id, ...datos });
      });
    });
  },


  // ============================================
  // DESHABILITAR
  // ============================================
  deshabilitar: (id, esHabilitado) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE afiliado SET es_habilitado = ? WHERE id_afiliado = ?',
        [esHabilitado, id],
        function(err) {
          if (err) { reject(err); return; }
          if (this.changes === 0) { reject(new Error('Afiliado no encontrado')); return; }
          resolve({ id, es_habilitado: esHabilitado });
        }
      );
    });
  },


  // ============================================
  // REHABILITAR
  // ============================================
  rehabilitar: (id) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE afiliado SET es_habilitado = 1, fecha_afiliacion = CURRENT_DATE WHERE id_afiliado = ?`,
        [id],
        function(err) {
          if (err) { reject(err); return; }
          if (this.changes === 0) { reject(new Error('Afiliado no encontrado')); return; }
          resolve({ id, fecha_rehabilitacion: new Date().toISOString().split('T')[0] });
        }
      );
    });
  },


  // ============================================
  // CONTAR DESHABILITADOS
  // ============================================
  contarDeshabilitados: () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as total FROM afiliado WHERE es_habilitado = 0`,
        [],
        (err, row) => {
          if (err) { reject(err); return; }
          resolve(row?.total || 0);
        }
      );
    });
  },


  // ============================================
  // BUSCAR (para selector de traspaso)
  // FIX #4: AND es_habilitado = 1 para que no aparezcan
  // desafiliados como receptores de un traspaso.
  // ============================================
  buscar: (termino) => {
    return new Promise((resolve, reject) => {
      const like = `%${termino}%`;
      db.all(`
        SELECT id_afiliado, ci, nombre, paterno, url_perfil
        FROM afiliado
        WHERE es_habilitado = 1
          AND (ci LIKE ? OR nombre LIKE ? OR paterno LIKE ?)
        LIMIT 10
      `, [like, like, like], (err, rows) => {
        if (err) { reject(err); return; }
        resolve(rows);
      });
    });
  },


  // ============================================
  // OBTENER PUESTOS ACTIVOS DE UN AFILIADO
  // ============================================
  obtenerPuestos: (id) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          p.id_puesto, p.fila, p.cuadra, p.nroPuesto,
          p.rubro, p.tiene_patente, t.fecha_ini
        FROM puesto p
        JOIN tenencia_puesto t ON t.id_puesto = p.id_puesto
        WHERE t.id_afiliado = ? AND t.fecha_fin IS NULL
        ORDER BY p.id_puesto
      `, [id], (err, rows) => {
        if (err) { reject(err); return; }
        resolve(rows);
      });
    });
  },


  // ============================================
  // ASIGNAR PUESTO
  // FIX #2: toda la operación corre dentro de una transacción.
  // resolve() se llama ÚNICAMENTE cuando el último UPDATE
  // confirma éxito con COMMIT. Si cualquier paso falla,
  // se hace ROLLBACK y reject() — nunca queda estado inconsistente.
  // ============================================
  asignarPuesto: (idAfiliado, datos) => {
    return new Promise((resolve, reject) => {
      const { fila, cuadra, nroPuesto, rubro, tiene_patente, razon } = datos;

      // Verificaciones previas (lectura, sin transacción necesaria)
      db.get(
        `SELECT id_puesto, disponible FROM puesto WHERE fila = ? AND cuadra = ? AND nroPuesto = ?`,
        [fila, cuadra, nroPuesto],
        (err, puesto) => {
          if (err) { reject(err); return; }
          if (!puesto)               { reject(new Error('Puesto no encontrado'));          return; }
          if (puesto.disponible === 0) { reject(new Error('El puesto no está disponible')); return; }

          db.get(
            `SELECT id_tenencia FROM tenencia_puesto WHERE id_puesto = ? AND fecha_fin IS NULL`,
            [puesto.id_puesto],
            (err, tenenciaActiva) => {
              if (err) { reject(err); return; }
              if (tenenciaActiva) { reject(new Error('El puesto ya está ocupado')); return; }

              const idPuesto = puesto.id_puesto;

              // Todas las escrituras en una sola transacción atómica
              db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // A: actualizar rubro y patente
                db.run(
                  `UPDATE puesto SET rubro = ?, tiene_patente = ? WHERE id_puesto = ?`,
                  [rubro || null, tiene_patente ? 1 : 0, idPuesto],
                  (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(new Error('Error al actualizar datos del puesto'));
                      return;
                    }

                    // B: crear tenencia
                    db.run(
                      `INSERT INTO tenencia_puesto (id_afiliado, id_puesto, razon, fecha_ini)
                       VALUES (?, ?, ?, CURRENT_DATE)`,
                      [idAfiliado, idPuesto, razon || 'ASIGNADO'],
                      function(err) {
                        if (err) {
                          db.run('ROLLBACK');
                          reject(new Error('Error al registrar la tenencia'));
                          return;
                        }

                        const idTenencia = this.lastID;

                        // C: marcar puesto como ocupado — resolve() solo aquí
                        db.run(
                          `UPDATE puesto SET disponible = 0 WHERE id_puesto = ?`,
                          [idPuesto],
                          (err) => {
                            if (err) {
                              db.run('ROLLBACK');
                              reject(new Error('Error al marcar el puesto como ocupado'));
                              return;
                            }

                            db.run('COMMIT');
                            resolve({ id_tenencia: idTenencia, id_puesto: idPuesto });
                          }
                        );
                      }
                    );
                  }
                );
              });
            }
          );
        }
      );
    });
  },


  // ============================================
  // DESPOJAR O LIBERAR PUESTO
  // ============================================
  despojarPuesto: (idAfiliado, idPuesto, razon) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
          `UPDATE tenencia_puesto 
           SET fecha_fin = CURRENT_DATE, razon = ?
           WHERE id_afiliado = ? AND id_puesto = ? AND fecha_fin IS NULL`,
          [razon, idAfiliado, idPuesto],
          function(err) {
            if (err) { db.run('ROLLBACK'); reject(err); return; }
            if (this.changes === 0) {
              db.run('ROLLBACK');
              reject(new Error('No se encontró una tenencia activa para este puesto y afiliado'));
              return;
            }

            db.run(
              `UPDATE puesto SET disponible = 1 WHERE id_puesto = ?`,
              [idPuesto],
              function(err) {
                if (err) { db.run('ROLLBACK'); reject(err); return; }
                db.run('COMMIT');
                resolve({ id_puesto: idPuesto, id_afiliado: idAfiliado, razon });
              }
            );
          }
        );
      });
    });
  },


  // ============================================
  // ACTUALIZAR FOTO DE PERFIL
  // ============================================
  actualizarFotoPerfil: (id, url) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE afiliado SET url_perfil = ? WHERE id_afiliado = ?',
        [url, id],
        function(err) {
          if (err) { reject(err); return; }
          if (this.changes === 0) { reject(new Error('Afiliado no encontrado')); return; }
          resolve({ url });
        }
      );
    });
  },


  // ============================================
  // OBTENER RUBROS ÚNICOS
  // ============================================
  obtenerRubros: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT rubro FROM puesto
        WHERE rubro IS NOT NULL AND rubro != ''
        ORDER BY rubro
      `, [], (err, rows) => {
        if (err) { reject(err); return; }
        resolve(rows.map(r => r.rubro).filter(Boolean));
      });
    });
  },


  // ============================================
  // OBTENER ESTADÍSTICAS
  // FIX #5: WHERE a.es_habilitado = 1 para que el contador
  // de total_afiliados no incluya a los desafiliados.
  // ============================================
  obtenerEstadisticas: () => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(DISTINCT a.id_afiliado) as total_afiliados,
          COUNT(DISTINCT CASE WHEN p.tiene_patente = 1 AND tp.fecha_fin IS NULL THEN p.id_puesto END) as puestos_con_patente,
          COUNT(DISTINCT CASE WHEN p.tiene_patente = 0 AND tp.fecha_fin IS NULL THEN p.id_puesto END) as puestos_sin_patente,
          COUNT(DISTINCT CASE WHEN tp.id_afiliado IS NOT NULL AND tp.fecha_fin IS NULL THEN p.id_puesto END) as puestos_ocupados
        FROM afiliado a
        LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado AND tp.fecha_fin IS NULL
        LEFT JOIN puesto p ON tp.id_puesto = p.id_puesto
        WHERE a.es_habilitado = 1
      `, [], (err, row) => {
        if (err) { reject(err); return; }
        resolve(row || {});
      });
    });
  },

};


// ============================================
// FUNCIÓN AUXILIAR (privada, no se exporta)
// ============================================
function calcularEdad(fecNac) {
  if (!fecNac) return null;
  const hoy = new Date();
  const nacimiento = new Date(fecNac);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}


module.exports = Afiliado;