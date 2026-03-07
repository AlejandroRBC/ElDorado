// backend/models/UsuarioModel.js

// ============================================
// MODELO — USUARIOS
// ============================================

const db = require('../config/db');

/**
 * Ejecuta setUsuarioSesion + operación de escritura en una sola transacción.
 * Garantiza que el trigger siempre lea el master correcto sin race conditions.
 */
function ejecutarConTransaccion(master, operacion) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) return reject(err);

        // ── Escribir master en usuario_sesion ──
        db.run(
          `INSERT OR REPLACE INTO usuario_sesion
           (id, id_usuario_master, nom_usuario_master, nom_afiliado_master)
           VALUES (1, ?, ?, ?)`,
          [master.id_usuario, master.nom_usuario, master.nom_afiliado || null],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            // ── Ejecutar la operación (INSERT / UPDATE) ──
            operacion((err, resultado) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              db.run('COMMIT', (err) => {
                if (err) reject(err);
                else resolve(resultado);
              });
            });
          }
        );
      });
    });
  });
}

/**
 * Formatea un usuario mostrando 'VIGENTE' en fecha_fin si está activo.
 */
function formatearUsuario(usuario) {
  if (!usuario) return null;
  return {
    ...usuario,
    fecha_fin_usuario: usuario.es_vigente ? 'VIGENTE' : usuario.fecha_fin_usuario
  };
}

/**
 * Obtiene un usuario completo con datos de su afiliado asociado.
 */
function obtenerUsuarioCompleto(id_usuario) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        u.id_usuario, u.id_afiliado, u.rol, u.nom_usuario,
        u.fecha_ini_usuario, u.fecha_fin_usuario, u.es_vigente,
        u.created_at, u.updated_at,
        a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nombre_completo_afiliado
       FROM usuario u
       LEFT JOIN afiliado a ON u.id_afiliado = a.id_afiliado
       WHERE u.id_usuario = ?`,
      [id_usuario],
      (err, row) => { if (err) reject(err); else resolve(formatearUsuario(row)); }
    );
  });
}

/**
 * Busca un usuario por su ID.
 */
function buscarUsuarioPorId(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM usuario WHERE id_usuario = ?`, [id],
      (err, row) => { if (err) reject(err); else resolve(row); }
    );
  });
}

/**
 * Busca un usuario por nombre de usuario, excluyendo opcionalmente un ID.
 */
function buscarUsuarioPorNombre(nomUsuario, excluirId = null) {
  return new Promise((resolve, reject) => {
    const query = excluirId
      ? `SELECT id_usuario FROM usuario WHERE nom_usuario = ? AND id_usuario != ?`
      : `SELECT id_usuario FROM usuario WHERE nom_usuario = ?`;
    const params = excluirId ? [nomUsuario, excluirId] : [nomUsuario];
    db.get(query, params, (err, row) => { if (err) reject(err); else resolve(row); });
  });
}

/**
 * Verifica si un afiliado ya tiene un usuario asignado.
 */
function buscarUsuarioPorAfiliado(id_afiliado) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id_usuario FROM usuario WHERE id_afiliado = ?`, [id_afiliado],
      (err, row) => { if (err) reject(err); else resolve(row); }
    );
  });
}

/**
 * Verifica si existe un afiliado por su ID.
 */
function buscarAfiliadoPorId(id_afiliado) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id_afiliado FROM afiliado WHERE id_afiliado = ?`, [id_afiliado],
      (err, row) => { if (err) reject(err); else resolve(row); }
    );
  });
}

/**
 * Inserta un nuevo usuario dentro de una transacción atómica con el master.
 * Garantiza que el trigger trg_usuario_insert lea el master correcto.
 */
function insertarUsuario(id_afiliado, rol, nom_usuario, hash, master) {
  return ejecutarConTransaccion(master, (callback) => {
    db.run(
      `INSERT INTO usuario (id_afiliado, rol, nom_usuario, password, es_vigente) VALUES (?, ?, ?, ?, 1)`,
      [id_afiliado, rol, nom_usuario, hash],
      function(err) { callback(err, this?.lastID); }
    );
  });
}

/**
 * Actualiza los datos de un usuario dentro de una transacción atómica con el master.
 * Garantiza que el trigger trg_usuario_update lea el master correcto.
 */
function actualizarUsuarioBD(id, id_afiliado, rol, nom_usuario, hash = null, master) {
  let query  = `UPDATE usuario SET id_afiliado = ?, rol = ?, nom_usuario = ?, updated_at = CURRENT_TIMESTAMP`;
  let params = [id_afiliado, rol, nom_usuario];
  if (hash) { query += `, password = ?`; params.push(hash); }
  query += ` WHERE id_usuario = ?`;
  params.push(id);

  return ejecutarConTransaccion(master, (callback) => {
    db.run(query, params, (err) => callback(err));
  });
}

/**
 * Desactiva un usuario dentro de una transacción atómica con el master.
 * Garantiza que el trigger trg_usuario_desactivar lea el master correcto.
 */
function desactivarUsuarioBD(id, master) {
  return ejecutarConTransaccion(master, (callback) => {
    db.run(
      `UPDATE usuario SET es_vigente = 0, fecha_fin_usuario = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?`,
      [id],
      (err) => callback(err)
    );
  });
}

/**
 * Reactiva un usuario dentro de una transacción atómica con el master.
 * Garantiza que el trigger trg_usuario_reactivar lea el master correcto.
 */
function reactivarUsuarioBD(id, master) {
  return ejecutarConTransaccion(master, (callback) => {
    db.run(
      `UPDATE usuario SET es_vigente = 1, fecha_fin_usuario = NULL, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?`,
      [id],
      (err) => callback(err)
    );
  });
}

/**
 * Lista todos los usuarios con datos de su afiliado, filtrable por estado.
 */
function listarUsuariosBD(estado) {
  let whereClause = '';
  if (estado === 'activo')   whereClause = 'WHERE u.es_vigente = 1';
  if (estado === 'inactivo') whereClause = 'WHERE u.es_vigente = 0';

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT u.id_usuario, u.id_afiliado, u.nom_usuario, u.rol, u.es_vigente,
              u.fecha_ini_usuario,
              CASE WHEN u.es_vigente = 1 THEN 'VIGENTE' ELSE u.fecha_fin_usuario END AS fecha_fin_usuario,
              a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nombre_completo_afiliado
       FROM usuario u
       LEFT JOIN afiliado a ON u.id_afiliado = a.id_afiliado
       ${whereClause}
       ORDER BY u.id_usuario DESC`,
      [],
      (err, rows) => { if (err) reject(err); else resolve(rows); }
    );
  });
}

/**
 * Lista el historial de cambios de usuarios con filtros opcionales.
 */
function listarHistorialBD(id_usuario, desde, hasta, limite) {
  let query = `
    SELECT 
      h.id_historial_usu, h.id_usuario, h.nom_usuario_esclavo,
      a_esclavo.nombre || ' ' || a_esclavo.paterno || COALESCE(' ' || a_esclavo.materno, '') AS nom_afiliado_esclavo,
      h.rol, h.fecha, h.hora, h.motivo, h.nom_usuario_master,
      COALESCE(
        a_master.nombre || ' ' || a_master.paterno || COALESCE(' ' || a_master.materno, ''),
        h.nom_afiliado_master
      ) AS nom_afiliado_master
    FROM historial_usuario h
    LEFT JOIN usuario u_esclavo ON h.id_usuario = u_esclavo.id_usuario
    LEFT JOIN afiliado a_esclavo ON u_esclavo.id_afiliado = a_esclavo.id_afiliado
    LEFT JOIN usuario u_master ON h.nom_usuario_master = u_master.nom_usuario
    LEFT JOIN afiliado a_master ON u_master.id_afiliado = a_master.id_afiliado
    WHERE 1=1
  `;
  let params = [];
  if (id_usuario) { query += ` AND h.id_usuario = ?`;  params.push(id_usuario); }
  if (desde)      { query += ` AND h.fecha >= ?`;       params.push(desde); }
  if (hasta)      { query += ` AND h.fecha <= ?`;       params.push(hasta); }
  query += ` ORDER BY h.fecha DESC, h.hora DESC LIMIT ?`;
  params.push(parseInt(limite));

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}

/**
 * Busca afiliados habilitados para el select del formulario de usuario.
 */
function buscarAfiliadosParaSelect(search) {
  let query = `
    SELECT a.id_afiliado, a.ci, a.extension, a.nombre, a.paterno, a.materno,
           a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nombre_completo
    FROM afiliado a
    WHERE a.es_habilitado = 1
  `;
  let params = [];
  if (search?.trim()) {
    query += ` AND (a.nombre LIKE ? OR a.paterno LIKE ? OR a.materno LIKE ? OR a.ci LIKE ?)`;
    const t = `%${search.trim()}%`;
    params.push(t, t, t, t);
  }
  query += ` ORDER BY a.nombre ASC, a.paterno ASC LIMIT 100`;

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}

/**
 * Obtiene un afiliado habilitado por su ID.
 */
function obtenerAfiliadoPorIdBD(id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT a.id_afiliado, a.ci, a.extension, a.nombre, a.paterno, a.materno,
              a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nombre_completo
       FROM afiliado a WHERE a.id_afiliado = ? AND a.es_habilitado = 1`,
      [id],
      (err, row) => { if (err) reject(err); else resolve(row); }
    );
  });
}

module.exports = {
  obtenerUsuarioCompleto,
  buscarUsuarioPorId,
  buscarUsuarioPorNombre,
  buscarUsuarioPorAfiliado,
  buscarAfiliadoPorId,
  insertarUsuario,
  actualizarUsuarioBD,
  desactivarUsuarioBD,
  reactivarUsuarioBD,
  listarUsuariosBD,
  listarHistorialBD,
  buscarAfiliadosParaSelect,
  obtenerAfiliadoPorIdBD,
};