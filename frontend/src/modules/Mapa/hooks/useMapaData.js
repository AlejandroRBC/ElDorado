// src/modules/Mapa/hooks/useMapaData.js
import { useState, useEffect } from 'react';
import { obtenerPuestosConAfiliado } from '../service/mapaService';
import { TODOS_LOS_PUESTOS } from '../data/puestos';

/**
 * Cruza las coordenadas SVG con los datos reales de la BD.
 * 
 * La BD devuelve: { id_puesto, nroPuesto, fila, cuadra, tiene_patente, id_afiliado, ci, apoderado }
 * Las coordenadas tienen: { id, nroPuesto, fila, cuadra, x, y, width, height }
 * 
 * Se cruzan por: coordenada.id === bd.id_puesto
 * 
 * Resultado por puesto:
 *   - estado: 'con_patente' | 'sin_patente' | 'libre'
 *   - afiliado: { id, nombre, paterno, materno, ci, patentes, ocupacion, url_perfil } | null
 */
export const useMapaData = () => {
  const [puestosEnriquecidos, setPuestosEnriquecidos] = useState(TODOS_LOS_PUESTOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const datosBD = await obtenerPuestosConAfiliado();

        // Crear mapa rápido id_puesto -> datos BD
        const mapaBD = {};
        datosBD.forEach(p => {
          mapaBD[p.id_puesto] = p;
        });

        // Cruzar coordenadas con datos BD
        const enriquecidos = TODOS_LOS_PUESTOS.map(coordenada => {
          const datoBD = mapaBD[coordenada.id];

          if (!datoBD) {
            // Puesto no encontrado en BD, mostrar como libre
            return { ...coordenada, estado: 'libre', afiliado: null };
          }

          // Determinar estado del puesto
          let estado;
          if (datoBD.id_afiliado && datoBD.tiene_patente === 1) {
            estado = 'con_patente';   // verde
          } else if (datoBD.id_afiliado && datoBD.tiene_patente === 0) {
            estado = 'sin_patente';   // amarillo
          } else {
            estado = 'libre';         // rojo
          }

          // Construir objeto afiliado compatible con la Card
          // El endpoint listar devuelve: apoderado (nombre completo), ci, id_afiliado
          // La Card espera: nombre, paterno, materno, ci, patentes, ocupacion, url_perfil
          const afiliado = datoBD.id_afiliado ? {
            id: datoBD.id_afiliado,
            // apoderado viene como "nombre paterno materno" en un solo string
            nombre: datoBD.apoderado?.split(' ')[0] || '',
            paterno: datoBD.apoderado?.split(' ')[1] || '',
            materno: datoBD.apoderado?.split(' ')[2] || '',
            ci: datoBD.ci,
            patentes: [`${datoBD.nroPuesto}-${datoBD.fila}-${datoBD.cuadra}`],
            ocupacion: datoBD.rubro || null,
            url_perfil: null, // el endpoint listar no trae url_perfil
          } : null;

          return {
            ...coordenada,
            estado,
            afiliado,
            tiene_patente: datoBD.tiene_patente,
            rubro: datoBD.rubro,
          };
        });

        setPuestosEnriquecidos(enriquecidos);
        setError(null);
      } catch (err) {
        console.error('Error cargando datos del mapa:', err);
        setError(err);
        // En caso de error igual mostramos los puestos sin datos
        setPuestosEnriquecidos(TODOS_LOS_PUESTOS.map(p => ({
          ...p, estado: 'libre', afiliado: null
        })));
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  return { puestosEnriquecidos, loading, error };
};
