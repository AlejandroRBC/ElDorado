const db = require('../db');

// ============================================================
// TRIGGERS DE HISTORIAL DE PUESTOS (versión DELETE)
//
// Estrategia:
//   tenencia_puesto ya no tiene fecha_fin.
//   Una fila presente = posesión activa.
//   Una fila borrada  = posesión terminada.
//
//   AFTER  INSERT → graba ASIGNACION o TRASPASO (entrada)
//   BEFORE DELETE → graba LIBERADO / DESPOJADO / TRASPASO (salida)
//
//   El trigger BEFORE DELETE puede leer OLD.* antes de que
//   la fila desaparezca, igual que hicimos con directorio.
//
//   trg_afiliado_deshabilitado: al deshabilitar un afiliado
//   hace DELETE de sus tenencias (el BEFORE DELETE se dispara
//   automáticamente y graba el historial por cada puesto).
// ============================================================

function crearTriggersPuestos() {

  // ── Limpiar triggers viejos ───────────────────────────────
  const viejos = [
    'trg_puesto_asignacion',
    'trg_puesto_despojo',
    'trg_puesto_liberado',
    'trg_puesto_traspaso_salida',
    'trg_puesto_traspaso_entrada',
    'trg_afiliado_deshabilitado',
  ];
  viejos.forEach((t) => db.run(`DROP TRIGGER IF EXISTS ${t}`));

  // ── AFTER INSERT: nueva asignación ───────────────────────
  // Cubre razón ASIGNADO y la entrada de un TRASPASO.
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_puesto_insert
    AFTER INSERT ON tenencia_puesto
    BEGIN
      INSERT INTO historial_puestos (
        tipo, afiliado, motivo, usuario, id_tenencia, id_puesto
      )
      VALUES (
        NEW.razon,
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || NULLIF(materno,''), '')
           FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ),
        CASE NEW.razon
          WHEN 'TRASPASO' THEN
            'Recibe puesto mediante TRASPASO: ' ||
            COALESCE(
              (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto
               FROM puesto WHERE id_puesto = NEW.id_puesto),
              'DESCONOCIDO'
            )
          ELSE
            'Al Afiliado: ' ||
            COALESCE(
              (SELECT nombre || ' ' || paterno || COALESCE(' ' || NULLIF(materno,''), '')
               FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
              'SIN AFILIADO'
            ) ||
            ' se le asignó el Puesto: ' ||
            COALESCE(
              (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto
               FROM puesto WHERE id_puesto = NEW.id_puesto),
              'DESCONOCIDO'
            )
        END,
        COALESCE(
          (SELECT nom_usuario_master || ' - ' || nom_afiliado_master
           FROM usuario_sesion WHERE id = 1),
          'sistema - sistema'
        ),
        NEW.id_tenencia,
        NEW.id_puesto
      );
    END;
  `, (err) => { if (err) console.error('Error trg_puesto_insert:', err.message); });


  // ── BEFORE DELETE: salida del afiliado del puesto ─────────
  // Cubre DESPOJADO, LIBERADO y la salida de un TRASPASO.
  // BEFORE para poder leer OLD.* antes de que se borre.
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_puesto_delete
    BEFORE DELETE ON tenencia_puesto
    BEGIN
      INSERT INTO historial_puestos (
        tipo, afiliado, motivo, usuario, id_tenencia, id_puesto
      )
      VALUES (
        OLD.razon,
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || NULLIF(materno,''), '')
           FROM afiliado WHERE id_afiliado = OLD.id_afiliado),
          'SIN AFILIADO'
        ),
        CASE OLD.razon
          WHEN 'TRASPASO' THEN
            'El Afiliado: ' ||
            COALESCE(
              (SELECT nombre || ' ' || paterno || COALESCE(' ' || NULLIF(materno,''), '')
               FROM afiliado WHERE id_afiliado = OLD.id_afiliado),
              'SIN AFILIADO'
            ) ||
            ' TRASPASÓ el Puesto: ' ||
            COALESCE(
              (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto
               FROM puesto WHERE id_puesto = OLD.id_puesto),
              'DESCONOCIDO'
            )
          WHEN 'DESPOJADO' THEN
            'El Afiliado: ' ||
            COALESCE(
              (SELECT nombre || ' ' || paterno || COALESCE(' ' || NULLIF(materno,''), '')
               FROM afiliado WHERE id_afiliado = OLD.id_afiliado),
              'SIN AFILIADO'
            ) ||
            ' fue DESPOJADO del Puesto: ' ||
            COALESCE(
              (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto
               FROM puesto WHERE id_puesto = OLD.id_puesto),
              'DESCONOCIDO'
            )
          ELSE
            'El Afiliado: ' ||
            COALESCE(
              (SELECT nombre || ' ' || paterno || COALESCE(' ' || NULLIF(materno,''), '')
               FROM afiliado WHERE id_afiliado = OLD.id_afiliado),
              'SIN AFILIADO'
            ) ||
            ' LIBERÓ el Puesto: ' ||
            COALESCE(
              (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto
               FROM puesto WHERE id_puesto = OLD.id_puesto),
              'DESCONOCIDO'
            )
        END,
        COALESCE(
          (SELECT nom_usuario_master || ' - ' || nom_afiliado_master
           FROM usuario_sesion WHERE id = 1),
          'sistema - sistema'
        ),
        OLD.id_tenencia,
        OLD.id_puesto
      );
    END;
  `, (err) => { if (err) console.error('Error trg_puesto_delete:', err.message); });


  // ── Al deshabilitar afiliado: DELETE sus tenencias ────────
  // El trigger trg_puesto_delete se dispara automáticamente
  // por cada fila borrada, grabando el historial con razón DESPOJADO.
  // También libera los puestos (disponible = 1).
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_afiliado_deshabilitado
    AFTER UPDATE ON afiliado
    WHEN CAST(OLD.es_habilitado AS INTEGER) = 1 AND CAST(NEW.es_habilitado AS INTEGER) = 0
    BEGIN
      -- Marcar razón DESPOJADO antes de borrar para que el trigger
      -- trg_puesto_delete grabe la razón correcta en historial
      UPDATE tenencia_puesto
        SET razon = 'DESPOJADO'
      WHERE id_afiliado = NEW.id_afiliado;

      -- Liberar los puestos
      UPDATE puesto
        SET disponible = 1
      WHERE id_puesto IN (
        SELECT id_puesto FROM tenencia_puesto
        WHERE id_afiliado = NEW.id_afiliado
      );

      -- Borrar tenencias (dispara trg_puesto_delete por cada fila)
      DELETE FROM tenencia_puesto
      WHERE id_afiliado = NEW.id_afiliado;
    END;
  `, (err) => { if (err) console.error('Error trg_afiliado_deshabilitado:', err.message); });

}

crearTriggersPuestos();

module.exports = { crearTriggersPuestos };