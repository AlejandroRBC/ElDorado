//config/triggers/triggers-puestos.js
const db = require('../db');

// ============================================
// TRIGGERS DE HISTORIAL DE PUESTOS
// ============================================
function crearTriggersPuestos() {
  
  // Trigger: Asignación de puesto
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_puesto_asignacion
    AFTER INSERT ON tenencia_puesto
    WHEN NEW.razon = 'ASIGNADO'
    BEGIN
      INSERT INTO historial_puestos (
        tipo,
        afiliado,
        motivo,
        usuario,
        id_tenencia,
        id_puesto
      )
      VALUES (
        NEW.razon,
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
           FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ),
        'Al Afiliado: ' || 
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
           FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ) || 
        ' se le asignó el Puesto: ' || 
        COALESCE(
          (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto 
           FROM puesto WHERE id_puesto = NEW.id_puesto),
          'DESCONOCIDO'
        ),
        COALESCE(
          (SELECT nom_usuario_master || ' - ' || nom_afiliado_master 
           FROM usuario_sesion WHERE id = 1),
          'sistema - sistema'
        ),
        NEW.id_tenencia,
        NEW.id_puesto
      );
    END;
  `);

  // Trigger: Despojo de puesto (actualización de tenencia)
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_puesto_despojo
    AFTER UPDATE ON tenencia_puesto
    WHEN NEW.razon = 'DESPOJADO' AND OLD.razon != 'DESPOJADO'
    BEGIN
      INSERT INTO historial_puestos (
        tipo,
        afiliado,
        motivo,
        usuario,
        id_tenencia,
        id_puesto
      )
      VALUES (
        NEW.razon,
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
           FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ),
        'El Afiliado: ' || 
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
           FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ) || 
        ' fue DESPOJADO de su Puesto: ' || 
        COALESCE(
          (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto 
           FROM puesto WHERE id_puesto = NEW.id_puesto),
          'DESCONOCIDO'
        ),
        COALESCE(
          (SELECT nom_usuario_master || ' - ' || nom_afiliado_master 
           FROM usuario_sesion WHERE id = 1),
          'sistema - sistema'
        ),
        NEW.id_tenencia,
        NEW.id_puesto
      );
    END;
  `);
  // Trigger: Liberación de puesto (afiliado cede voluntariamente)
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_puesto_liberado
    AFTER UPDATE ON tenencia_puesto
    WHEN NEW.razon = 'LIBERADO' AND OLD.razon != 'LIBERADO'
    BEGIN
      INSERT INTO historial_puestos (
        tipo,
        afiliado,
        motivo,
        usuario,
        id_tenencia,
        id_puesto
      )
      VALUES (
        NEW.razon,
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
          FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ),
        'El Afiliado: ' || 
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
          FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ) || 
        ' ha LIBERADO voluntariamente su Puesto: ' || 
        COALESCE(
          (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto 
          FROM puesto WHERE id_puesto = NEW.id_puesto),
          'DESCONOCIDO'
        ),
        COALESCE(
          (SELECT nom_usuario_master || ' - ' || nom_afiliado_master 
          FROM usuario_sesion WHERE id = 1),
          'sistema - sistema'
        ),
        NEW.id_tenencia,
        NEW.id_puesto
      );
    END;
  `);

  // Trigger: Traspaso - quien ENTREGA el puesto
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_puesto_traspaso_salida
    AFTER UPDATE ON tenencia_puesto
    WHEN NEW.razon = 'TRASPASO' AND OLD.razon != 'TRASPASO'
    BEGIN
      INSERT INTO historial_puestos (
        tipo,
        afiliado,
        motivo,
        usuario,
        id_tenencia,
        id_puesto
      )
      VALUES (
        NEW.razon,
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
           FROM afiliado WHERE id_afiliado = OLD.id_afiliado),
          'SIN AFILIADO'
        ),
        'Traspasa su puesto: ' || 
        COALESCE(
          (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto 
           FROM puesto WHERE id_puesto = NEW.id_puesto),
          'DESCONOCIDO'
        ) || 
        ' a ' ||
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
           FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ),
        COALESCE(
          (SELECT nom_usuario_master || ' - ' || nom_afiliado_master 
           FROM usuario_sesion WHERE id = 1),
          'sistema - sistema'
        ),
        NEW.id_tenencia,
        NEW.id_puesto
      );
    END;
  `);

  // Trigger: Traspaso - quien RECIBE el puesto (INSERT)
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_puesto_traspaso_entrada
    AFTER INSERT ON tenencia_puesto
    WHEN NEW.razon = 'TRASPASO'
    BEGIN
      INSERT INTO historial_puestos (
        tipo,
        afiliado,
        motivo,
        usuario,
        id_tenencia,
        id_puesto
      )
      VALUES (
        NEW.razon,
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
           FROM afiliado WHERE id_afiliado = NEW.id_afiliado),
          'SIN AFILIADO'
        ),
        'Recibe el puesto: ' || 
        COALESCE(
          (SELECT 'Fila ' || fila || ' - Cuadra ' || cuadra || ' - N° ' || nroPuesto 
           FROM puesto WHERE id_puesto = NEW.id_puesto),
          'DESCONOCIDO'
        ) || 
        ' de ' ||
        COALESCE(
          (SELECT nombre || ' ' || paterno || COALESCE(' ' || materno, '') 
           FROM afiliado a
           JOIN tenencia_puesto t ON a.id_afiliado = t.id_afiliado
           WHERE t.id_puesto = NEW.id_puesto 
           AND t.id_tenencia != NEW.id_tenencia
           AND t.fecha_fin IS NOT NULL
           ORDER BY t.fecha_ini DESC
           LIMIT 1),
          'ANTERIOR PROPIETARIO'
        ),
        COALESCE(
          (SELECT nom_usuario_master || ' - ' || nom_afiliado_master 
           FROM usuario_sesion WHERE id = 1),
          'sistema - sistema'
        ),
        NEW.id_tenencia,
        NEW.id_puesto
      );
    END;
  `);

  // Trigger: Despojo por deshabilitación de afiliado
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_afiliado_deshabilitado
    AFTER UPDATE ON afiliado
    WHEN OLD.es_habilitado = 1 AND NEW.es_habilitado = 0
    BEGIN
      UPDATE tenencia_puesto
      SET razon = 'DESPOJADO',
          fecha_fin = CURRENT_DATE
      WHERE id_afiliado = NEW.id_afiliado
      AND fecha_fin IS NULL;
      
      UPDATE puesto
      SET disponible = 1
      WHERE id_puesto IN (
        SELECT id_puesto 
        FROM tenencia_puesto 
        WHERE id_afiliado = NEW.id_afiliado 
        AND fecha_fin = CURRENT_DATE
      );
    END;
  `);
}

crearTriggersPuestos();

module.exports = { crearTriggersPuestos };