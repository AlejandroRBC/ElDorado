import { useState, useCallback } from 'react';
import { notifications }         from '@mantine/notifications';
import { directorioService }     from '../services/directorioService';

// ============================================================
// HOOK useGuardarGestion
// Procesa el formulario del modal y aplica las operaciones
// necesarias (asignar / reemplazar / cerrar) para cada fila.
//
// Lógica por fila:
//   - Tiene afiliado + sin cargo previo   → asignarCargo
//   - Tiene afiliado + cargo previo mismo → sin cambio
//   - Tiene afiliado + cargo previo distinto → reemplazarCargo
//   - Sin afiliado  + cargo previo activo  → cerrarCargo
//   - Sin afiliado  + sin cargo previo     → skip
// ============================================================

export const useGuardarGestion = () => {
  const [guardando, setGuardando] = useState(false);

  /**
   * @param {Object}   params
   * @param {number}   params.idGestion     - ID de la gestión objetivo
   * @param {Array}    params.filasModal     - Estado de las 12 filas del modal
   *                   cada fila: { id_secretaria, id_directorio, id_afiliado_nuevo }
   * @param {Function} params.onSuccess     - callback al terminar con éxito
   */
  const guardar = useCallback(async ({ idGestion, filasModal, onSuccess }) => {
    if (!idGestion) return;

    setGuardando(true);
    const errores = [];
    let cambios  = 0;

    try {
      for (const fila of filasModal) {
        const {
          id_secretaria,
          id_directorio,        // null si no existía
          id_afiliado_prev,     // el que había antes
          id_afiliado_nuevo,    // el que ingresó el usuario (null = vacío)
        } = fila;

        const tieneNuevo  = !!id_afiliado_nuevo;
        const teniaPrevio = !!id_directorio;
        const mismoAfil   = teniaPrevio && id_afiliado_prev === id_afiliado_nuevo;

        try {
          if (tieneNuevo && !teniaPrevio) {
            // Caso: asignación nueva
            await directorioService.asignarCargo({
              id_gestion:    idGestion,
              id_secretaria,
              id_afiliado:   id_afiliado_nuevo,
            });
            cambios++;

          } else if (tieneNuevo && teniaPrevio && !mismoAfil) {
            // Caso: cambio de titular
            await directorioService.reemplazarCargo(id_directorio, {
              id_afiliado_nuevo,
            });
            cambios++;

          } else if (!tieneNuevo && teniaPrevio) {
            // Caso: se dejó vacío lo que antes tenía titular → cerrar
            await directorioService.cerrarCargo(id_directorio);
            cambios++;
          }
          // mismoAfil o ambos vacíos → sin cambio, skip
        } catch (err) {
          errores.push(`${fila.nom_secretaria}: ${err.message}`);
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
          title:   '⚠️ Guardado parcial',
          message: `${cambios} ok — ${errores.length} error(es): ${errores.join(' | ')}`,
          color:   'yellow',
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