// backend/controllers/UsuarioController.js

// ============================================
// CONTROLADOR — USUARIOS
// ============================================

const bcrypt = require('bcrypt');
const {
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
} = require('../Models/UsuarioModel');

/**
 * Retorna los datos completos de un usuario por su ID.
 */
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await obtenerUsuarioCompleto(req.params.id);
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Crea un nuevo usuario validando campos, afiliado existente y nombre único.
 * Pasa el master al modelo para garantizar atomicidad con el trigger.
 */
const crearUsuario = async (req, res) => {
  try {
    const { id_afiliado, rol, nom_usuario, password } = req.body;
    const master = req.user;

    if (!id_afiliado || !rol || !nom_usuario || !password)
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });

    if (!await buscarAfiliadoPorId(id_afiliado))
      return res.status(404).json({ success: false, message: 'El afiliado no existe' });

    // ── Verificar que el afiliado no tenga ya un usuario asignado ──
    if (await buscarUsuarioPorAfiliado(id_afiliado))
      return res.status(400).json({ success: false, message: 'Este afiliado ya tiene un usuario asignado' });

    if (await buscarUsuarioPorNombre(nom_usuario))
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya está registrado' });

    const hash     = await bcrypt.hash(password, 10);
    const nuevoId  = await insertarUsuario(id_afiliado, rol, nom_usuario, hash, master);
    const completo = await obtenerUsuarioCompleto(nuevoId);

    res.json({ success: true, message: 'Usuario creado correctamente', data: completo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Actualiza rol, nombre y opcionalmente la contraseña de un usuario existente.
 * Pasa el master al modelo para garantizar atomicidad con el trigger.
 */
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_afiliado, rol, nom_usuario, password } = req.body;
    const master = req.user;

    if (!rol || !nom_usuario)
      return res.status(400).json({ success: false, message: 'rol y nombre de usuario son obligatorios' });

    const usuarioActual = await buscarUsuarioPorId(id);
    if (!usuarioActual)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    if (nom_usuario !== usuarioActual.nom_usuario && await buscarUsuarioPorNombre(nom_usuario, id))
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya está registrado' });

    if (password && password.length < 6)
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });

    const hash = password ? await bcrypt.hash(password, 10) : null;
    await actualizarUsuarioBD(id, id_afiliado, rol, nom_usuario, hash, master);
    const completo = await obtenerUsuarioCompleto(id);

    res.json({ success: true, message: 'Usuario actualizado correctamente', data: completo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Desactiva un usuario impidiendo que el master se desactive a sí mismo.
 * Pasa el master al modelo para garantizar atomicidad con el trigger.
 */
const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const master  = req.user;

    if (parseInt(id) === master.id_usuario)
      return res.status(400).json({ success: false, message: 'No puedes desactivar tu propio usuario' });

    await desactivarUsuarioBD(id, master);
    const desactivado = await obtenerUsuarioCompleto(id);

    res.json({ success: true, message: 'Usuario desactivado correctamente', data: desactivado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Reactiva un usuario previamente desactivado.
 * Pasa el master al modelo para garantizar atomicidad con el trigger.
 */
const reactivarUsuario = async (req, res) => {
  try {
    const { id }  = req.params;
    const master  = req.user;

    await reactivarUsuarioBD(id, master);
    const reactivado = await obtenerUsuarioCompleto(id);

    res.json({ success: true, message: 'Usuario reactivado correctamente', data: reactivado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Lista el historial de cambios de usuarios con filtros opcionales de fecha e ID.
 */
const listarHistorialUsuario = async (req, res) => {
  try {
    const { id_usuario, desde, hasta, limite = 100 } = req.query;
    const rows = await listarHistorialBD(id_usuario, desde, hasta, limite);
    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Lista todos los usuarios filtrable por estado activo/inactivo.
 */
const listarUsuarios = async (req, res) => {
  try {
    const rows = await listarUsuariosBD(req.query.estado);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Retorna afiliados habilitados formateados para el select del formulario.
 */
const obtenerAfiliadosParaSelect = async (req, res) => {
  try {
    const rows = await buscarAfiliadosParaSelect(req.query.search);
    const data = rows.map(a => ({
      value:      a.id_afiliado,
      label:      a.nombre_completo,
      searchText: `${a.ci} ${a.extension} - ${a.nombre_completo}`,
      ci:         a.ci,
      extension:  a.extension,
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

/**
 * Retorna los datos de un afiliado habilitado por su ID.
 */
const obtenerAfiliadoPorId = async (req, res) => {
  try {
    const row = await obtenerAfiliadoPorIdBD(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Afiliado no encontrado' });
    res.json({ success: true, data: { value: row.id_afiliado, label: row.nombre_completo, ci: row.ci, extension: row.extension } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
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
  obtenerAfiliadoPorId,
};