const db = require('../config/db');

const Directorio = {

  // ============================================
  // CATÁLOGOS
  // ============================================

  obtenerSecretarias: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id_secretaria, nombre, orden FROM secretaria ORDER BY orden ASC`,
        [],
        (err, rows) => { if (err) reject(err); else resolve(rows); }
      );
    });
  },

  obtenerGestiones: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id_gestion, anio_inicio, anio_fin, es_activa
         FROM gestion ORDER BY anio_inicio DESC`,
        [],
        (err, rows) => { if (err) reject(err); else resolve(rows); }
      );
    });
  },

  obtenerGestionActiva: () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id_gestion, anio_inicio, anio_fin
         FROM gestion WHERE es_activa = 1 LIMIT 1`,
        [],
        (err, row) => { if (err) reject(err); else resolve(row || null); }
      );
    });
  },

  // ============================================
  // DIRECTORIO POR GESTIÓN
  // Sin fecha_fin: las filas existentes = titulares activos.
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
  // ASIGNAR CARGO
  // Valida: afiliado vigente, secretaría libre, afiliado sin doble cargo
  // ============================================

  asignarCargo: ({ id_gestion, id_secretaria, id_afiliado, fecha_inicio }) => {
    return new Promise((resolve, reject) => {

      db.get(
        `SELECT id_afiliado, es_habilitado FROM afiliado WHERE id_afiliado = ?`,
        [id_afiliado],
        (err, afiliado) => {
          if (err) return reject(err);
          if (!afiliado) return reject(new Error('Afiliado no encontrado'));
          if (!afiliado.es_habilitado)
            return reject(new Error('El afiliado no está vigente. Solo afiliados activos pueden integrar el Directorio'));

          db.get(
            `SELECT id_directorio FROM directorio
             WHERE id_gestion = ? AND id_secretaria = ?`,
            [id_gestion, id_secretaria],
            (err2, ocupado) => {
              if (err2) return reject(err2);
              if (ocupado)
                return reject(new Error('Esa secretaría ya tiene un titular en la gestión seleccionada'));

              db.get(
                `SELECT id_directorio FROM directorio
                 WHERE id_gestion = ? AND id_afiliado = ?`,
                [id_gestion, id_afiliado],
                (err3, yaEsta) => {
                  if (err3) return reject(err3);
                  if (yaEsta)
                    return reject(new Error('El afiliado ya ocupa un cargo en esta gestión'));

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
  // ELIMINAR CARGO
  // DELETE puro. El trigger BEFORE DELETE graba el EGRESO
  // en historial_directorio antes de borrar la fila.
  // Reemplaza a cerrarCargo y reemplazarCargo.
  // ============================================

  eliminarCargo: (idDirectorio) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id_directorio FROM directorio WHERE id_directorio = ?`,
        [idDirectorio],
        (err, cargo) => {
          if (err) return reject(err);
          if (!cargo) return reject(new Error('Cargo no encontrado'));

          db.run(
            `DELETE FROM directorio WHERE id_directorio = ?`,
            [idDirectorio],
            function (err2) {
              if (err2) return reject(err2);
              resolve({ id_directorio: idDirectorio, eliminado: true });
            }
          );
        }
      );
    });
  },

  // ============================================
  // HISTORIAL DE UN AFILIADO EN EL DIRECTORIO
  // Usa id_afiliado directo (no JOIN a directorio que puede no existir)
  // ============================================

  obtenerHistorialAfiliado: (idAfiliado) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          id_historial_dir,
          id_directorio,
          id_afiliado,
          id_gestion,
          nom_afiliado,
          nom_secretaria,
          gestion_label,
          tipo,
          fecha,
          hora,
          nom_usuario_master,
          nom_afiliado_master
        FROM historial_directorio
        WHERE id_afiliado = ?
        ORDER BY fecha DESC, id_historial_dir DESC
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
      let sql    = `SELECT * FROM historial_directorio WHERE 1=1`;
      const params = [];

      if (id_gestion) {
        sql += ` AND id_gestion = ?`;
        params.push(id_gestion);
      }
      if (tipo) {
        sql += ` AND tipo = ?`;
        params.push(tipo);
      }

      sql += ` ORDER BY fecha DESC, id_historial_dir DESC LIMIT ?`;
      params.push(parseInt(limite));

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

};

module.exports = Directorio;