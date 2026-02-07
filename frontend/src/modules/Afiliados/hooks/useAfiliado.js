import { useState, useEffect } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export const useAfiliado = (id) => {
  const [afiliado, setAfiliado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarAfiliado = async () => {
    try {
      setCargando(true);
      setError(null);
      
      if (!id) {
        throw new Error('ID de afiliado no proporcionado');
      }
      
      const datos = await afiliadosService.obtenerPorId(id);
      setAfiliado(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar afiliado');
      console.error(`Error cargando afiliado ${id}:`, err);
      
      // Usar datos mock si hay error (para desarrollo)
      if (!afiliado) {
        setAfiliado(getMockAfiliado(id));
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarAfiliado();
    }
  }, [id]);

  return {
    afiliado,
    cargando,
    error,
    cargarAfiliado
  };
};

// Datos mock de respaldo
const getMockAfiliado = (id) => {
  const mockAfiliados = {
    1: {
      id: 1,
      nombreCompleto: 'Juan Pérez García',
      nombre: 'Juan',
      paterno: 'Pérez',
      materno: 'García',
      ci: '1234567-LP',
      ci_numero: '1234567',
      extension: 'LP',
      rubro: 'Comerciante',
      ocupacion: 'Comerciante',
      patentes: ['101-A-1ra cuadra', '102-A-1ra cuadra'],
      estado: 'Activo',
      es_habilitado: true,
      telefono: '76543210',
      email: 'juan@example.com',
      direccion: 'Av. Principal #123',
      fechaRegistro: '2023-01-15',
      fecha_afiliacion: '2023-01-15',
      url_perfil: '/assets/perfiles/sinPerfil.png',
      sexo: 'Masculino',
      edad: 38,
      puestos: [
        {
          id: 1,
          nro: 101,
          fila: 'A',
          cuadra: '1ra cuadra',
          fecha_obtencion: '2023-01-20',
          rubro: 'Comercio',
          estado: 'Activo'
        },
        {
          id: 2,
          nro: 102,
          fila: 'A',
          cuadra: '1ra cuadra',
          fecha_obtencion: '2023-03-10',
          rubro: 'Comercio',
          estado: 'Activo'
        }
      ]
    },
    2: {
      id: 2,
      nombreCompleto: 'María García Rodríguez',
      nombre: 'María',
      paterno: 'García',
      materno: 'Rodríguez',
      ci: '7654321-LP',
      ci_numero: '7654321',
      extension: 'LP',
      rubro: 'Servicios',
      ocupacion: 'Servicios',
      patentes: ['201-B-2da cuadra'],
      estado: 'Activo',
      es_habilitado: true,
      telefono: '71234567',
      email: 'maria@example.com',
      direccion: 'Calle Secundaria #456',
      fechaRegistro: '2023-02-10',
      fecha_afiliacion: '2023-02-10',
      url_perfil: '/assets/perfiles/sinPerfil.png',
      sexo: 'Femenino',
      edad: 33,
      puestos: [
        {
          id: 3,
          nro: 201,
          fila: 'B',
          cuadra: '2da cuadra',
          fecha_obtencion: '2023-02-15',
          rubro: 'Servicios',
          estado: 'Activo'
        }
      ]
    }
  };
  
  return mockAfiliados[id] || mockAfiliados[1];
};