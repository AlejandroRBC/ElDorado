import { useState, useCallback } from 'react';
import { notifications }         from '@mantine/notifications';
import { directorioService }     from '../services/directorioService';

// ============================================================
// HOOK useGuardarGestion (simplificado con DELETE)
//
// Lógica por fila — solo 4 casos posibles:
//
//   nuevo +  sin previo           → asignarCargo (INSERT)
//   nuevo + mismo previo          → skip
//   nuevo + distinto previo       → eliminarCargo + asignarCargo
//   sin nuevo + con previo        → eliminarCargo (DELETE)
//   sin nuevo + sin previo        → skip
//
// Ya no hay cerrarCargo ni reemplazarCargo.
// El trigger BEFORE DELETE graba el EGRESO automáticamente.
// ============================================================

export const useGuardarGestion = () => {
  const [guardando, setGuardando] = useState(false);

  const guardar = useCallback(async ({ idGestion, filasModal, onSuccess }) => {
    if (!idGestion) return;

    setGuardando(true);
    const errores = [];
    let cambios   = 0;

    try {
      for (const fila of filasModal) {
        const {
          nom_secretaria,
          id_secretaria,
          id_directorio,
          id_afiliado_prev,
          id_afiliado_nuevo,
        } = fila;

        const tieneNuevo  = !!id_afiliado_nuevo;
        const teniaPrevio = !!id_afiliado_prev;
        const mismoAfil   = teniaPrevio && Number(id_afiliado_prev) === Number(id_afiliado_nuevo);

        try {

          if (!tieneNuevo && !teniaPrevio) {
            // Ambos vacíos → nada que hacer
            continue;
          }

          if (tieneNuevo && mismoAfil) {
            // Sin cambio → nada que hacer
            continue;
          }

          if (!tieneNuevo && teniaPrevio) {
            // ── Quitar titular → DELETE ───────────────────────
            if (!id_directorio) {
              errores.push(`${nom_secretaria}: no se encontró el ID del cargo`);
              continue;
            }
            await directorioService.eliminarCargo(id_directorio);
            cambios++;
            continue;
          }

          if (tieneNuevo && teniaPrevio && !mismoAfil) {
            // ── Cambio de titular → DELETE + INSERT ───────────
            if (!id_directorio) {
              errores.push(`${nom_secretaria}: no se encontró el ID del cargo`);
              continue;
            }
            await directorioService.eliminarCargo(id_directorio);
            await directorioService.asignarCargo({
              id_gestion:    idGestion,
              id_secretaria,
              id_afiliado:   id_afiliado_nuevo,
            });
            cambios++;
            continue;
          }

          if (tieneNuevo && !teniaPrevio) {
            // ── Nuevo cargo → INSERT ──────────────────────────
            await directorioService.asignarCargo({
              id_gestion:    idGestion,
              id_secretaria,
              id_afiliado:   id_afiliado_nuevo,
            });
            cambios++;
          }

        } catch (err) {
          errores.push(`${nom_secretaria}: ${err.message}`);
        }
      }

      if (errores.length === 0) {
        notifications.show({
          title:     '✅ Guardado',
          message:   cambios > 0
            ? `${cambios} cambio${cambios !== 1 ? 's' : ''} aplicado${cambios !== 1 ? 's' : ''} correctamente`
            : 'Sin cambios que aplicar',
          color:     'green',
          autoClose: 4000,
        });
        if (onSuccess) onSuccess();
      } else {
        notifications.show({
          title:     '⚠️ Guardado parcial',
          message:   `${cambios} ok — ${errores.length} error(es): ${errores.join(' | ')}`,
          color:     'yellow',
          autoClose: 8000,
        });
        if (cambios > 0 && onSuccess) onSuccess();
      }

    } catch (err) {
      notifications.show({
        title:   '❌ Error',
        message: err.message || 'No se pudo guardar la gestión',
        color:   'red',
      });
    } finally {
      setGuardando(false);
    }
  }, []);

  return { guardar, guardando };
};