// Models/Afiliado.js
const db = require('../config/db');

const Afiliado = {

  // ============================================
  // OBTENER TODOS (con filtros)
  // ============================================
  obtenerTodos: (params = {}) => {
    return new Promise((resolve, reject) => {

      const obtenerIdsPorCantidadPuestos = () => {
        return new Promise((resolve, reject) => {
          if (!params.puestoCount) { resolve(null); return; }

          let sql = `
            SELECT a.id_afiliado, COUNT(tp.id_tenencia) as total_puestos
            FROM afiliado a
            LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado
            WHERE a.es_habilitado = 1
            GROUP BY a.id_afiliado
          `;
          const count = parseInt(params.puestoCount);
          sql += count === 5 ? ` HAVING total_puestos >= 5` : ` HAVING total_puestos = ?`;

          db.all(sql, count === 5 ? [] : [count], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.id_afiliado));
          });
        });
      };

      const construirQuery = (idsFiltrados) => {
        if (params.puestoCount && (!idsFiltrados || idsFiltrados.length === 0)) return null;

        let query = `
          SELECT
            a.*,
            COUNT(DISTINCT tp.id_tenencia)                                     AS total_puestos,
            SUM(CASE WHEN (p.tiene_patente = 1 OR p.nro_patente IS NOT NULL) THEN 1 ELSE 0 END) AS puestos_con_patente,
            GROUP_CONCAT(DISTINCT p.nroPuesto || '-' || p.fila || '-' || p.cuadra) AS puestos_codes,
            GROUP_CONCAT(
              p.nroPuesto || '-' || p.fila || '-' || p.cuadra || ':' ||
              CASE WHEN (p.tiene_patente = 1 OR p.nro_patente IS NOT NULL) THEN '1' ELSE '0' END
            ) AS puestos_patente_codes,
            GROUP_CONCAT(DISTINCT p.rubro)                                     AS rubros
          FROM afiliado a
          LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado
          LEFT JOIN puesto p ON tp.id_puesto = p.id_puesto
          WHERE a.es_habilitado = 1
        `;
        const queryParams = [];

        if (idsFiltrados?.length > 0) {
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
            p.nroPuesto LIKE ? OR
            TRIM(a.nombre || ' ' || a.paterno || ' ' || IFNULL(a.materno, '')) LIKE ? OR
            TRIM(a.paterno || ' ' || IFNULL(a.materno, '') || ' ' || a.nombre) LIKE ?
          )`;
          const termino = `%${params.search.trim()}%`;
          queryParams.push(
            termino, termino, termino, termino, termino, termino, termino,
            termino, termino
          );
        }

        if (params.conPatente !== null && params.conPatente !== undefined) {
          const val = params.conPatente === 'true' || params.conPatente === true ? 1 : 0;
          query += ` AND a.id_afiliado IN (
            SELECT DISTINCT tp.id_afiliado FROM tenencia_puesto tp
            JOIN puesto p ON tp.id_puesto = p.id_puesto
            WHERE p.tiene_patente = ?
          )`;
          queryParams.push(val);
        }

        if (params.rubro) {
          query += ` AND a.id_afiliado IN (
            SELECT DISTINCT tp.id_afiliado FROM tenencia_puesto tp
            JOIN puesto p ON tp.id_puesto = p.id_puesto
            WHERE p.rubro = ?
          )`;
          queryParams.push(params.rubro);
        }

        query += ` GROUP BY a.id_afiliado`;
        query += params.orden === 'registro'
          ? ` ORDER BY a.fecha_afiliacion ASC`
          : ` ORDER BY a.paterno, a.materno, a.nombre ASC`;

        return { query, queryParams };
      };

      obtenerIdsPorCantidadPuestos()
        .then(idsFiltrados => {
          const resultado = construirQuery(idsFiltrados);
          if (!resultado) { resolve([]); return; }

          const { query, queryParams } = resultado;
          db.all(query, queryParams, (err, rows) => {
            if (err) { reject(err); return; }
            resolve(rows.map(row => ({
              id:                  row.id_afiliado,
              nombre:              row.nombre.trim(),
              paterno:             row.paterno,
              materno:             row.materno,
              ci:                  `${row.ci} ${row.extension}`,
              ocupacion:           row.ocupacion,
              puestos:             row.puestos_codes ? row.puestos_codes.split(',').filter(Boolean) : [],
              puestosDetalle: parsePuestosDetalle(row.puestos_patente_codes),
              total_puestos:       row.total_puestos || 0,
              puestos_con_patente: row.puestos_con_patente || 0,
              estado:              'Activo',
              telefono:            row.telefono,
              direccion:           row.direccion,
              fechaRegistro:       row.fecha_afiliacion,
              url_perfil:          row.url_perfil || '/assets/perfiles/sinPerfil.png',
              edad:                calcularEdad(row.fecNac),
              sexo:                row.sexo === 'M' ? 'Masculino' : 'Femenino',
              fecha_afiliacion:    row.fecha_afiliacion,
            })));
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
      // Los deshabilitados ya no tienen tenencias (se borran al deshabilitar)
      // pero dejamos el LEFT JOIN por si hay datos históricos edge-case
      let query = `
        SELECT a.*
        FROM afiliado a
        WHERE a.es_habilitado = 0
      `;
      const queryParams = [];

      if (params.search) {
        query += ` AND (
          a.paterno LIKE ? OR a.nombre LIKE ? OR a.materno LIKE ? OR
          a.ci LIKE ? OR a.ocupacion LIKE ?
        )`;
        const t = `%${params.search}%`;
        queryParams.push(t, t, t, t, t);
      }

      query += params.orden === 'registro'
        ? ` ORDER BY a.fecha_afiliacion ASC`
        : ` ORDER BY a.paterno, a.materno, a.nombre`;

      db.all(query, queryParams, (err, rows) => {
        if (err) { reject(err); return; }
        resolve(rows.map(row => ({
          id:                  row.id_afiliado,
          nombre:              `${row.nombre} ${row.paterno} ${row.materno || ''}`.trim(),
          ci:                  `${row.ci}-${row.extension}`,
          ocupacion:           row.ocupacion,
          puestos:             [],
          total_puestos:       0,
          puestos_con_patente: 0,
          estado:              'Deshabilitado',
          telefono:            row.telefono,
          direccion:           row.direccion,
          fechaRegistro:       row.fecha_afiliacion,
          url_perfil:          row.url_perfil || '/assets/perfiles/sinPerfil.png',
          edad:                calcularEdad(row.fecNac),
          sexo:                row.sexo === 'M' ? 'Masculino' : 'Femenino',
          fecha_afiliacion:    row.fecha_afiliacion,
          es_habilitado:       0,
        })));
      });
    });
  },


  // ============================================
  // OBTENER POR ID
  // ============================================
  obtenerPorId: (id) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM afiliado WHERE id_afiliado = ?`,
        [id],
        (err, afiliado) => {
          if (err) { reject(err); return; }
          if (!afiliado) { resolve(null); return; }

          // Puestos activos (los que tienen fila en tenencia_puesto)
          db.all(`
            SELECT p.*, tp.fecha_ini, tp.razon, tp.id_tenencia
            FROM puesto p
            JOIN tenencia_puesto tp ON p.id_puesto = tp.id_puesto
            WHERE tp.id_afiliado = ?
            ORDER BY p.fila, p.nroPuesto
          `, [id], (err, puestos) => {
            if (err) { reject(err); return; }

            resolve({
              id:              afiliado.id_afiliado,
              nombre:          afiliado.nombre,
              paterno:         afiliado.paterno,
              materno:         afiliado.materno,
              nombreCompleto:  `${afiliado.nombre} ${afiliado.paterno} ${afiliado.materno || ''}`.trim(),
              ci:              `${afiliado.ci}-${afiliado.extension}`,
              ci_numero:       afiliado.ci,
              extension:       afiliado.extension,
              sexo:            afiliado.sexo === 'M' ? 'Masculino' : 'Femenino',
              fecNac:          afiliado.fecNac,
              edad:            calcularEdad(afiliado.fecNac),
              telefono:        afiliado.telefono,
              ocupacion:       afiliado.ocupacion,
              direccion:       afiliado.direccion,
              url_perfil:      afiliado.url_perfil || '/assets/perfiles/sinPerfil.png',
              fecha_afiliacion:afiliado.fecha_afiliacion,
              es_habilitado:   afiliado.es_habilitado,
              puestos:        puestos.map(p => `${p.nroPuesto}-${p.fila}-${p.cuadra}`),
              patentes: puestos.map(p => ({
                label:        `${p.nroPuesto}-${p.fila}-${p.cuadra}`,
                tienePatente: p.tiene_patente === 1 || p.nro_patente != null,
              })),
              historial_puestos: puestos.map(p => ({
                id_puesto:     p.id_puesto,
                id_tenencia:   p.id_tenencia,
                nroPuesto:     p.nroPuesto,
                fila:          p.fila,
                cuadra:        p.cuadra,
                ancho:         p.ancho,
                largo:         p.largo,
                tiene_patente: p.tiene_patente,
                nro_patente:   p.nro_patente,
                rubro:         p.rubro,
                fecha_ini:     p.fecha_ini,
                razon:         p.razon,
              })),
            });
          });
        }
      );
    });
  },


  // ============================================
  // CREAR
  // ============================================
  crear: (datos) => {
    return new Promise((resolve, reject) => {
      const {
        ci, extension = 'LP', nombre, paterno, materno = '',
        sexo, fecNac, telefono, ocupacion, direccion,
      } = datos;

      db.run(`
        INSERT INTO afiliado
        (ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [ci, extension, nombre, paterno, materno, sexo, fecNac, telefono, ocupacion, direccion],
      function (err) {
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
        sexo, fecNac, telefono, ocupacion, direccion, es_habilitado,
      } = datos;

      db.run(`
        UPDATE afiliado
        SET ci = ?, extension = ?, nombre = ?, paterno = ?, materno = ?,
            sexo = ?, fecNac = ?, telefono = ?, ocupacion = ?, direccion = ?,
            es_habilitado = ?
        WHERE id_afiliado = ?
      `, [ci, extension, nombre, paterno, materno, sexo, fecNac,
          telefono, ocupacion, direccion, es_habilitado ? 1 : 0, id],
      function (err) {
        if (err) { reject(err); return; }
        if (this.changes === 0) { reject(new Error('Afiliado no encontrado')); return; }
        resolve({ id, ...datos });
      });
    });
  },


  // ============================================
  // DESHABILITAR
  // El trigger trg_afiliado_deshabilitado hace DELETE de las
  // tenencias automáticamente, disparando trg_puesto_delete
  // por cada fila para grabar el historial.
  // ============================================
  deshabilitar: (id, esHabilitado) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE afiliado SET es_habilitado = ? WHERE id_afiliado = ?`,
        [esHabilitado, id],
        function (err) {
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
        `UPDATE afiliado SET es_habilitado = 1, fecha_afiliacion = CURRENT_DATE
         WHERE id_afiliado = ?`,
        [id],
        function (err) {
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
  // ============================================
buscar: (termino) => {
  return new Promise((resolve, reject) => {
    if (!termino || !termino.trim()) return resolve([]);

    const palabras = termino.trim().split(/\s+/); // separa por espacios
    const queryParams = [];
    let whereClauses = palabras.map(() => 
      `(nombre LIKE ? OR paterno LIKE ? OR IFNULL(materno,'') LIKE ? OR ci LIKE ?)`
    ).join(' AND '); // todas las palabras deben coincidir

    palabras.forEach(p => {
      const like = `%${p}%`;
      queryParams.push(like, like, like, like); // nombre, paterno, materno, ci
    });

    const sql = `
      SELECT id_afiliado, ci, nombre, paterno, materno, url_perfil
      FROM afiliado
      WHERE es_habilitado = 1
        AND ${whereClauses}
      LIMIT 10
    `;

    db.all(sql, queryParams, (err, rows) => {
      if (err) return reject(err);
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
        SELECT p.*,
               tp.fecha_ini, tp.razon, tp.id_tenencia
        FROM puesto p
        JOIN tenencia_puesto tp ON tp.id_puesto = p.id_puesto
        WHERE tp.id_afiliado = ?
        ORDER BY p.fila, p.nroPuesto
      `, [id], (err, rows) => {
        if (err) { reject(err); return; }
        resolve(rows);
      });
    });
  },


  // ============================================
  // ASIGNAR PUESTO
  // Inserta en tenencia_puesto. El UNIQUE(id_puesto) en la tabla
  // garantiza a nivel BD que no haya dos dueños simultáneos.
  // ============================================
  asignarPuesto: (idAfiliado, datos) => {
    return new Promise((resolve, reject) => {
      // ✅ PARCHE: se desestructura nro_patente
      const { fila, cuadra, nroPuesto, rubro, tiene_patente, nro_patente, razon } = datos;
      
      console.log(fila, cuadra, nroPuesto);
      
      db.get(
        `SELECT id_puesto, disponible FROM puesto
         WHERE fila = ? AND cuadra = ? AND nroPuesto = ?`,
        [fila, cuadra, nroPuesto],
        (err, puesto) => {
          if (err)             { reject(err); return; }
          if (!puesto)         { reject(new Error('Puesto no encontrado')); return; }
          if (!puesto.disponible) { reject(new Error('El puesto no está disponible')); return; }
 
          db.get(
            `SELECT id_tenencia FROM tenencia_puesto WHERE id_puesto = ?`,
            [puesto.id_puesto],
            (err, tenenciaActiva) => {
              if (err)          { reject(err); return; }
              if (tenenciaActiva) { reject(new Error('El puesto ya está ocupado')); return; }
 
              const idPuesto = puesto.id_puesto;
 
              db.serialize(() => {
                db.run('BEGIN TRANSACTION');
 
                // ✅ PARCHE: el UPDATE ahora incluye nro_patente
                // Si tiene_patente es false → nro_patente se guarda como NULL
                db.run(
                  `UPDATE puesto
                   SET rubro = ?, tiene_patente = ?, nro_patente = ?
                   WHERE id_puesto = ?`,
                  [
                    rubro || null,
                    tiene_patente ? 1 : 0,
                    tiene_patente ? (nro_patente || null) : null,
                    idPuesto,
                  ],
                  (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(new Error('Error al actualizar datos del puesto'));
                      return;
                    }
 
                    db.run(
                      `INSERT INTO tenencia_puesto (id_afiliado, id_puesto, razon, fecha_ini)
                       VALUES (?, ?, ?, CURRENT_DATE)`,
                      [idAfiliado, idPuesto, razon || 'ASIGNADO'],
                      function (err) {
                        if (err) {
                          db.run('ROLLBACK');
                          reject(new Error('Error al registrar la tenencia'));
                          return;
                        }
 
                        const idTenencia = this.lastID;
 
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
  // DELETE de la tenencia. El trigger BEFORE DELETE graba
  // el historial con la razón que le pasemos.
  // Luego liberamos el puesto (disponible = 1).
  // ============================================
  despojarPuesto: (idAfiliado, idPuesto, razon) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Actualizar razón ANTES del DELETE para que el trigger la lea
        db.run(
          `UPDATE tenencia_puesto SET razon = ?
           WHERE id_afiliado = ? AND id_puesto = ?`,
          [razon, idAfiliado, idPuesto],
          function (err) {
            if (err) { db.run('ROLLBACK'); reject(err); return; }
            if (this.changes === 0) {
              db.run('ROLLBACK');
              reject(new Error('No se encontró una tenencia activa para este puesto y afiliado'));
              return;
            }

            // DELETE dispara trg_puesto_delete que graba historial
            db.run(
              `DELETE FROM tenencia_puesto
               WHERE id_afiliado = ? AND id_puesto = ?`,
              [idAfiliado, idPuesto],
              (err) => {
                if (err) { db.run('ROLLBACK'); reject(err); return; }

                // Liberar puesto
                db.run(
                  `UPDATE puesto SET disponible = 1 WHERE id_puesto = ?`,
                  [idPuesto],
                  (err) => {
                    if (err) { db.run('ROLLBACK'); reject(err); return; }
                    db.run('COMMIT');
                    resolve({ id_puesto: idPuesto, id_afiliado: idAfiliado, razon });
                  }
                );
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
        `UPDATE afiliado SET url_perfil = ? WHERE id_afiliado = ?`,
        [url, id],
        function (err) {
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
      db.all(
        `SELECT DISTINCT rubro FROM puesto
         WHERE rubro IS NOT NULL AND rubro != ''
         ORDER BY rubro`,
        [],
        (err, rows) => {
          if (err) { reject(err); return; }
          resolve(rows.map(r => r.rubro).filter(Boolean));
        }
      );
    });
  },


  // ============================================
  // OBTENER ESTADÍSTICAS
  // ============================================
  obtenerEstadisticas: () => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT
          COUNT(DISTINCT a.id_afiliado) as total_afiliados,
          COUNT(DISTINCT CASE WHEN p.tiene_patente = 1 THEN p.id_puesto END) as puestos_con_patente,
          COUNT(DISTINCT CASE WHEN p.tiene_patente = 0 THEN p.id_puesto END) as puestos_sin_patente,
          COUNT(DISTINCT CASE WHEN tp.id_afiliado IS NOT NULL THEN p.id_puesto END) as puestos_ocupados
        FROM afiliado a
        LEFT JOIN tenencia_puesto tp ON a.id_afiliado = tp.id_afiliado
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
// FUNCIÓN AUXILIAR (privada)
// ============================================
function calcularEdad(fecNac) {
  if (!fecNac) return null;
  const hoy        = new Date();
  const nacimiento = new Date(fecNac);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}
function parsePuestosDetalle(codes) {
  if (!codes) return [];
  const seen = new Set();
  return codes.split(',').filter(Boolean).reduce((acc, code) => {
    const i     = code.lastIndexOf(':');
    const label = code.substring(0, i);
    if (seen.has(label)) return acc;
    seen.add(label);
    acc.push({ label, tienePatente: code.substring(i + 1) === '1' });
    return acc;
  }, []);
}
module.exports = Afiliado;