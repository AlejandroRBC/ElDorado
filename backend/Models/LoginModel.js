// backend/models/LoginModel.js

// ============================================
// MODELO — AUTENTICACIÓN
// ============================================

const db = require('../config/db');

/**
 * Busca un usuario por nombre de usuario incluyendo su nombre de afiliado.
 */
const buscarUsuarioPorNombre = (usuarioLimpio, callback) => {
  const query = `
    SELECT 
      u.id_usuario,
      u.nom_usuario,
      u.password,
      u.rol,
      u.es_vigente,
      u.fecha_fin_usuario,
      a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nom_afiliado
    FROM usuario u
    LEFT JOIN afiliado a ON u.id_afiliado = a.id_afiliado  
    WHERE u.nom_usuario = ?
  `;
  db.get(query, [usuarioLimpio], callback);
};

/**
 * Guarda o reemplaza la sesión activa del usuario master en la BD.
 */
const guardarSesionMaster = (idUsuario, nomUsuario, nomAfiliado) => {
  db.run(
    `INSERT OR REPLACE INTO usuario_sesion 
     (id, id_usuario_master, nom_usuario_master, nom_afiliado_master)
     VALUES (1, ?, ?, ?)`,
    [idUsuario, nomUsuario, nomAfiliado || 'SISTEMA']
  );
};

module.exports = { buscarUsuarioPorNombre, guardarSesionMaster };