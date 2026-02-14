const db = require('../config/db');
const bcrypt = require('bcrypt');

// ============================================
// HELPERS
// ============================================

/**
 * Guarda el usuario master en la tabla usuario_sesion
 * para que los triggers puedan registrar quién hizo la acción
 */
function setUsuarioSesion(master) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO usuario_sesion 
       (id, id_usuario_master, nom_usuario_master, nom_afiliado_master)
       VALUES (1, ?, ?, ?)`,
      [master.id_usuario, master.nom_usuario, master.nom_afiliado || null],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

/**
 * Formatea usuario mostrando "VIGENTE" en fecha_fin si está activo
 */
function formatearUsuario(usuario) {
  if (!usuario) return null;
  
  return {
    ...usuario,
    fecha_fin_usuario: usuario.es_vigente ? 'VIGENTE' : usuario.fecha_fin_usuario
  };
}

/**
 * Obtiene usuario completo con datos del afiliado
 */
function obtenerUsuarioCompleto(id_usuario) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        u.id_usuario,
        u.id_afiliado,
        u.rol,
        u.nom_usuario,
        u.fecha_ini_usuario,
        u.fecha_fin_usuario,
        u.es_vigente,
        u.created_at,
        u.updated_at,
        a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nombre_completo_afiliado
      FROM usuario u
      LEFT JOIN afiliado a ON u.id_afiliado = a.id_afiliado
      WHERE u.id_usuario = ?`,
      [id_usuario],
      (err, row) => {
        if (err) reject(err);
        else resolve(formatearUsuario(row));
      }
    );
  });
}

// ============================================
// OBTENER USUARIO POR ID
// ============================================
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await obtenerUsuarioCompleto(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ============================================
// CREAR USUARIO
// ============================================
const crearUsuario = async (req, res) => {
  try {
    const { id_afiliado, rol, nom_usuario, password } = req.body;
    const master = req.user;

    if (!id_afiliado || !rol || !nom_usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const afiliado = await new Promise((resolve, reject) => {
      db.get(`SELECT id_afiliado FROM afiliado WHERE id_afiliado = ?`, [id_afiliado], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!afiliado) {
      return res.status(404).json({
        success: false,
        message: 'El afiliado no existe'
      });
    }

    const existe = await new Promise((resolve, reject) => {
      db.get(`SELECT id_usuario FROM usuario WHERE nom_usuario = ?`, [nom_usuario], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está registrado'
      });
    }

    await setUsuarioSesion(master);

    const hash = await bcrypt.hash(password, 10);
    
    const nuevoId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO usuario (id_afiliado, rol, nom_usuario, password, es_vigente)
         VALUES (?, ?, ?, ?, 1)`,
        [id_afiliado, rol, nom_usuario, hash],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const usuarioCompleto = await obtenerUsuarioCompleto(nuevoId);

    res.json({
      success: true,
      message: 'Usuario creado correctamente',
      data: usuarioCompleto
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ============================================
// ACTUALIZAR USUARIO
// ============================================
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, nom_usuario, password } = req.body;
    const master = req.user;

    if (!rol || !nom_usuario) {
      return res.status(400).json({
        success: false,
        message: 'rol y nombre de usuario son obligatorios'
      });
    }

    const usuarioActual = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM usuario WHERE id_usuario = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!usuarioActual) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (nom_usuario !== usuarioActual.nom_usuario) {
      const existe = await new Promise((resolve, reject) => {
        db.get(
          `SELECT id_usuario FROM usuario WHERE nom_usuario = ? AND id_usuario != ?`,
          [nom_usuario, id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existe) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está registrado'
        });
      }
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    await setUsuarioSesion(master);

    let query = `UPDATE usuario SET id_afiliado = ?, rol = ?, nom_usuario = ?, updated_at = CURRENT_TIMESTAMP`;
    let params = [id_afiliado, rol, nom_usuario];
    
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      params.push(hash);
    }
    
    query += ` WHERE id_usuario = ?`;
    params.push(id);

    await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    const usuarioCompleto = await obtenerUsuarioCompleto(id);

    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: usuarioCompleto
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ============================================
// DESACTIVAR USUARIO
// ============================================
const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const master = req.user;

    if (parseInt(id) === master.id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propio usuario'
      });
    }

    await setUsuarioSesion(master);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE usuario 
         SET es_vigente = 0, 
             fecha_fin_usuario = CURRENT_DATE,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_usuario = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const usuarioDesactivado = await obtenerUsuarioCompleto(id);

    res.json({
      success: true,
      message: 'Usuario desactivado correctamente',
      data: usuarioDesactivado
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ============================================
// REACTIVAR USUARIO
// ============================================
const reactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const master = req.user;

    await setUsuarioSesion(master);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE usuario 
         SET es_vigente = 1, 
             fecha_fin_usuario = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_usuario = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const usuarioReactivado = await obtenerUsuarioCompleto(id);

    res.json({
      success: true,
      message: 'Usuario reactivado correctamente',
      data: usuarioReactivado
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ============================================
// LISTAR HISTORIAL DE USUARIO
// ============================================
const listarHistorialUsuario = (req, res) => {
  try {
    const { id_usuario, desde, hasta, limite = 100 } = req.query;
    
    let query = `
      SELECT 
        h.id_historial_usu,
        h.id_usuario,
        h.nom_usuario_esclavo,
        a_esclavo.nombre || ' ' || a_esclavo.paterno || COALESCE(' ' || a_esclavo.materno, '') AS nom_afiliado_esclavo,
        h.rol,
        h.fecha,
        h.hora,
        h.motivo,
        h.nom_usuario_master,
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

    if (id_usuario) {
      query += ` AND h.id_usuario = ?`;
      params.push(id_usuario);
    }

    if (desde) {
      query += ` AND h.fecha >= ?`;
      params.push(desde);
    }

    if (hasta) {
      query += ` AND h.fecha <= ?`;
      params.push(hasta);
    }

    query += ` ORDER BY h.fecha DESC, h.hora DESC LIMIT ?`;
    params.push(parseInt(limite));

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        data: rows,
        total: rows.length
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ============================================
// LISTAR USUARIOS
// ============================================
const listarUsuarios = (req, res) => {
  try {
    const { estado } = req.query;
    
    let whereClause = '';
    if (estado === 'activo') whereClause = 'WHERE u.es_vigente = 1';
    if (estado === 'inactivo') whereClause = 'WHERE u.es_vigente = 0';

    const query = `
      SELECT 
        u.id_usuario,
        u.id_afiliado,
        u.nom_usuario,
        u.rol,
        u.es_vigente,
        u.fecha_ini_usuario,
        CASE 
          WHEN u.es_vigente = 1 THEN 'VIGENTE'
          ELSE u.fecha_fin_usuario
        END AS fecha_fin_usuario,
        a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nombre_completo_afiliado
      FROM usuario u
      LEFT JOIN afiliado a ON u.id_afiliado = a.id_afiliado
      ${whereClause}
      ORDER BY u.id_usuario DESC
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }
      res.json({ 
        success: true, 
        data: rows 
      });
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ============================================
// OBTENER AFILIADOS PARA SELECT
// ============================================
const obtenerAfiliadosParaSelect = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT 
        a.id_afiliado,
        a.ci,
        a.extension,
        a.nombre,
        a.paterno,
        a.materno,
        a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nombre_completo
      FROM afiliado a
      WHERE a.es_habilitado = 1
    `;
    
    let params = [];

    if (search && search.trim() !== '') {
      query += ` AND (
        a.nombre LIKE ? OR 
        a.paterno LIKE ? OR 
        a.materno LIKE ? OR 
        a.ci LIKE ?
      )`;
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY a.nombre ASC, a.paterno ASC LIMIT 100`;

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      const afiliadosFormateados = rows.map(afiliado => ({
        value: afiliado.id_afiliado,
        label: afiliado.nombre_completo,
        searchText: `${afiliado.ci} ${afiliado.extension} - ${afiliado.nombre_completo}`,
        ci: afiliado.ci,
        extension: afiliado.extension
      }));

      res.json({
        success: true,
        data: afiliadosFormateados
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ============================================
// OBTENER AFILIADO POR ID
// ============================================
const obtenerAfiliadoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        a.id_afiliado,
        a.ci,
        a.extension,
        a.nombre,
        a.paterno,
        a.materno,
        a.nombre || ' ' || a.paterno || COALESCE(' ' || a.materno, '') AS nombre_completo
      FROM afiliado a
      WHERE a.id_afiliado = ? AND a.es_habilitado = 1
    `;

    db.get(query, [id], (err, row) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Afiliado no encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          value: row.id_afiliado,
          label: row.nombre_completo,
          ci: row.ci,
          extension: row.extension
        }
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  reactivarUsuario,
  listarHistorialUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  obtenerAfiliadosParaSelect,
  obtenerAfiliadoPorId
};