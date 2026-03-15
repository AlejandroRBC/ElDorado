// frontend/src/modules/Afiliados/hooks/useEditarAfiliado.js

// ============================================
// HOOK USE EDITAR AFILIADO
// ============================================

import { useState }         from 'react';
import { notifications }    from '@mantine/notifications';
import { afiliadosService } from '../services/afiliadosService';

/**
 * Gestiona la carga y actualización de un afiliado existente.
 * Incluye subida de nueva foto si se proporciona.
 *
 * id - ID del afiliado a editar
 */
export const useEditarAfiliado = (id) => {
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);
  const [afiliadoActual,  setAfiliadoActual]  = useState(null);

  /**
   * Carga los datos actuales del afiliado desde el backend.
   */
  const cargarAfiliado = async () => {
    try {
      setLoading(true);
      const data = await afiliadosService.obtenerPorId(id);
      setAfiliadoActual(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al cargar afiliado');
      notifications.show({
        title:   'Error',
        message: 'No se pudo cargar la información del afiliado',
        color:   'red',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza los datos del afiliado y sube la foto si es un File nuevo.
   * Valida campos requeridos antes de llamar al backend.
   */
  const actualizarAfiliado = async (datos) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!datos.ci || !datos.nombre) {
        throw new Error('CI, Nombre y Apellido Paterno son requeridos');
      }

      const datosActualizar = {
        ci:           datos.ci.trim(),
        extension:    datos.extension || 'LP',
        nombre:       datos.nombre.trim(),
        paterno:      datos.paterno.trim(),
        materno:      datos.materno?.trim() || '',
        sexo:         datos.sexo || 'M',
        fecNac:       datos.fecNac || null,
        telefono:     datos.telefono || '',
        ocupacion:    datos.ocupacion || '',
        direccion:    datos.direccion || '',
        es_habilitado: datos.es_habilitado !== undefined ? datos.es_habilitado : 1,
      };

      const resultado = await afiliadosService.actualizar(id, datosActualizar);

      // ── Subir nueva foto si es un File (no bloquea si falla) ──
      if (datos.foto && datos.foto instanceof File) {
        try {
          await afiliadosService.subirFotoPerfil(id, datos.foto);
        } catch (fotoError) {
          console.warn('No se pudo subir la foto:', fotoError);
        }
      }

      setSuccess(true);
      notifications.show({
        title:   'Éxito',
        message: 'Afiliado actualizado correctamente',
        color:   'green',
      });

      return { exito: true, datos: resultado };
    } catch (err) {
      const mensajeError = err.message || 'Error al actualizar afiliado';
      setError(mensajeError);
      notifications.show({ title: 'Error', message: mensajeError, color: 'red' });
      return { exito: false, error: mensajeError };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea el estado del hook a sus valores iniciales.
   */
  const reset = () => {
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  return { afiliadoActual, loading, error, success, cargarAfiliado, actualizarAfiliado, reset };
};