const db = require('../db');

// ============================================
// TRIGGERS DE HISTORIAL DE DIRECTORIO
// ============================================
function crearTriggersDirectorio() {
  db.serialize(() => {

    db.run(`DROP TRIGGER IF EXISTS trg_directorio_ingreso`);
    db.run(`DROP TRIGGER IF EXISTS trg_directorio_egreso`);

    // ── Trigger: Ingreso al Directorio (INSERT) ──
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_directorio_ingreso
      AFTER INSERT ON directorio
      BEGIN
        INSERT INTO historial_directorio (
          id_directorio,
          nom_afiliado,
          nom_secretaria,
          gestion_label,
          tipo,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_directorio,
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

    // ── Trigger: Egreso del Directorio (UPDATE fecha_fin NULL → fecha) ──
    db.run(`
      CREATE TRIGGER IF NOT EXISTS trg_directorio_egreso
      AFTER UPDATE ON directorio
      WHEN OLD.fecha_fin IS NULL AND NEW.fecha_fin IS NOT NULL
      BEGIN
        INSERT INTO historial_directorio (
          id_directorio,
          nom_afiliado,
          nom_secretaria,
          gestion_label,
          tipo,
          nom_usuario_master,
          nom_afiliado_master
        )
        VALUES (
          NEW.id_directorio,
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