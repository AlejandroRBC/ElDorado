// modules/Directorio/hooks/useGestiones.js

// ============================================================
// HOOK useGestiones
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { directorioService } from '../services/directorioService';

/**
 * Carga la lista de gestiones disponibles y determina cuál
 * está activa para preseleccionarla en el Select.
 *
 * El label "vigente" se calcula dinámicamente comparando
 * el rango anio_inicio — anio_fin con el año actual,
 * sin depender del campo es_activa del backend.
 */
export const useGestiones = () => {
  const [gestiones,           setGestiones]           = useState([]);
  const [gestionActiva,       setGestionActiva]        = useState(null);
  const [gestionSeleccionada, setGestionSeleccionada]  = useState(null);
  const [cargando,            setCargando]             = useState(true);
  const [error,               setError]                = useState(null);

  const cargarGestiones = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const [lista, activa] = await Promise.all([
        directorioService.obtenerGestiones(),
        directorioService.obtenerGestionActiva().catch(() => null),
      ]);

      setGestiones(lista);
      setGestionActiva(activa);

      // Preseleccionar la activa si aún no hay selección
      if (activa && !gestionSeleccionada) {
        setGestionSeleccionada(String(activa.id_gestion));
      } else if (lista.length > 0 && !gestionSeleccionada) {
        setGestionSeleccionada(String(lista[0].id_gestion));
      }
    } catch (err) {
      console.error('useGestiones:', err);
      setError(err.message || 'Error al cargar gestiones');
    } finally {
      setCargando(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargarGestiones(); }, [cargarGestiones]);

  // ── Label de cada gestión con vigente dinámico ──
  const anioActual = new Date().getFullYear();

  /**
   * Determina si una gestión es vigente comparando el rango
   * anio_inicio — anio_fin con el año actual.
   */
  const esVigente = (g) =>
    anioActual >= g.anio_inicio && anioActual <= g.anio_fin;

  // Opciones formateadas para el componente Select de Mantine
  const opcionesSelect = gestiones.map((g) => ({
    value: String(g.id_gestion),
    label: `${g.anio_inicio} — ${g.anio_fin}${esVigente(g) ? ' (vigente)' : ''}`,
  }));

  return {
    gestiones,
    gestionActiva,
    gestionSeleccionada,
    setGestionSeleccionada,
    opcionesSelect,
    cargando,
    error,
    recargar: cargarGestiones,
  };
};