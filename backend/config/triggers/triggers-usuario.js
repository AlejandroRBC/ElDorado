const db = require('../db');

// ============================================
// TRIGGERS DE HISTORIAL DE USUARIO
// ============================================
function crearTriggersHistorial() {
  
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
        COALESCE((SELECT nombre || ' ' || paterno FROM afiliado WHERE id_afiliado = NEW.id_afiliado), 'SIN AFILIADO'),
        NEW.rol,
        '➕ | Se creó usuario: ' || NEW.nom_usuario || ' con rol: ' || NEW.rol,
        COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
        COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
      );
    END;
  `);

  // Trigger: Registro de desactivación de usuario
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_usuario_desactivar
    AFTER UPDATE ON usuario
    WHEN OLD.es_vigente = 1 AND NEW.es_vigente = 0
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
        COALESCE((SELECT nombre || ' ' || paterno FROM afiliado WHERE id_afiliado = NEW.id_afiliado), 'SIN AFILIADO'),
        NEW.rol,
        '❌ | Usuario DESACTIVADO: ' || NEW.nom_usuario,
        COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
        COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
      );
    END;
  `);

  // Trigger: Registro de reactivación de usuario
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_usuario_reactivar
    AFTER UPDATE ON usuario
    WHEN OLD.es_vigente = 0 AND NEW.es_vigente = 1
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
        COALESCE((SELECT nombre || ' ' || paterno FROM afiliado WHERE id_afiliado = NEW.id_afiliado), 'SIN AFILIADO'),
        NEW.rol,
        '✅ | Usuario REACTIVADO: ' || NEW.nom_usuario,
        COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
        COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
      );
    END;
  `);

  // Trigger: Registro de actualización de usuario
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_usuario_update
    AFTER UPDATE ON usuario
    WHEN OLD.es_vigente = NEW.es_vigente
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
      SELECT
        NEW.id_usuario,
        NEW.nom_usuario,
        COALESCE((SELECT nombre || ' ' || paterno FROM afiliado WHERE id_afiliado = NEW.id_afiliado), 'SIN AFILIADO'),
        NEW.rol,
        '✏️ ' ||
        CASE WHEN OLD.nom_usuario != NEW.nom_usuario 
          THEN ' | Usuario: "' || OLD.nom_usuario || '" → "' || NEW.nom_usuario || '"' 
          ELSE '' 
        END ||
        CASE WHEN OLD.rol != NEW.rol 
          THEN ' | Rol: "' || OLD.rol || '" → "' || NEW.rol || '"' 
          ELSE '' 
        END ||
        CASE WHEN OLD.password != NEW.password 
          THEN ' | Contraseña actualizada' 
          ELSE '' 
        END,
        COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
        COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema');
    END;
  `);
}

crearTriggersHistorial();

module.exports = { crearTriggersHistorial };