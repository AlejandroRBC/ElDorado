// modules/Directorio/hooks/useDirectorio.js

// ============================================================
// HOOK useDirectorio
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { directorioService } from '../services/directorioService';
import { SECRETARIAS_BASE }  from '../constantes/secretarias';

/**
 * Dado un id_gestion, carga los cargos asignados y los combina
 * con la lista fija de secretarías para que las 12 filas
 * aparezcan siempre (con o sin afiliado asignado).
 */
export const useDirectorio = (idGestion) => {
  const [filas,    setFilas]    = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState(null);

  const cargarDirectorio = useCallback(async () => {
    if (!idGestion) return;
    try {
      setCargando(true);
      setError(null);

      const [secretarias, cargos] = await Promise.all([
        directorioService.obtenerSecretarias(),
        directorioService.obtenerPorGestion(idGestion),
      ]);

      // Usar secretarias del backend si están disponibles, si no el fallback local
      const baseSecretarias =
        secretarias.length > 0
          ? secretarias
          : SECRETARIAS_BASE.map((s) => ({ id_secretaria: null, nombre: s.nombre, orden: s.orden }));

      // Combinar: para cada secretaría buscamos si hay cargo activo en la gestión
      const filasCombinadas = baseSecretarias.map((sec) => {
        const cargo = cargos.find(
          (c) =>
            c.id_secretaria === sec.id_secretaria ||
            c.nom_secretaria === sec.nombre
        );
        return {
          id_secretaria:  sec.id_secretaria,
          nom_secretaria: sec.nombre,
          orden:          sec.orden,
          id_directorio:  cargo?.id_directorio || null,
          id_afiliado:    cargo?.id_afiliado    || null,
          nom_afiliado:   cargo?.nom_afiliado   || null,
          ci:             cargo?.ci             || null,
          extension:      cargo?.extension      || null,
          fecha_inicio:   cargo?.fecha_inicio   || null,
          fecha_fin:      cargo?.fecha_fin      || null,
          url_perfil:     cargo?.url_perfil     || null,
        };
      });

      setFilas(filasCombinadas);
    } catch (err) {
      console.error('useDirectorio:', err);
      setError(err.message || 'Error al cargar el directorio');
    } finally {
      setCargando(false);
    }
  }, [idGestion]);

  useEffect(() => { cargarDirectorio(); }, [cargarDirectorio]);

  return { filas, cargando, error, recargar: cargarDirectorio };
};