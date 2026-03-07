const db = require('../db');

// ============================================
// TRIGGERS DE HISTORIAL DE USUARIO
// ============================================
function crearTriggersHistorial() {
  db.serialize(() => {

    db.run(`DROP TRIGGER IF EXISTS trg_usuario_insert`);
    db.run(`DROP TRIGGER IF EXISTS trg_usuario_desactivar`);
    db.run(`DROP TRIGGER IF EXISTS trg_usuario_reactivar`);
    db.run(`DROP TRIGGER IF EXISTS trg_usuario_update`);

    // Trigger: Registro de creación de usuario
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_usuario_insert
      AFTER INSERT ON usuario
      BEGIN
        INSERT INTO historial_usuario (
          id_usuario,
          nom_usuario_esclavo,
          nom_afiliado_esclavo,
          rol,
          motivo,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_usuario,
          NEW.nom_usuario,
          COALESCE((SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') FROM afiliado WHERE id_afiliado = NEW.id_afiliado), 'SIN AFILIADO'),
          NEW.rol,
          'Se creo usuario: ' || NEW.nom_usuario || ' con rol: ' || NEW.rol,
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_usuario_insert:', err.message); });

    // Trigger: Registro de desactivación de usuario
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_usuario_desactivar
      AFTER UPDATE ON usuario
      WHEN CAST(OLD.es_vigente AS INTEGER) = 1 AND CAST(NEW.es_vigente AS INTEGER) = 0
      BEGIN
        INSERT INTO historial_usuario (
          id_usuario,
          nom_usuario_esclavo,
          nom_afiliado_esclavo,
          rol,
          motivo,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_usuario,
          NEW.nom_usuario,
          COALESCE((SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') FROM afiliado WHERE id_afiliado = NEW.id_afiliado), 'SIN AFILIADO'),
          NEW.rol,
          'Usuario DESACTIVADO: ' || NEW.nom_usuario,
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_usuario_desactivar:', err.message); });

    // Trigger: Registro de reactivación de usuario
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_usuario_reactivar
      AFTER UPDATE ON usuario
      WHEN CAST(OLD.es_vigente AS INTEGER) = 0 AND CAST(NEW.es_vigente AS INTEGER) = 1
      BEGIN
        INSERT INTO historial_usuario (
          id_usuario,
          nom_usuario_esclavo,
          nom_afiliado_esclavo,
          rol,
          motivo,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_usuario,
          NEW.nom_usuario,
          COALESCE((SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') FROM afiliado WHERE id_afiliado = NEW.id_afiliado), 'SIN AFILIADO'),
          NEW.rol,
          'Usuario REACTIVADO: ' || NEW.nom_usuario,
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_usuario_reactivar:', err.message); });

    // Trigger: Registro de actualización de usuario
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_usuario_update
      AFTER UPDATE ON usuario
      WHEN CAST(OLD.es_vigente AS INTEGER) = CAST(NEW.es_vigente AS INTEGER)
      BEGIN
        INSERT INTO historial_usuario (
          id_usuario,
          nom_usuario_esclavo,
          nom_afiliado_esclavo,
          rol,
          motivo,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_usuario,
          NEW.nom_usuario,
          COALESCE((SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') FROM afiliado WHERE id_afiliado = NEW.id_afiliado), 'SIN AFILIADO'),
          NEW.rol,
          CASE WHEN OLD.nom_usuario != NEW.nom_usuario
            THEN ' Usuario: ' || OLD.nom_usuario || ' -> ' || NEW.nom_usuario
            ELSE ''
          END ||
          CASE WHEN OLD.rol != NEW.rol
            THEN ' Rol: ' || OLD.rol || ' -> ' || NEW.rol
            ELSE ''
          END ||
          CASE WHEN OLD.password != NEW.password
            THEN ' Contrasena actualizada'
            ELSE ''
          END,
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_usuario_update:', err.message); });

  });
}

crearTriggersHistorial();

module.exports = { crearTriggersHistorial };