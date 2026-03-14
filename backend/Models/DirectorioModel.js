const db = require('../config/db');

const Directorio = {

  // ============================================
  // OBTENER TODAS LAS SECRETARÍAS (catálogo fijo)
  // ============================================
  obtenerSecretarias: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id_secretaria, nombre, orden FROM secretaria ORDER BY orden ASC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },


  // ============================================
  // OBTENER TODAS LAS GESTIONES
  // ============================================
  obtenerGestiones: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id_gestion, anio_inicio, anio_fin, es_activa FROM gestion ORDER BY anio_inicio DESC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },


  // ============================================
  // OBTENER GESTIÓN ACTIVA
  // ============================================
  obtenerGestionActiva: () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id_gestion, anio_inicio, anio_fin FROM gestion WHERE es_activa = 1 LIMIT 1`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  },


  // ============================================
  // OBTENER DIRECTORIO COMPLETO DE UNA GESTIÓN
  // ============================================
  obtenerPorGestion: (idGestion) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          d.id_directorio,
          d.id_afiliado,
          d.id_secretaria,
          d.id_gestion,
          d.fecha_inicio,
          d.fecha_fin,
          a.nombre || ' ' || a.paterno || COALESCE(' ' || NULLIF(a.materno,''), '') AS nom_afiliado,
          a.ci,
          a.extension,
          a.url_perfil,
          s.nombre  AS nom_secretaria,
          s.orden   AS orden_secretaria,
          g.anio_inicio,
          g.anio_fin,
          g.es_activa AS gestion_activa
        FROM directorio d
        JOIN afiliado   a ON a.id_afiliado   = d.id_afiliado
        JOIN secretaria s ON s.id_secretaria = d.id_secretaria
        JOIN gestion    g ON g.id_gestion    = d.id_gestion
        WHERE d.id_gestion = ?
        ORDER BY s.orden ASC
      `;
      db.all(sql, [idGestion], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },


  // ============================================
  // OBTENER UN CARGO POR ID
  // ============================================
  obtenerPorId: (idDirectorio) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          d.*,
          a.nombre || ' ' || a.paterno || COALESCE(' ' || NULLIF(a.materno,''), '') AS nom_afiliado,
          a.ci, a.extension, a.es_habilitado,
          s.nombre AS nom_secretaria,
          g.anio_inicio, g.anio_fin, g.es_activa AS gestion_activa
        FROM directorio d
        JOIN afiliado   a ON a.id_afiliado   = d.id_afiliado
        JOIN secretaria s ON s.id_secretaria = d.id_secretaria
        JOIN gestion    g ON g.id_gestion    = d.id_gestion
        WHERE d.id_directorio = ?
      `;
      db.get(sql, [idDirectorio], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  },


  // ============================================
  // ASIGNAR CARGO EN EL DIRECTORIO
  // Valida: afiliado vigente, secretaría libre en la gestión,
  //         afiliado sin otro cargo en la misma gestión
  // ============================================
  asignarCargo: ({ id_gestion, id_secretaria, id_afiliado, fecha_inicio }) => {
    return new Promise((resolve, reject) => {

      // 1. Verificar que el afiliado esté habilitado
      db.get(
        `SELECT id_afiliado, es_habilitado FROM afiliado WHERE id_afiliado = ?`,
        [id_afiliado],
        (err, afiliado) => {
          if (err) return reject(err);
          if (!afiliado) return reject(new Error('Afiliado no encontrado'));
          if (!afiliado.es_habilitado)
            return reject(new Error('El afiliado no está vigente. Solo afiliados activos pueden integrar el Directorio'));

          // 2. Verificar que la secretaría no esté ocupada en esa gestión
          db.get(
            `SELECT id_directorio FROM directorio
             WHERE id_gestion = ? AND id_secretaria = ? AND fecha_fin IS NULL`,
            [id_gestion, id_secretaria],
            (err2, ocupado) => {
              if (err2) return reject(err2);
              if (ocupado)
                return reject(new Error('Esa secretaría ya tiene un titular en la gestión seleccionada'));

              // 3. Verificar que el afiliado no tenga ya un cargo activo en la gestión
              db.get(
                `SELECT id_directorio FROM directorio
                 WHERE id_gestion = ? AND id_afiliado = ? AND fecha_fin IS NULL`,
                [id_gestion, id_afiliado],
                (err3, yaEsta) => {
                  if (err3) return reject(err3);
                  if (yaEsta)
                    return reject(new Error('El afiliado ya ocupa un cargo en esta gestión'));

                  // 4. Insertar
                  db.run(
                    `INSERT INTO directorio (id_gestion, id_secretaria, id_afiliado, fecha_inicio)
                     VALUES (?, ?, ?, COALESCE(?, CURRENT_DATE))`,
                    [id_gestion, id_secretaria, id_afiliado, fecha_inicio || null],
                    function (err4) {
                      if (err4) return reject(err4);
                      resolve({ id_directorio: this.lastID });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  },


  // ============================================
  // CERRAR CARGO (registrar fecha_fin)
  // El trigger trg_directorio_egreso graba el historial automáticamente
  // ============================================
  cerrarCargo: (idDirectorio, fechaFin) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id_directorio, fecha_fin FROM directorio WHERE id_directorio = ?`,
        [idDirectorio],
        (err, cargo) => {
          if (err) return reject(err);
          if (!cargo) return reject(new Error('Cargo no encontrado'));
          if (cargo.fecha_fin)
            return reject(new Error('Este cargo ya fue cerrado anteriormente'));

          db.run(
            `UPDATE directorio
             SET fecha_fin = COALESCE(?, CURRENT_DATE)
             WHERE id_directorio = ?`,
            [fechaFin || null, idDirectorio],
            function (err2) {
              if (err2) return reject(err2);
              resolve({ id_directorio: idDirectorio });
            }
          );
        }
      );
    });
  },


  // ============================================
  // REEMPLAZAR CARGO (cerrar uno y abrir otro en la misma secretaría)
  // Operación atómica con serialize
  // ============================================
  reemplazarCargo: ({ idDirectorioSaliente, id_afiliado_nuevo, fecha_cambio }) => {
    return new Promise((resolve, reject) => {

      db.get(
        `SELECT d.id_gestion, d.id_secretaria, a.es_habilitado
         FROM directorio d
         JOIN afiliado a ON a.id_afiliado = ?
         WHERE d.id_directorio = ? AND d.fecha_fin IS NULL`,
        [id_afiliado_nuevo, idDirectorioSaliente],
        (err, fila) => {
          if (err) return reject(err);
          if (!fila) return reject(new Error('Cargo activo no encontrado'));
          if (!fila.es_habilitado)
            return reject(new Error('El afiliado entrante no está vigente'));

          db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            db.run(
              `UPDATE directorio SET fecha_fin = COALESCE(?, CURRENT_DATE)
               WHERE id_directorio = ?`,
              [fecha_cambio || null, idDirectorioSaliente],
              (err2) => {
                if (err2) { db.run('ROLLBACK'); return reject(err2); }

                db.run(
                  `INSERT INTO directorio (id_gestion, id_secretaria, id_afiliado, fecha_inicio)
                   VALUES (?, ?, ?, COALESCE(?, CURRENT_DATE))`,
                  [fila.id_gestion, fila.id_secretaria, id_afiliado_nuevo, fecha_cambio || null],
                  function (err3) {
                    if (err3) { db.run('ROLLBACK'); return reject(err3); }
                    db.run('COMMIT');
                    resolve({ id_directorio_nuevo: this.lastID });
                  }
                );
              }
            );
          });
        }
      );
    });
  },


  // ============================================
  // HISTORIAL DE UN AFILIADO EN EL DIRECTORIO
  // ============================================
  obtenerHistorialAfiliado: (idAfiliado) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          hd.id_historial_dir,
          hd.tipo,
          hd.nom_secretaria,
          hd.gestion_label,
          hd.fecha,
          hd.hora,
          hd.nom_usuario_master,
          hd.nom_afiliado_master
        FROM historial_directorio hd
        JOIN directorio d ON d.id_directorio = hd.id_directorio
        WHERE d.id_afiliado = ?
        ORDER BY hd.fecha DESC, hd.id_historial_dir DESC
      `;
      db.all(sql, [idAfiliado], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },


  // ============================================
  // HISTORIAL COMPLETO DEL DIRECTORIO (con filtros)
  // ============================================
  obtenerHistorialCompleto: ({ id_gestion, tipo, limite = 200 } = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT
          hd.*,
          d.id_afiliado
        FROM historial_directorio hd
        JOIN directorio d ON d.id_directorio = hd.id_directorio
        WHERE 1=1
      `;
      const params = [];

      if (id_gestion) {
        sql += ` AND d.id_gestion = ?`;
        params.push(id_gestion);
      }
      if (tipo) {
        sql += ` AND hd.tipo = ?`;
        params.push(tipo);
      }

      sql += ` ORDER BY hd.fecha DESC, hd.id_historial_dir DESC LIMIT ?`;
      params.push(parseInt(limite));

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

};

module.exports = Directorio;