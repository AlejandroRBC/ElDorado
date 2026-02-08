import { useState, useEffect } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export const useAfiliados = () => {
  const [afiliados, setAfiliados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [conexion, setConexion] = useState(null);

  // Cargar afiliados al inicio
  useEffect(() => {
    cargarAfiliados();
    probarConexion();
  }, []);

  const probarConexion = async () => {
    try {
      const resultado = await afiliadosService.probarConexion();
      setConexion(resultado);
    } catch (err) {
      setConexion({ error: err.message });
    }
  };

  const cargarAfiliados = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await afiliadosService.obtenerTodos();
      setAfiliados(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar afiliados');
      // Usar datos mock si hay error
      if (afiliados.length === 0) {
        setAfiliados(getMockAfiliados());
      }
    } finally {
      setCargando(false);
    }
  };

  const buscarAfiliados = async (termino) => {
    try {
      setCargando(true);
      const resultados = await afiliadosService.obtenerTodos({ search: termino });
      setAfiliados(resultados);
      return resultados;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setCargando(false);
    }
  };

const crearAfiliado = async (afiliadoData) => {
  try {
    const resultado = await afiliadosService.crear(afiliadoData);
    
    // Agregar el nuevo afiliado a la lista local
    const nuevoAfiliado = {
      id: resultado.afiliado.id,
      nombre: `${afiliadoData.nombre} ${afiliadoData.paterno}`,
      ci: `${afiliadoData.ci}-${afiliadoData.extension}`,
      rubro: 'Nuevo',
      patentes: [],
      estado: 'Activo',
      telefono: '',
      
      direccion: '',
      fechaRegistro: new Date().toISOString().split('T')[0],
      url_perfil: '/assets/perfiles/sinPerfil.png'
    };
    
    setAfiliados(prev => [...prev, nuevoAfiliado]);
    
    return { exito: true, datos: resultado };
  } catch (err) {
    console.error('Error al crear afiliado:', err);
    return { exito: false, error: err.message };
  }
};

// Y agregar en el return:
return {
  afiliados,
  cargando,
  error,
  conexion,
  cargarAfiliados,
  buscarAfiliados,
  crearAfiliado // Agregar esta línea
};
};

// Datos mock de respaldo
const getMockAfiliados = () => {
  return [
    {
      id: 1,
      nombre: 'Juan Pérez García',
      ci: '1234567-LP',
      rubro: 'Comerciante',
      patentes: ['101-A-1ra cuadra', '102-A-1ra cuadra'],
      estado: 'Activo',
      telefono: '76543210',
      email: '',
      direccion: 'Av. Principal #123',
      fechaRegistro: '2023-01-15',
      url_perfil: '/assets/perfiles/sinPerfil.png'
    },
    // ... más datos mock
  ];
};