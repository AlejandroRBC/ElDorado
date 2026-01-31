import { useState, useEffect } from 'react';
import { afiliadosService } from '../services/afiliadosService';

export function useAfiliadosList() {
  const [afiliados, setAfiliados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    cargarAfiliados();
  }, []);

  const cargarAfiliados = async () => {
    try {
      setLoading(true);
      const response = await afiliadosService.getAfiliados();
      if (response.success) {
        setAfiliados(response.data);
        setError(null);
      } else {
        throw new Error('Error al cargar afiliados');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    afiliados,
    loading,
    error,
    recargar: cargarAfiliados
  }
}