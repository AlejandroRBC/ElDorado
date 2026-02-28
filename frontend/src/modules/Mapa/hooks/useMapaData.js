// src/modules/Mapa/hooks/useMapaData.js
import { useState, useEffect } from 'react';
import { TODOS_LOS_PUESTOS } from '../data/puestos';
import api from '../../../api/axiosConfig';

const obtenerPuestosConAfiliado = async () => {
  const response = await api.get('/puestos/listar');
  return response.data;
};

export const obtenerAfiliadoCompleto = async (idAfiliado) => {
  const response = await api.get(`/afiliados/${idAfiliado}`);
  return response.data;
};

export const useMapaData = () => {
  const [puestosEnriquecidos, setPuestosEnriquecidos] = useState(TODOS_LOS_PUESTOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const datosBD = await obtenerPuestosConAfiliado();

        const mapaBD = {};
        datosBD.forEach(p => {
          if (p.nroPuesto >= 10000) return;
          const key = `${p.nroPuesto}_${p.fila}`;
          mapaBD[key] = p;
        });

        const enriquecidos = TODOS_LOS_PUESTOS.map(coordenada => {
          if (coordenada.esPaso) return coordenada;

          const key = `${coordenada.nroPuesto}_${coordenada.fila}`;
          const datoBD = mapaBD[key];

          if (!datoBD) return { ...coordenada, estado: 'libre', id_afiliado: null, afiliadoInfo: null };

          let estado;
          if (datoBD.id_afiliado && datoBD.tiene_patente === 1) estado = 'con_patente';
          else if (datoBD.id_afiliado && datoBD.tiene_patente === 0) estado = 'sin_patente';
          else estado = 'libre';

          // Guardar info básica del afiliado para búsqueda y dropdown
          // El endpoint listar devuelve: apoderado (nombre completo) y ci
          const afiliadoInfo = datoBD.id_afiliado ? {
            id: datoBD.id_afiliado,
            nombre: datoBD.apoderado || '',   // "nombre paterno materno"
            ci: datoBD.ci || '',
          } : null;

          return {
            ...coordenada,
            estado,
            id_puesto_bd: datoBD.id_puesto,
            id_afiliado: datoBD.id_afiliado || null,
            afiliadoInfo,                      // para búsqueda y dropdown
            tiene_patente: datoBD.tiene_patente,
            rubro: datoBD.rubro,
          };
        });

        setPuestosEnriquecidos(enriquecidos);
        setError(null);
      } catch (err) {
        console.error('Error cargando datos del mapa:', err);
        setError(err);
        setPuestosEnriquecidos(TODOS_LOS_PUESTOS.map(p => ({ ...p, estado: 'libre', id_afiliado: null, afiliadoInfo: null })));
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  return { puestosEnriquecidos, loading, error };
};
