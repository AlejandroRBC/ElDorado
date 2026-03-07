// src/modules/Mapa/hooks/useMapaData.js
import { useState, useEffect } from 'react';
import { TODOS_LOS_PUESTOS } from '../data/puestos';
import api from '../../../api/axiosConfig';

// ============================================
// HOOK USE MAPA DATA
// ============================================

/**
 * Obtiene los puestos con afiliado desde el backend.
 * Endpoint: GET /puestos/listar
 *
 * @returns {Promise<Array>} Lista de puestos con datos del afiliado
 */
const obtenerPuestosConAfiliado = async () => {
  const response = await api.get('/puestos/listar');
  return response.data;
};

/**
 * Obtiene los datos completos de un afiliado por su ID.
 * Endpoint: GET /afiliados/:id
 *
 * @param {number|string} idAfiliado - ID del afiliado a obtener
 * @returns {Promise<Object>} Datos completos del afiliado
 */
export const obtenerAfiliadoCompleto = async (idAfiliado) => {
  const response = await api.get(`/afiliados/${idAfiliado}`);
  return response.data;
};

/**
 * Hook que carga y enriquece los puestos del mapa con datos de la BD.
 * Combina las coordenadas estáticas (TODOS_LOS_PUESTOS) con los datos
 * dinámicos del backend (afiliado asignado, patente, rubro).
 *
 * Estados posibles de un puesto:
 * - 'con_patente': tiene afiliado y patente activa
 * - 'sin_patente': tiene afiliado pero sin patente
 * - 'libre':       sin afiliado asignado
 *
 * @returns {{ puestosEnriquecidos: Array, loading: boolean, error: Error|null }}
 */
export const useMapaData = () => {
  const [puestosEnriquecidos, setPuestosEnriquecidos] = useState(TODOS_LOS_PUESTOS);
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState(null);

  useEffect(() => {
    /**
     * Carga los puestos desde BD y los combina con las coordenadas SVG.
     */
    const cargar = async () => {
      try {
        setLoading(true);
        const datosBD = await obtenerPuestosConAfiliado();

        // ── Construir mapa por clave nroPuesto_fila ──
        const mapaBD = {};
        datosBD.forEach(p => {
          if (p.nroPuesto >= 10000) return;
          const key = `${p.nroPuesto}_${p.fila}`;
          mapaBD[key] = p;
        });

        // ── Enriquecer coordenadas con datos de BD ──
        const enriquecidos = TODOS_LOS_PUESTOS.map(coordenada => {
          if (coordenada.esPaso) return coordenada;

          const key    = `${coordenada.nroPuesto}_${coordenada.fila}`;
          const datoBD = mapaBD[key];

          if (!datoBD) {
            return { ...coordenada, estado: 'libre', id_afiliado: null, afiliadoInfo: null };
          }

          // ── Determinar estado del puesto ──
          let estado;
          if (datoBD.id_afiliado && datoBD.tiene_patente === 1)      estado = 'con_patente';
          else if (datoBD.id_afiliado && datoBD.tiene_patente === 0) estado = 'sin_patente';
          else                                                         estado = 'libre';

          // ── Info básica del afiliado para búsqueda y dropdown ──
          const afiliadoInfo = datoBD.id_afiliado ? {
            id:     datoBD.id_afiliado,
            nombre: datoBD.apoderado || '',
            ci:     datoBD.ci || '',
          } : null;

          return {
            ...coordenada,
            estado,
            id_puesto_bd:  datoBD.id_puesto,
            id_afiliado:   datoBD.id_afiliado || null,
            afiliadoInfo,
            tiene_patente: datoBD.tiene_patente,
            rubro:         datoBD.rubro,
          };
        });

        setPuestosEnriquecidos(enriquecidos);
        setError(null);
      } catch (err) {
        console.error('Error cargando datos del mapa:', err);
        setError(err);
        setPuestosEnriquecidos(
          TODOS_LOS_PUESTOS.map(p => ({ ...p, estado: 'libre', id_afiliado: null, afiliadoInfo: null }))
        );
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  return { puestosEnriquecidos, loading, error };
};