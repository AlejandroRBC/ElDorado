// ============================================
// HOOK USE CREAR AFILIADO
// ============================================

import { useState }         from 'react';
import { notifications }    from '@mantine/notifications';
import { afiliadosService } from '../services/afiliadosService';

/**
 * Gestiona la creación completa de un afiliado:
 * datos básicos, foto de perfil y asignación de puestos.
 */
export const useCrearAfiliado = () => {
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState(false);
  const [afiliadoCreado, setAfiliadoCreado] = useState(null);

  /**
   * Crea un afiliado completo con foto y puestos asignados.
   * Valida campos requeridos antes de llamar al backend.
   * Si la subida de foto falla, continúa con la creación.
   */
  const crearAfiliadoCompleto = async (datos) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!datos.ci || !datos.nombre || !datos.paterno) {
        throw new Error('CI, Nombre y Apellido Paterno son requeridos');
      }

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

      const respuestaCrear = await afiliadosService.crear(datosBasicos);

      if (!respuestaCrear.afiliado) {
        throw new Error('No se recibió el afiliado creado del servidor');
      }

      const afiliadoId = respuestaCrear.afiliado.id || respuestaCrear.afiliado.id_afiliado;

      // ── Subir foto si existe (no bloquea si falla) ──
      if (datos.foto) {
        try {
          await afiliadosService.subirFotoPerfil(afiliadoId, datos.foto);
        } catch (fotoError) {
          console.warn('No se pudo subir la foto:', fotoError);
        }
      }

      // ── Asignar todos los puestos seleccionados ──
      const puestosAsignados = [];
      for (const puesto of datos.puestos) {
        try {
          const puestoData = {
            fila:          puesto.fila,
            cuadra:        puesto.cuadra,
            nroPuesto:     parseInt(puesto.nroPuesto),
            rubro:         puesto.rubro || '',
            tiene_patente: puesto.tiene_patente || false,
            razon:         'ASIGNADO',
          };
          const resultado = await afiliadosService.asignarPuesto(afiliadoId, puestoData);
          puestosAsignados.push(resultado);
        } catch (puestoError) {
          console.error(`Error asignando puesto ${puesto.nroPuesto}:`, puestoError);
          throw new Error(`Error al asignar puesto ${puesto.nroPuesto}: ${puestoError.message}`);
        }
      }

      const resultadoCompleto = {
        ...respuestaCrear,
        id:                afiliadoId,
        puestos_asignados: puestosAsignados.length,
        datosCompletos:    datos,
      };

      setAfiliadoCreado(resultadoCompleto);
      setSuccess(true);

      // La notificación de éxito la muestra ModalAfiliado,
      // que ya conoce puestosSeleccionados.length y el flujo completo.

      return { exito: true, datos: resultadoCompleto, mensaje: 'Afiliado creado exitosamente' };
    } catch (err) {
      const mensajeError = err.message || 'Error al crear afiliado';
      console.error('Error en crearAfiliadoCompleto:', err);
      setError(mensajeError);
      notifications.show({ title: 'Error al crear afiliado', message: mensajeError, color: 'red', autoClose: 5000 });
      return { exito: false, error: mensajeError, datos: null };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea el estado del hook a sus valores iniciales.
   */
  const reset = () => {
    setLoading(false);
    setError('');
    setSuccess(false);
    setAfiliadoCreado(null);
  };

  return { crearAfiliadoCompleto, loading, error, success, afiliadoCreado, reset };
};