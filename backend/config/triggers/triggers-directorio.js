const db = require('../db');

// ============================================================
// TRIGGERS DE HISTORIAL DE DIRECTORIO
//
// Estrategia DELETE:
//   - trg_directorio_ingreso → AFTER INSERT  (igual que antes)
//   - trg_directorio_egreso  → BEFORE DELETE (nuevo)
//     BEFORE en lugar de AFTER para poder leer OLD.* antes
//     de que la fila desaparezca de la tabla.
//
// historial_directorio ahora guarda id_afiliado e id_gestion
// directamente, así el historial se puede consultar incluso
// después de que el registro de directorio sea borrado.
// ============================================================

function crearTriggersDirectorio() {
  db.serialize(() => {

    db.run(`DROP TRIGGER IF EXISTS trg_directorio_ingreso`);
    db.run(`DROP TRIGGER IF EXISTS trg_directorio_egreso`);

    // ── Trigger: Ingreso al Directorio (AFTER INSERT) ────────
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_directorio_ingreso
      AFTER INSERT ON directorio
      BEGIN
        INSERT INTO historial_directorio (
          id_directorio,
          id_afiliado,
          id_gestion,
          nom_afiliado,
          nom_secretaria,
          gestion_label,
          tipo,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_directorio,
          NEW.id_afiliado,
          NEW.id_gestion,
          COALESCE(
            (SELECT nombre || ' ' || paterno || COALESCE(' ' || NULLIF(materno,''), '')
             FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
            'SIN AFILIADO'
          ),
          COALESCE(
            (SELECT nombre FROM secretaria WHERE id_secretaria = NEW.id_secretaria),
            'SIN SECRETARÍA'
          ),
          COALESCE(
            (SELECT CAST(anio_inicio AS TEXT) || '-' || CAST(anio_fin AS TEXT)
             FROM gestion WHERE id_gestion = NEW.id_gestion),
            'SIN GESTIÓN'
          ),
          'INGRESO',
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_directorio_ingreso:', err.message); });

    // ── Trigger: Egreso del Directorio (BEFORE DELETE) ───────
    // BEFORE para leer OLD.* antes de que la fila desaparezca.
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_directorio_egreso
      BEFORE DELETE ON directorio
      BEGIN
        INSERT INTO historial_directorio (
          id_directorio,
          id_afiliado,
          id_gestion,
          nom_afiliado,
          nom_secretaria,
          gestion_label,
          tipo,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          OLD.id_directorio,
          OLD.id_afiliado,
          OLD.id_gestion,
          COALESCE(
            (SELECT nombre || ' ' || paterno || COALESCE(' ' || NULLIF(materno,''), '')
             FROM afiliado WHERE id_afiliado = OLD.id_afiliado),
            'SIN AFILIADO'
          ),
          COALESCE(
            (SELECT nombre FROM secretaria WHERE id_secretaria = OLD.id_secretaria),
            'SIN SECRETARÍA'
          ),
          COALESCE(
            (SELECT CAST(anio_inicio AS TEXT) || '-' || CAST(anio_fin AS TEXT)
             FROM gestion WHERE id_gestion = OLD.id_gestion),
            'SIN GESTIÓN'
          ),
          'EGRESO',
          COALESCE((SELECT nom_usuario_master FROM usuario_sesion WHERE id = 1), 'sistema'),
          COALESCE((SELECT nom_afiliado_master FROM usuario_sesion WHERE id = 1), 'sistema')
        );
      END;
    `, (err) => { if (err) console.error('Error trg_directorio_egreso:', err.message); });

  });
}

crearTriggersDirectorio();

module.exports = { crearTriggersDirectorio };