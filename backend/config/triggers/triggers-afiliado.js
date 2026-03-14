const db = require('../db');

// ============================================
// TRIGGERS DE HISTORIAL DE AFILIADO
// ============================================
function crearTriggersAfiliado() {
  db.serialize(() => {

    db.run(`DROP TRIGGER IF EXISTS trg_afiliado_insert`);
    db.run(`DROP TRIGGER IF EXISTS trg_afiliado_update_datos`);
    db.run(`DROP TRIGGER IF EXISTS trg_afiliado_desafiliacion`);
    db.run(`DROP TRIGGER IF EXISTS trg_afiliado_reafiliacion`);

    // ── Trigger: Nueva afiliación (INSERT) ──
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_afiliado_insert
      AFTER INSERT ON afiliado
      BEGIN
        INSERT INTO historial_afiliado (
          id_afiliado,
          nom_afiliado,
          tipo,
          detalle,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_afiliado,
          NEW.nombre || ' ' || NEW.paterno || COALESCE(' ' || NULLIF(NEW.materno,''), ''),
          'AFILIACION',
          'Se afilió al gremio. CI: ' || NEW.ci || ' ' || COALESCE(NEW.extension, 'LP'),
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_afiliado_insert:', err.message); });

    // ── Trigger: Modificación de datos personales (UPDATE sin cambio de es_habilitado) ──
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_afiliado_update_datos
      AFTER UPDATE ON afiliado
      WHEN CAST(OLD.es_habilitado AS INTEGER) = CAST(NEW.es_habilitado AS INTEGER)
      BEGIN
        INSERT INTO historial_afiliado (
          id_afiliado,
          nom_afiliado,
          tipo,
          detalle,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_afiliado,
          NEW.nombre || ' ' || NEW.paterno || COALESCE(' ' || NULLIF(NEW.materno,''), ''),
          'MODIFICACION',
          CASE WHEN OLD.ci != NEW.ci
            THEN 'CI: ' || OLD.ci || ' → ' || NEW.ci || ' | '
            ELSE '' END ||
          CASE WHEN OLD.extension != NEW.extension
            THEN 'Extensión: ' || OLD.extension || ' → ' || NEW.extension || ' | '
            ELSE '' END ||
          CASE WHEN OLD.nombre != NEW.nombre
            THEN 'Nombre: ' || OLD.nombre || ' → ' || NEW.nombre || ' | '
            ELSE '' END ||
          CASE WHEN OLD.paterno != NEW.paterno
            THEN 'Paterno: ' || OLD.paterno || ' → ' || NEW.paterno || ' | '
            ELSE '' END ||
          CASE WHEN COALESCE(OLD.materno,'') != COALESCE(NEW.materno,'')
            THEN 'Materno: ' || COALESCE(OLD.materno,'—') || ' → ' || COALESCE(NEW.materno,'—') || ' | '
            ELSE '' END ||
          CASE WHEN COALESCE(OLD.sexo,'') != COALESCE(NEW.sexo,'')
            THEN 'Sexo: ' || COALESCE(OLD.sexo,'—') || ' → ' || COALESCE(NEW.sexo,'—') || ' | '
            ELSE '' END ||
          CASE WHEN COALESCE(OLD.fecNac,'') != COALESCE(NEW.fecNac,'')
            THEN 'Fec. Nac: ' || COALESCE(OLD.fecNac,'—') || ' → ' || COALESCE(NEW.fecNac,'—') || ' | '
            ELSE '' END ||
          CASE WHEN COALESCE(OLD.telefono,'') != COALESCE(NEW.telefono,'')
            THEN 'Teléfono: ' || COALESCE(OLD.telefono,'—') || ' → ' || COALESCE(NEW.telefono,'—') || ' | '
            ELSE '' END ||
          CASE WHEN COALESCE(OLD.ocupacion,'') != COALESCE(NEW.ocupacion,'')
            THEN 'Ocupación: ' || COALESCE(OLD.ocupacion,'—') || ' → ' || COALESCE(NEW.ocupacion,'—') || ' | '
            ELSE '' END ||
          CASE WHEN COALESCE(OLD.direccion,'') != COALESCE(NEW.direccion,'')
            THEN 'Dirección actualizada | '
            ELSE '' END ||
          CASE WHEN COALESCE(OLD.fecha_afiliacion,'') != COALESCE(NEW.fecha_afiliacion,'')
            THEN 'Fecha afiliación: ' || COALESCE(OLD.fecha_afiliacion,'—') || ' → ' || COALESCE(NEW.fecha_afiliacion,'—') || ' | '
            ELSE '' END,
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_afiliado_update_datos:', err.message); });

    // ── Trigger: Desafiliación (es_habilitado 1 → 0) ──
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_afiliado_desafiliacion
      AFTER UPDATE ON afiliado
      WHEN CAST(OLD.es_habilitado AS INTEGER) = 1 AND CAST(NEW.es_habilitado AS INTEGER) = 0
      BEGIN
        INSERT INTO historial_afiliado (
          id_afiliado,
          nom_afiliado,
          tipo,
          detalle,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_afiliado,
          NEW.nombre || ' ' || NEW.paterno || COALESCE(' ' || NULLIF(NEW.materno,''), ''),
          'DESAFILIACION',
          'Afiliado DESAFILIADO del gremio.',
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_afiliado_desafiliacion:', err.message); });

    // ── Trigger: Reafiliación (es_habilitado 0 → 1) ──
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_afiliado_reafiliacion
      AFTER UPDATE ON afiliado
      WHEN CAST(OLD.es_habilitado AS INTEGER) = 0 AND CAST(NEW.es_habilitado AS INTEGER) = 1
      BEGIN
        INSERT INTO historial_afiliado (
          id_afiliado,
          nom_afiliado,
          tipo,
          detalle,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_afiliado,
          NEW.nombre || ' ' || NEW.paterno || COALESCE(' ' || NULLIF(NEW.materno,''), ''),
          'REAFILIACION',
          'Afiliado REAFILIADO al gremio.',
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_afiliado_reafiliacion:', err.message); });

  });
}

crearTriggersAfiliado();

module.exports = { crearTriggersAfiliado };