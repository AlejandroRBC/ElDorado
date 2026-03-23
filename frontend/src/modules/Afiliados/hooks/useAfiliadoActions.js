
import { useState, useCallback } from 'react';
import { notifications }         from '@mantine/notifications';
import { afiliadosApi }          from '../services/afiliados.api';
import { puestosService }        from '../../GestionPatentesPuestos/service/puestosService';

// ─────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────

/**
 * Centraliza todas las acciones de escritura del módulo Afiliados.
 *
 * Estado compartido:
 *   loading       — true mientras cualquier acción está en curso
 *   error         — último mensaje de error (o null)
 *   accionActiva  — nombre de la acción en curso (para feedback granular)
 *
 * Todas las funciones son async y devuelven { exito, datos?, error? }.
 * Las notificaciones toast se emiten internamente.
 * El callback onSuccess (opcional) lo llama la acción al terminar con éxito,
 * dejando a la Page decidir qué recargar.
 */
export const useAfiliadoActions = () => {
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [accionActiva, setAccionActiva] = useState(null);

  // ── Helper interno ───────────────────────────────────────────
  const ejecutar = useCallback(async (nombre, fn) => {
    setLoading(true);
    setError(null);
    setAccionActiva(nombre);
    try {
      const resultado = await fn();
      return { exito: true, datos: resultado };
    } catch (err) {
      const msg = err.message || `Error en ${nombre}`;
      setError(msg);
      return { exito: false, error: msg };
    } finally {
      setLoading(false);
      setAccionActiva(null);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // CREAR AFILIADO
  // ─────────────────────────────────────────────────────────────

  /**
   * Crea un afiliado con sus datos básicos, foto (opcional) y puestos.
   * @param {{ ci, nombre, paterno, materno, sexo, fecNac, telefono,
   *           ocupacion, direccion, extension, foto?, puestos[] }} datos
   * @param {Function} [onSuccess]
   */
  const crear = useCallback(async (datos, onSuccess) => {
    if (!datos.ci || !datos.nombre || !datos.paterno) {
      const msg = 'CI, Nombre y Apellido Paterno son requeridos';
      notifications.show({ title: 'Campos requeridos', message: msg, color: 'orange', autoClose: 4000 });
      return { exito: false, error: msg };
    }

    const resultado = await ejecutar('crear', async () => {
      const datosBasicos = {
        ci:        datos.ci.trim(),
        extension: datos.extension || 'LP',
        nombre:    datos.nombre.trim(),
        paterno:   datos.paterno.trim(),
        materno:   datos.materno?.trim() || '',
        sexo:      datos.sexo || 'M',
        fecNac:    datos.fecNac || null,
        telefono:  datos.telefono || '',
        ocupacion: datos.ocupacion || '',
        direccion: datos.direccion || '',
      };

      const respuesta  = await afiliadosApi.crear(datosBasicos);
      const afiliadoId = respuesta.afiliado?.id || respuesta.afiliado?.id_afiliado;

      if (!afiliadoId) throw new Error('No se recibió el ID del afiliado creado');

      // Foto (no bloquea si falla)
      if (datos.foto) {
        try { await afiliadosApi.subirFotoPerfil(afiliadoId, datos.foto); }
        catch (e) { console.warn('No se pudo subir la foto:', e); }
      }

      // Puestos
      for (const puesto of (datos.puestos || [])) {
        await afiliadosApi.asignarPuesto(afiliadoId, {
          fila:          puesto.fila,
          cuadra:        puesto.cuadra,
          nroPuesto:     parseInt(puesto.nroPuesto),
          rubro:         puesto.rubro || '',
          tiene_patente: puesto.tiene_patente || false,
          razon:         'ASIGNADO',
        });
      }

      return { ...respuesta, id: afiliadoId };
    });

    if (resultado.exito) {
      notifications.show({
        title:   '✅ Afiliado creado',
        message: `${datos.nombre} ${datos.paterno} registrado correctamente`,
        color:   'green',
        autoClose: 4000,
      });
      onSuccess?.();
    } else {
      notifications.show({ title: 'Error al crear', message: resultado.error, color: 'red', autoClose: 5000 });
    }

    return resultado;
  }, [ejecutar]);

  // ─────────────────────────────────────────────────────────────
  // EDITAR AFILIADO
  // ─────────────────────────────────────────────────────────────

  /**
   * Actualiza datos de un afiliado y sube nueva foto si hay un File.
   * @param {string|number} id
   * @param {object} datos
   * @param {Function} [onSuccess]
   */
  const editar = useCallback(async (id, datos, onSuccess) => {
    if (!datos.ci || !datos.nombre) {
      const msg = 'CI y Nombre son requeridos';
      notifications.show({ title: 'Campos requeridos', message: msg, color: 'orange' });
      return { exito: false, error: msg };
    }

    const resultado = await ejecutar('editar', async () => {
      const datosActualizar = {
        ci:            datos.ci.trim(),
        extension:     datos.extension || 'LP',
        nombre:        datos.nombre.trim(),
        paterno:       datos.paterno.trim(),
        materno:       datos.materno?.trim() || '',
        sexo:          datos.sexo || 'M',
        fecNac:        datos.fecNac || null,
        telefono:      datos.telefono || '',
        ocupacion:     datos.ocupacion || '',
        direccion:     datos.direccion || '',
        es_habilitado: datos.es_habilitado !== undefined ? datos.es_habilitado : 1,
      };

      const respuesta = await afiliadosApi.actualizar(id, datosActualizar);

      if (datos.foto instanceof File) {
        try { await afiliadosApi.subirFotoPerfil(id, datos.foto); }
        catch (e) { console.warn('No se pudo subir la foto:', e); }
      }

      return respuesta;
    });

    if (resultado.exito) {
      notifications.show({ title: '✅ Afiliado actualizado', message: 'Los datos se guardaron correctamente', color: 'green' });
      onSuccess?.();
    } else {
      notifications.show({ title: 'Error al actualizar', message: resultado.error, color: 'red' });
    }

    return resultado;
  }, [ejecutar]);

  // ─────────────────────────────────────────────────────────────
  // DESAFILIAR
  // ─────────────────────────────────────────────────────────────

  /**
   * Deshabilita un afiliado (y despoja sus puestos en el backend).
   * @param {string|number} id
   * @param {Function} [onSuccess]
   */
  const desafiliar = useCallback(async (id, onSuccess) => {
    const resultado = await ejecutar('desafiliar', () =>
      afiliadosApi.deshabilitarAfiliado(id)
    );

    if (resultado.exito) {
      notifications.show({
        title:   '✅ Afiliado Desafiliado',
        message: 'El afiliado ha sido deshabilitado y sus puestos han sido despojados',
        color:   'green',
        autoClose: 5000,
      });
      onSuccess?.();
    } else {
      notifications.show({ title: 'Error al desafiliar', message: resultado.error, color: 'red' });
    }

    return resultado;
  }, [ejecutar]);

  // ─────────────────────────────────────────────────────────────
  // ASIGNAR PUESTO
  // ─────────────────────────────────────────────────────────────

  /**
   * Asigna un puesto a un afiliado.
   * @param {string|number} afiliadoId
   * @param {object} puestoData - { fila, cuadra, nroPuesto, rubro, tiene_patente }
   * @param {Function} [onSuccess]
   */
  const asignarPuesto = useCallback(async (afiliadoId, puestoData, onSuccess) => {
    const resultado = await ejecutar('asignarPuesto', () =>
      afiliadosApi.asignarPuesto(afiliadoId, { ...puestoData, razon: 'ASIGNADO' })
    );

    if (resultado.exito) {
      notifications.show({ title: '✅ Puesto asignado', message: 'El puesto fue asignado correctamente', color: 'green' });
      onSuccess?.();
    } else {
      notifications.show({ title: 'Error al asignar', message: resultado.error, color: 'red' });
    }

    return resultado;
  }, [ejecutar]);

  // ─────────────────────────────────────────────────────────────
  // DESASIGNAR PUESTO
  // ─────────────────────────────────────────────────────────────

  /**
   * Desasigna (despoja) un puesto de un afiliado.
   * @param {string|number} idAfiliado
   * @param {string|number} idPuesto
   * @param {string} razon
   * @param {Function} [onSuccess]
   */
  const desasignarPuesto = useCallback(async (idAfiliado, idPuesto, razon, onSuccess) => {
    const resultado = await ejecutar('desasignarPuesto', () =>
      afiliadosApi.desasignarPuesto(idAfiliado, idPuesto, razon)
    );

    if (resultado.exito) {
      notifications.show({ title: '✅ Puesto desasignado', message: 'El puesto fue liberado correctamente', color: 'green' });
      onSuccess?.();
    } else {
      notifications.show({ title: 'Error al desasignar', message: resultado.error, color: 'red' });
    }

    return resultado;
  }, [ejecutar]);

  // ─────────────────────────────────────────────────────────────
  // TRASPASO DE PUESTO (desde ficha de afiliado)
  // ─────────────────────────────────────────────────────────────

  /**
   * Ejecuta el traspaso de un puesto entre dos afiliados.
   * @param {{ puestos: number[], para: number, motivoDetallado?: string }} data
   * @param {Function} [onSuccess]
   */
  const traspasar = useCallback(async (data, onSuccess) => {
    const resultado = await ejecutar('traspasar', async () => {
      const res = await puestosService.traspasar({
        id_puesto:         data.puestos[0],
        id_nuevo_afiliado: data.para,
        razon:             data.motivoDetallado || 'TRASPASO',
      });
      if (!res.success) throw new Error(res.error || 'Error al traspasar');
      return res;
    });

    if (resultado.exito) {
      notifications.show({ title: '✅ Traspaso realizado', message: 'El puesto fue traspasado correctamente', color: 'green' });
      onSuccess?.();
    } else {
      notifications.show({ title: 'Error al traspasar', message: resultado.error, color: 'red' });
    }

    return resultado;
  }, [ejecutar]);

  // ─────────────────────────────────────────────────────────────

  return {
    // Estado compartido
    loading,
    error,
    accionActiva,
    // Acciones
    crear,
    editar,
    desafiliar,
    asignarPuesto,
    desasignarPuesto,
    traspasar,
  };
};