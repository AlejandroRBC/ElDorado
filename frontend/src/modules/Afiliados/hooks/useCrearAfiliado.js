import { useState } from 'react';
import { afiliadosService } from '../services/afiliadosService';
import { notifications } from '@mantine/notifications';

export const useCrearAfiliado = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [afiliadoCreado, setAfiliadoCreado] = useState(null);

  const crearAfiliadoCompleto = async (datos) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // 1. Validar datos básicos
      if (!datos.ci || !datos.nombre || !datos.paterno) {
        throw new Error('CI, Nombre y Apellido Paterno son requeridos');
      }

      
    

      // 3. Preparar datos básicos del afiliado
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

      console.log('📝 Creando afiliado:', datosBasicos);

      // 4. Crear afiliado en backend
      const respuestaCrear = await afiliadosService.crear(datosBasicos);
      
      if (!respuestaCrear.afiliado) {
        throw new Error('No se recibió el afiliado creado del servidor');
      }

      const afiliadoId = respuestaCrear.afiliado.id || respuestaCrear.afiliado.id_afiliado;
      console.log('✅ Afiliado creado con ID:', afiliadoId);

      // 5. Subir foto si existe
      if (datos.foto) {
        try {
          console.log('📸 Subiendo foto...');
          await afiliadosService.subirFotoPerfil(afiliadoId, datos.foto);
          console.log('✅ Foto subida exitosamente');
        } catch (fotoError) {
          console.warn('⚠️ No se pudo subir la foto:', fotoError);
        }
      }

      // 6. Asignar TODOS los puestos seleccionados
      const puestosAsignados = [];
      for (const puesto of datos.puestos) {
        try {
          console.log(`🏪 Asignando puesto ${puesto.nroPuesto}-${puesto.fila}-${puesto.cuadra}...`);
          
          const puestoData = {
            fila: puesto.fila,
            cuadra: puesto.cuadra,
            nroPuesto: parseInt(puesto.nroPuesto),
            rubro: puesto.rubro || '',
            tiene_patente: puesto.tiene_patente || false,
            razon: 'ASIGNADO'
          };
          
          const resultado = await afiliadosService.asignarPuesto(afiliadoId, puestoData);
          puestosAsignados.push(resultado);
          console.log(`✅ Puesto asignado: ${puesto.nroPuesto}-${puesto.fila}-${puesto.cuadra}`);
        } catch (puestoError) {
          console.error(`❌ Error asignando puesto ${puesto.nroPuesto}:`, puestoError);
          throw new Error(`Error al asignar puesto ${puesto.nroPuesto}: ${puestoError.message}`);
        }
      }

      // 7. Preparar respuesta
      const resultadoCompleto = {
        ...respuestaCrear,
        id: afiliadoId,
        puestos_asignados: puestosAsignados.length,
        datosCompletos: datos
      };

      setAfiliadoCreado(resultadoCompleto);
      setSuccess(true);
      
      notifications.show({
        title: '✅ Éxito',
        message: `Afiliado creado con ${puestosAsignados.length} puesto${puestosAsignados.length !== 1 ? 's' : ''}`,
        color: 'green'
      });

      return {
        exito: true,
        datos: resultadoCompleto,
        mensaje: 'Afiliado creado exitosamente'
      };

    } catch (err) {
      const mensajeError = err.message || 'Error al crear afiliado';
      console.error('❌ Error en crearAfiliadoCompleto:', err);
      setError(mensajeError);
      
      notifications.show({
        title: '❌ Error',
        message: mensajeError,
        color: 'red'
      });
      
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