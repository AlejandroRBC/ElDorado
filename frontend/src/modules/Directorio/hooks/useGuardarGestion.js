// modules/Directorio/hooks/useGuardarGestion.js

// ============================================================
// HOOK useGuardarGestion
// ============================================================

import { useState, useCallback } from 'react';
import { notifications }         from '@mantine/notifications';
import { directorioService }     from '../services/directorioService';

/**
 * Maneja el guardado del directorio aplicando los cambios por fila.
 *
 * Lógica por fila — 4 casos posibles:
 *  - sin nuevo + sin previo           → skip
 *  - nuevo + mismo previo             → skip
 *  - sin nuevo + con previo           → eliminarCargo (DELETE)
 *  - nuevo + distinto previo          → eliminarCargo + asignarCargo
 *  - nuevo + sin previo               → asignarCargo (INSERT)
 *
 * El trigger BEFORE DELETE graba el egreso en historial automáticamente.
 */
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
          // ── Ambos vacíos → nada que hacer ──
          if (!tieneNuevo && !teniaPrevio) continue;

          // ── Sin cambio → nada que hacer ──
          if (tieneNuevo && mismoAfil) continue;

          // ── Quitar titular → DELETE ──
          if (!tieneNuevo && teniaPrevio) {
            if (!id_directorio) {
              errores.push(`${nom_secretaria}: no se encontró el ID del cargo`);
              continue;
            }
            await directorioService.eliminarCargo(id_directorio);
            cambios++;
            continue;
          }

          // ── Cambio de titular → DELETE + INSERT ──
          if (tieneNuevo && teniaPrevio && !mismoAfil) {
            if (!id_directorio) {
              errores.push(`${nom_secretaria}: no se encontró el ID del cargo`);
              continue;
            }
            await directorioService.eliminarCargo(id_directorio);
            await directorioService.asignarCargo({ id_gestion: idGestion, id_secretaria, id_afiliado: id_afiliado_nuevo });
            cambios++;
            continue;
          }

          // ── Nuevo cargo → INSERT ──
          if (tieneNuevo && !teniaPrevio) {
            await directorioService.asignarCargo({ id_gestion: idGestion, id_secretaria, id_afiliado: id_afiliado_nuevo });
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