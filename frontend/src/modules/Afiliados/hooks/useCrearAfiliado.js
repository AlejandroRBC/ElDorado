// frontend/src/modules/Afiliados/hooks/useCrearAfiliado.js
import { useState } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export const useCrearAfiliado = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [afiliadoCreado, setAfiliadoCreado] = useState(null);

  const crearAfiliadoCompleto = async (datos) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setAfiliadoCreado(null);

    try {
      // 1. Validar datos básicos
      if (!datos.ci || !datos.nombre || !datos.paterno) {
        throw new Error('CI, Nombre y Apellido Paterno son requeridos');
      }

      // 2. Preparar datos básicos del afiliado
      const datosBasicos = {
        ci: datos.ci.trim(),
        extension: datos.extension || 'LP',
        nombre: datos.nombre.trim(),
        paterno: datos.paterno.trim(),
        materno: datos.materno?.trim() || '',
        sexo: datos.sexo || 'M',
        fecNac: datos.fecNac || null,
        telefono: datos.telefono || '',
        ocupacion: datos.ocupacion || '',
        direccion: datos.direccion || '',
      };

      console.log('Enviando datos al backend:', datosBasicos);

      // 3. Crear afiliado en backend
      const respuestaCrear = await afiliadosService.crear(datosBasicos);
      
      if (!respuestaCrear.afiliado) {
        throw new Error('No se recibió el afiliado creado del servidor');
      }

      const afiliadoId = respuestaCrear.afiliado.id || respuestaCrear.afiliado.id_afiliado;
      
      console.log('Afiliado creado con ID:', afiliadoId);

      // 4. Subir foto si existe
      if (datos.foto) {
        try {
          console.log('Subiendo foto...');
          await afiliadosService.subirFotoPerfil(afiliadoId, datos.foto);
          console.log('Foto subida exitosamente');
        } catch (fotoError) {
          console.warn('No se pudo subir la foto:', fotoError);
          // Continuamos aunque falle la foto
        }
      }

      // 5. Asignar puesto si se especificó
      const camposPuesto = [datos.cuadra_puesto, datos.fila_puesto, datos.nro_puesto];
      const algunCampoPuestoLleno = camposPuesto.some(campo => campo);
      const todosCamposPuestoLlenos = camposPuesto.every(campo => campo);
      
      if (algunCampoPuestoLleno && todosCamposPuestoLlenos) {
        try {
          console.log('Asignando puesto...');
          const puestoData = {
            fila: datos.fila_puesto,
            cuadra: datos.cuadra_puesto,
            nroPuesto: parseInt(datos.nro_puesto),
            rubro: datos.rubro_puesto || '',
            tiene_patente: datos.tiene_patente || false,
            razon: 'NUEVITO'
          };
          
          await afiliadosService.asignarPuesto(afiliadoId, puestoData);
          console.log('Puesto asignado exitosamente');
        } catch (puestoError) {
          console.warn('No se pudo asignar el puesto:', puestoError);
          // Continuamos aunque falle la asignación del puesto
        }
      }

      // 6. Preparar respuesta
      const resultadoCompleto = {
        ...respuestaCrear,
        id: afiliadoId,
        datosCompletos: datos
      };

      setAfiliadoCreado(resultadoCompleto);
      setSuccess(true);
      
      return {
        exito: true,
        datos: resultadoCompleto,
        mensaje: 'Afiliado creado exitosamente'
      };

    } catch (err) {
      const mensajeError = err.message || 'Error al crear afiliado';
      console.error('Error en crearAfiliadoCompleto:', err);
      setError(mensajeError);
      
      return {
        exito: false,
        error: mensajeError,
        datos: null
      };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError('');
    setSuccess(false);
    setAfiliadoCreado(null);
  };

  return {
    crearAfiliadoCompleto,
    loading,
    error,
    success,
    afiliadoCreado,
    reset
  };
};